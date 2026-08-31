import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbFilePath = path.join(dbDir, 'alpaca_agent_data.json');

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
  order_id?: string;
  market_regime?: string;
}

export interface DBTrade {
  id: string;
  decision_id?: string;
  timestamp: string;
  symbol: string;
  strategy: string;
  option_symbol?: string;
  direction: string;
  quantity: number;
  entry_price: number;
  exit_price?: number;
  unrealized_pnl: number;
  realized_pnl: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELED';
  entry_time: string;
  exit_time?: string;
  exit_reason?: string;
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

interface DataSchema {
  decisions: DBDecision[];
  trades: DBTrade[];
  risk_logs: DBRiskLog[];
  audit_trail: DBAuditTrail[];
}

function loadData(): DataSchema {
  if (!fs.existsSync(dbFilePath)) {
    const initial: DataSchema = { decisions: [], trades: [], risk_logs: [], audit_trail: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const content = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { decisions: [], trades: [], risk_logs: [], audit_trail: [] };
  }
}

function saveData(data: DataSchema): void {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Write Error]:', err);
  }
}

export function saveDecision(decision: DBDecision): void {
  const data = loadData();
  const existingIdx = data.decisions.findIndex((d) => d.id === decision.id);
  if (existingIdx >= 0) {
    data.decisions[existingIdx] = decision;
  } else {
    data.decisions.unshift(decision);
  }
  saveData(data);
}

export function getDecisions(limit = 50): DBDecision[] {
  const data = loadData();
  return data.decisions.slice(0, limit);
}

export function saveTrade(trade: DBTrade): void {
  const data = loadData();
  const existingIdx = data.trades.findIndex((t) => t.id === trade.id);
  if (existingIdx >= 0) {
    data.trades[existingIdx] = trade;
  } else {
    data.trades.unshift(trade);
  }
  saveData(data);
}

export function getTrades(): DBTrade[] {
  const data = loadData();
  return data.trades;
}

export function saveRiskLog(log: DBRiskLog): void {
  const data = loadData();
  data.risk_logs.unshift(log);
  saveData(data);
}

export function getRiskLogs(limit = 50): DBRiskLog[] {
  const data = loadData();
  return data.risk_logs.slice(0, limit);
}

export function saveAuditTrail(audit: DBAuditTrail): void {
  const data = loadData();
  data.audit_trail.unshift(audit);
  saveData(data);
}

export function getAuditTrail(limit = 100): DBAuditTrail[] {
  const data = loadData();
  return data.audit_trail.slice(0, limit);
}
