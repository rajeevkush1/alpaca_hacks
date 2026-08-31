import { getConfig } from '../config.js';
import { AlpacaAccount, AlpacaPosition } from '../alpaca/client.js';
import { AgentDecision } from './strategyEngine.js';
import { DBRiskLog, saveRiskLog } from '../db/database.js';
import { EvaluatedStrategy } from '../strategies/types.js';

export interface GateResult {
  gateName: string;
  passed: boolean;
  value?: number;
  threshold?: number;
  message: string;
}

export interface RiskEvaluationResult {
  passed: boolean;
  status: 'PASSED' | 'REJECTED' | 'OVERRIDDEN';
  gates: GateResult[];
  reason?: string;
  calculatedPositionSize: number;
  maxAllowedRiskAmount: number;
}

export class DeterministicRiskEngine {
  public evaluateTrade(
    decision: AgentDecision,
    candidateStrategy: EvaluatedStrategy,
    account: AlpacaAccount | null,
    currentPositions: AlpacaPosition[],
    todayRealizedPnl = 0
  ): RiskEvaluationResult {
    const config = getConfig();
    const gates: GateResult[] = [];

    // Fallback account values if offline or missing API keys
    const portfolioEquity = account ? parseFloat(account.equity || '100000') : 100000;
    const buyingPower = account ? parseFloat(account.buying_power || '100000') : 100000;

    // 1. Confidence Gate
    const minConf = config.minConfidence;
    const confPassed = decision.confidence >= minConf;
    gates.push({
      gateName: 'AI_CONFIDENCE_THRESHOLD',
      passed: confPassed,
      value: decision.confidence,
      threshold: minConf,
      message: confPassed
        ? `Confidence ${(decision.confidence * 100).toFixed(0)}% meets threshold ${(minConf * 100).toFixed(0)}%`
        : `Confidence ${(decision.confidence * 100).toFixed(0)}% below minimum required ${(minConf * 100).toFixed(0)}%`,
    });

    // 2. Maximum Single Position Risk Gate
    const maxRiskPerTrade = portfolioEquity * config.maxPositionRisk;
    const tradeMaxLoss = candidateStrategy.maxLoss;
    const positionRiskPassed = tradeMaxLoss <= maxRiskPerTrade;
    gates.push({
      gateName: 'MAX_POSITION_RISK_LIMIT',
      passed: positionRiskPassed,
      value: tradeMaxLoss,
      threshold: maxRiskPerTrade,
      message: positionRiskPassed
        ? `Trade max loss $${tradeMaxLoss} is within single-position risk limit $${maxRiskPerTrade.toFixed(2)}`
        : `Trade max loss $${tradeMaxLoss} exceeds maximum allowed risk limit $${maxRiskPerTrade.toFixed(2)}`,
    });

    // 3. Buying Power Availability Gate
    const buyingPowerPassed = tradeMaxLoss <= buyingPower * 0.9;
    gates.push({
      gateName: 'BUYING_POWER_AVAILABLE',
      passed: buyingPowerPassed,
      value: tradeMaxLoss,
      threshold: buyingPower * 0.9,
      message: buyingPowerPassed
        ? `Trade max loss $${tradeMaxLoss} is within available buying power $${buyingPower.toFixed(2)}`
        : `Insufficient buying power ($${buyingPower.toFixed(2)}) for required risk $${tradeMaxLoss}`,
    });

    // 4. Maximum Open Positions Gate
    const activePositionCount = currentPositions.length;
    const maxPosLimit = config.maxOpenPositions;
    const maxPosPassed = activePositionCount < maxPosLimit;
    gates.push({
      gateName: 'MAX_OPEN_POSITIONS_LIMIT',
      passed: maxPosPassed,
      value: activePositionCount,
      threshold: maxPosLimit,
      message: maxPosPassed
        ? `Active positions count (${activePositionCount}) is below maximum limit (${maxPosLimit})`
        : `Maximum open position count limit reached (${activePositionCount}/${maxPosLimit})`,
    });

    // 5. Total Portfolio Exposure Gate
    let currentExposure = 0;
    for (const pos of currentPositions) {
      currentExposure += Math.abs(parseFloat(pos.market_value || '0'));
    }
    const maxTotalExposure = portfolioEquity * config.maxPortfolioExposure;
    const newTotalExposure = currentExposure + tradeMaxLoss;
    const exposurePassed = newTotalExposure <= maxTotalExposure;
    gates.push({
      gateName: 'PORTFOLIO_EXPOSURE_LIMIT',
      passed: exposurePassed,
      value: newTotalExposure,
      threshold: maxTotalExposure,
      message: exposurePassed
        ? `Total exposure $${newTotalExposure.toFixed(2)} is within portfolio limit $${maxTotalExposure.toFixed(2)}`
        : `Total exposure $${newTotalExposure.toFixed(2)} would exceed maximum portfolio exposure limit $${maxTotalExposure.toFixed(2)}`,
    });

    // 6. Max Daily Loss Circuit Breaker Gate
    const maxDailyLoss = config.maxDailyLoss;
    const dailyLossPassed = todayRealizedPnl > -maxDailyLoss;
    gates.push({
      gateName: 'DAILY_LOSS_CIRCUIT_BREAKER',
      passed: dailyLossPassed,
      value: todayRealizedPnl,
      threshold: -maxDailyLoss,
      message: dailyLossPassed
        ? `Today P&L ($${todayRealizedPnl.toFixed(2)}) is clear of daily loss limit -$${maxDailyLoss}`
        : `Daily loss limit reached ($${todayRealizedPnl.toFixed(2)} <= -$${maxDailyLoss}). Trading halted.`,
    });

    // Log all gate evaluations to persistent database
    const nowIso = new Date().toISOString();
    for (const g of gates) {
      const logEntry: DBRiskLog = {
        id: `${Date.now()}_${g.gateName}`,
        timestamp: nowIso,
        symbol: decision.symbol,
        gate_name: g.gateName,
        passed: g.passed,
        value: g.value,
        threshold: g.threshold,
        message: g.message,
      };
      saveRiskLog(logEntry);
    }

    // Determine overall result
    const failedGate = gates.find((g) => !g.passed);

    if (failedGate) {
      console.warn(`[Risk Engine OVERRIDE] Rejected trade proposal on ${decision.symbol}. Gate: ${failedGate.gateName} -> ${failedGate.message}`);
      return {
        passed: false,
        status: 'OVERRIDDEN',
        gates,
        reason: failedGate.message,
        calculatedPositionSize: 0,
        maxAllowedRiskAmount: maxRiskPerTrade,
      };
    }

    // Position Sizing: 1 contract per trade in paper environment
    return {
      passed: true,
      status: 'PASSED',
      gates,
      calculatedPositionSize: 1,
      maxAllowedRiskAmount: maxRiskPerTrade,
    };
  }
}

export const riskEngine = new DeterministicRiskEngine();
