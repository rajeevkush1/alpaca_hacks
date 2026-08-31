import { useState, useEffect } from 'react';
import { AgentBrainState, AlpacaAccount, AlpacaPosition, ScannedOpportunity, DBDecision, DBRiskLog, PerformanceAnalytics } from '../types/index.js';

export function useAgentState() {
  const [brainState, setBrainState] = useState<AgentBrainState>({
    status: 'STOPPED',
    lastCycleTimestamp: null,
    cycleCount: 0,
    currentStage: 'IDLE',
    latestOpportunity: null,
    latestDecision: null,
    latestRiskResult: null,
    analytics: {
      totalEquity: 100000,
      buyingPower: 100000,
      todaysPnl: 0,
      totalPnl: 0,
      realizedPnl: 0,
      unrealizedPnl: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRatePercent: null,
      avgWinAmount: null,
      avgLossAmount: null,
      profitFactor: null,
      maxDrawdownPercent: null,
      hasSufficientData: false,
      strategyPerformance: {},
    },
    message: 'Connecting to agent backend...',
  });

  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [opportunities, setOpportunities] = useState<ScannedOpportunity[]>([]);
  const [decisions, setDecisions] = useState<DBDecision[]>([]);
  const [riskLogs, setRiskLogs] = useState<DBRiskLog[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [statusInfo, setStatusInfo] = useState<{
    alpacaConnected: boolean;
    openRouterConfigured: boolean;
    openRouterModel?: string;
    agenticConfigured?: boolean;
    paperMode: boolean;
    marketOpen: boolean;
    mcpStatus?: { cliAvailable: boolean; mcpAvailable: boolean };
  }>({
    alpacaConnected: false,
    openRouterConfigured: false,
    openRouterModel: 'anthropic/claude-3.5-sonnet',
    agenticConfigured: false,
    paperMode: true,
    marketOpen: false,
  });

  const fetchRestData = async () => {
    try {
      const [statusRes, accRes, posRes, oppRes, decRes, riskRes, analyticsRes] = await Promise.all([
        fetch('/api/status').then((r) => r.json()),
        fetch('/api/account').then((r) => r.json()),
        fetch('/api/positions').then((r) => r.json()),
        fetch('/api/scanner').then((r) => r.json()),
        fetch('/api/decisions').then((r) => r.json()),
        fetch('/api/risk').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
      ]);

      if (statusRes) setStatusInfo(statusRes);
      if (accRes) setAccount(accRes);
      if (Array.isArray(posRes)) setPositions(posRes);
      if (Array.isArray(oppRes)) setOpportunities(oppRes);
      if (Array.isArray(decRes)) setDecisions(decRes);
      if (riskRes?.riskLogs) setRiskLogs(riskRes.riskLogs);
      if (analyticsRes) setAnalytics(analyticsRes);
    } catch (err) {
      console.warn('[useAgentState] REST fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchRestData();
    const interval = setInterval(fetchRestData, 5000);

    // Setup Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setBrainState(parsed);
        } catch (e) {
          console.warn('[SSE Parse Error]:', e);
        }
      };
    } catch (e) {
      console.warn('[SSE Connection Warning]:', e);
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const sendControl = async (action: 'start' | 'pause' | 'stop') => {
    await fetch('/api/agent/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchRestData();
  };

  const triggerScan = async () => {
    await fetch('/api/agent/scan', { method: 'POST' });
    fetchRestData();
  };

  return {
    brainState,
    account,
    positions,
    opportunities,
    decisions,
    riskLogs,
    analytics: analytics || brainState.analytics,
    statusInfo,
    sendControl,
    triggerScan,
    refreshData: fetchRestData,
  };
}
