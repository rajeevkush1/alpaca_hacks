export type AgentStatus = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'SCANNING' | 'EXECUTING';

export interface AlpacaAccount {
  id: string;
  status: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  last_equity: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  asset_class: 'us_equity' | 'us_option';
  avg_entry_price: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
}

export interface OptionLeg {
  symbol: string;
  underlying: string;
  type: 'call' | 'put';
  side: 'buy' | 'sell';
  strike: number;
  expiration: string;
  price: number;
  delta?: number;
}

export interface EvaluatedStrategy {
  strategy: string;
  underlyingSymbol: string;
  underlyingPrice: number;
  direction: string;
  legs: OptionLeg[];
  netDebit: number;
  netCredit: number;
  maxLoss: number;
  maxReward: number;
  riskRewardRatio: number;
  breakEvenPrices: number[];
  daysToExpiration: number;
  compositeScore: number;
  rationale: string;
}

export interface ScannedOpportunity {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  liquidityScore: number;
  volatilityScore: number;
  momentumScore: number;
  optionsQualityScore: number;
  riskRewardScore: number;
  compositeScore: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE';
  strategies: EvaluatedStrategy[];
  scannedAt: string;
}

export interface AgentDecision {
  symbol: string;
  strategy: string;
  direction: string;
  confidence: number;
  thesis: string;
  entry_conditions: string[];
  exit_conditions: string[];
  risk_factors: string[];
  max_loss: number;
  expected_reward: number;
  position_size: number;
  market_regime?: string;
}

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

export interface DBDecision {
  id: string;
  timestamp: string;
  symbol: string;
  strategy: string;
  direction: string;
  confidence: number;
  thesis: string;
  entry_conditions?: string[];
  exit_conditions?: string[];
  risk_factors?: string[];
  max_loss: number;
  expected_reward: number;
  position_size: number;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'EXPIRED';
  risk_status: 'PASSED' | 'FAILED' | 'REJECTED' | 'OVERRIDDEN';
  risk_reason?: string;
}

export interface DBRiskLog {
  id: string;
  timestamp: string;
  symbol: string;
  gate_name: string;
  passed: boolean;
  value?: number;
  threshold?: number;
  message: string;
}

export interface DBAuditTrail {
  id: string;
  timestamp: string;
  cycle_id: string;
  stage: string;
  detail: string;
  metadata?: string;
}

export interface PerformanceAnalytics {
  totalEquity: number;
  buyingPower: number;
  todaysPnl: number;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number | null;
  avgWinAmount: number | null;
  avgLossAmount: number | null;
  profitFactor: number | null;
  maxDrawdownPercent: number | null;
  hasSufficientData: boolean;
  strategyPerformance: Record<string, { trades: number; pnl: number; winRate: number }>;
}

export interface AgentBrainState {
  status: AgentStatus;
  lastCycleTimestamp: string | null;
  cycleCount: number;
  currentStage: string;
  latestOpportunity: ScannedOpportunity | null;
  latestDecision: AgentDecision | null;
  latestRiskResult: RiskEvaluationResult | null;
  analytics: PerformanceAnalytics;
  message: string;
}
