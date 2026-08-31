import { getConfig } from '../config.js';
import { alpacaClient } from '../alpaca/client.js';
import { marketScanner, ScannedOpportunity } from './scanner.js';
import { aiStrategyEngine, AgentDecision } from './strategyEngine.js';
import { riskEngine, RiskEvaluationResult } from './riskEngine.js';
import { orderExecutor } from './executor.js';
import { positionManager, PositionMonitoringReport } from './positionManager.js';
import { saveDecision, saveAuditTrail, DBDecision } from '../db/database.js';
import { agentMemory, PerformanceAnalytics } from './memory.js';

export type AgentStatus = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'SCANNING' | 'EXECUTING';

export interface AgentBrainState {
  status: AgentStatus;
  lastCycleTimestamp: string | null;
  cycleCount: number;
  currentStage: string;
  latestOpportunity: ScannedOpportunity | null;
  latestDecision: AgentDecision | null;
  latestRiskResult: RiskEvaluationResult | null;
  positionReports: PositionMonitoringReport[];
  analytics: PerformanceAnalytics;
  message: string;
}

export class AutonomousAgentLoop {
  private status: AgentStatus = 'STOPPED';
  private timer: NodeJS.Timeout | null = null;
  private cycleCount = 0;
  private listeners: Array<(state: AgentBrainState) => void> = [];

  private latestOpportunity: ScannedOpportunity | null = null;
  private latestDecision: AgentDecision | null = null;
  private latestRiskResult: RiskEvaluationResult | null = null;
  private latestPositionReports: PositionMonitoringReport[] = [];
  private currentStage = 'IDLE';
  private statusMessage = 'Agent is stopped';

  public getStatus(): AgentStatus {
    return this.status;
  }

  public start(): void {
    if (this.status === 'RUNNING') return;
    this.status = 'RUNNING';
    this.statusMessage = 'Autonomous agent started';
    console.log('[Agent Loop] Agent started.');
    this.notifyState();

    // Trigger immediate cycle, then set interval timer
    this.runCycle();
    const config = getConfig();
    this.timer = setInterval(() => {
      if (this.status === 'RUNNING') {
        this.runCycle();
      }
    }, config.scanIntervalMs);
  }

  public pause(): void {
    this.status = 'PAUSED';
    this.statusMessage = 'Agent paused (monitoring positions only, new trade entry halted)';
    console.log('[Agent Loop] Agent paused.');
    this.notifyState();
  }

  public stop(): void {
    this.status = 'STOPPED';
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.statusMessage = 'Agent stopped';
    this.currentStage = 'STOPPED';
    console.log('[Agent Loop] Agent stopped.');
    this.notifyState();
  }

  public async triggerManualScan(): Promise<void> {
    console.log('[Agent Loop] Manual scan requested.');
    await this.runCycle(true);
  }

  public subscribe(listener: (state: AgentBrainState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): AgentBrainState {
    const accountPromise = alpacaClient.getAccount();
    const positionsPromise = alpacaClient.getPositions();

    return {
      status: this.status,
      lastCycleTimestamp: new Date().toISOString(),
      cycleCount: this.cycleCount,
      currentStage: this.currentStage,
      latestOpportunity: this.latestOpportunity,
      latestDecision: this.latestDecision,
      latestRiskResult: this.latestRiskResult,
      positionReports: this.latestPositionReports,
      analytics: agentMemory.calculatePerformance(null, []),
      message: this.statusMessage,
    };
  }

  private notifyState(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  /**
   * Main Autonomous Execution Cycle:
   * 1. Monitor open positions
   * 2. Scan market for options opportunities
   * 3. AI Strategy Engine evaluation
   * 4. Deterministic Risk Engine & Risk Gates validation
   * 5. Paper Order Execution
   */
  public async runCycle(force = false): Promise<void> {
    if (this.status === 'STOPPED' && !force) return;
    this.cycleCount++;
    const cycleId = `cycle_${Date.now()}`;
    const timestamp = new Date().toISOString();

    console.log(`\n=================== [AGENT CYCLE #${this.cycleCount}] (${timestamp}) ===================`);
    saveAuditTrail({
      id: `${cycleId}_start`,
      timestamp,
      cycle_id: cycleId,
      stage: 'CYCLE_START',
      detail: `Autonomous cycle #${this.cycleCount} initiated`,
    });

    try {
      // Step 1: Account & Position Monitoring
      this.currentStage = 'POSITION_MONITORING';
      this.notifyState();
      const account = await alpacaClient.getAccount();
      const positions = await alpacaClient.getPositions();

      this.latestPositionReports = await positionManager.monitorPositions(positions);

      if (this.status === 'PAUSED' && !force) {
        this.statusMessage = 'Paused mode: Managed positions checked. New entry trade decisions paused.';
        this.currentStage = 'PAUSED_MONITORING';
        this.notifyState();
        return;
      }

      // Step 2: Market Data & Opportunity Scanning
      this.currentStage = 'MARKET_SCANNING';
      this.statusMessage = 'Scanning market for liquid options opportunities...';
      this.notifyState();

      const scannedOps = await marketScanner.scanUniverse();
      if (scannedOps.length === 0) {
        this.statusMessage = 'Scan completed. No tradable candidates discovered.';
        this.currentStage = 'IDLE';
        this.notifyState();
        return;
      }

      const topCandidate = scannedOps[0];
      this.latestOpportunity = topCandidate;
      const topStrategy = topCandidate.strategies[0];

      if (!topStrategy) {
        this.statusMessage = `Top candidate ${topCandidate.symbol} had no suitable options chain strategy.`;
        this.currentStage = 'IDLE';
        this.notifyState();
        return;
      }

      saveAuditTrail({
        id: `${cycleId}_scan`,
        timestamp: new Date().toISOString(),
        cycle_id: cycleId,
        stage: 'OPPORTUNITY_DISCOVERED',
        detail: `Discovered top candidate ${topCandidate.symbol} (Score: ${topCandidate.compositeScore}, Direction: ${topCandidate.direction})`,
      });

      // Step 3: AI Decision Reasoning Layer
      this.currentStage = 'AI_REASONING';
      this.statusMessage = `Evaluating AI thesis for ${topCandidate.symbol} (${topStrategy.strategy})...`;
      this.notifyState();

      const aiDecision = await aiStrategyEngine.evaluateOpportunity(topCandidate, topStrategy);
      this.latestDecision = aiDecision;

      saveAuditTrail({
        id: `${cycleId}_ai`,
        timestamp: new Date().toISOString(),
        cycle_id: cycleId,
        stage: 'AI_DECISION',
        detail: `AI generated proposal: ${aiDecision.strategy} on ${aiDecision.symbol} with ${(aiDecision.confidence * 100).toFixed(0)}% confidence`,
      });

      // Step 4: Deterministic Risk Engine & Safety Gates
      this.currentStage = 'RISK_GATE_VALIDATION';
      this.statusMessage = `Running deterministic risk gates for ${aiDecision.symbol}...`;
      this.notifyState();

      const riskResult = riskEngine.evaluateTrade(
        aiDecision,
        topStrategy,
        account,
        positions,
        0
      );
      this.latestRiskResult = riskResult;

      const dbDecisionRecord: DBDecision = {
        id: `${cycleId}_dec`,
        timestamp: new Date().toISOString(),
        symbol: aiDecision.symbol,
        strategy: aiDecision.strategy,
        direction: aiDecision.direction,
        confidence: aiDecision.confidence,
        thesis: aiDecision.thesis,
        entry_conditions: aiDecision.entry_conditions,
        exit_conditions: aiDecision.exit_conditions,
        risk_factors: aiDecision.risk_factors,
        max_loss: aiDecision.max_loss,
        expected_reward: aiDecision.expected_reward,
        position_size: aiDecision.position_size,
        status: riskResult.passed ? 'EXECUTED' : 'REJECTED',
        risk_status: riskResult.status,
        risk_reason: riskResult.reason,
        market_regime: aiDecision.market_regime,
      };
      saveDecision(dbDecisionRecord);

      saveAuditTrail({
        id: `${cycleId}_risk`,
        timestamp: new Date().toISOString(),
        cycle_id: cycleId,
        stage: 'RISK_GATE_CHECK',
        detail: `Risk Engine Result: ${riskResult.status}${riskResult.reason ? ` (${riskResult.reason})` : ''}`,
      });

      // Step 5: Trade Order Execution (If Risk Gates Pass)
      if (riskResult.passed) {
        this.currentStage = 'EXECUTING_ORDER';
        this.statusMessage = `Risk gates PASSED! Submitting paper order for ${aiDecision.symbol}...`;
        this.notifyState();

        const execResult = await orderExecutor.executeTrade(aiDecision, topStrategy, cycleId);

        saveAuditTrail({
          id: `${cycleId}_exec`,
          timestamp: new Date().toISOString(),
          cycle_id: cycleId,
          stage: 'ORDER_EXECUTION',
          detail: `Execution Result: ${execResult.status} -> ${execResult.message}`,
        });

        this.statusMessage = `Trade Executed! Symbol: ${aiDecision.symbol}, Strategy: ${aiDecision.strategy}, Status: ${execResult.status}`;
      } else {
        this.statusMessage = `Risk Gate OVERRIDE: Proposal for ${aiDecision.symbol} rejected (${riskResult.reason})`;
      }

      this.currentStage = 'CYCLE_COMPLETE';
      this.notifyState();
    } catch (err: any) {
      console.error(`[Agent Loop Error] Exception in cycle #${this.cycleCount}:`, err);
      this.statusMessage = `Cycle error: ${err.message || 'Unknown error'}`;
      this.currentStage = 'ERROR';
      this.notifyState();
    }
  }
}

export const agentLoop = new AutonomousAgentLoop();
