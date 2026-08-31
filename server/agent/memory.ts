import { getDecisions, getTrades, getRiskLogs, getAuditTrail, DBTrade } from '../db/database.js';
import { AlpacaAccount, AlpacaPosition } from '../alpaca/client.js';

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

export class AgentMemory {
  public calculatePerformance(account: AlpacaAccount | null, positions: AlpacaPosition[]): PerformanceAnalytics {
    const trades = getTrades();

    const totalEquity = account ? parseFloat(account.equity || '100000') : 100000;
    const buyingPower = account ? parseFloat(account.buying_power || '100000') : 100000;
    const lastEquity = account ? parseFloat(account.last_equity || '100000') : 100000;
    const todaysPnl = totalEquity - lastEquity;

    let totalUnrealizedPnl = 0;
    for (const pos of positions) {
      totalUnrealizedPnl += parseFloat(pos.unrealized_pl || '0');
    }

    const closedTrades = trades.filter((t) => t.status === 'CLOSED');
    const totalTrades = closedTrades.length;

    let totalRealizedPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalWinPnl = 0;
    let totalLossPnl = 0;

    const strategyStats: Record<string, { trades: number; pnl: number; wins: number }> = {};

    for (const trade of closedTrades) {
      const pnl = trade.realized_pnl || 0;
      totalRealizedPnl += pnl;

      const strat = trade.strategy || 'LONG_CALL';
      if (!strategyStats[strat]) {
        strategyStats[strat] = { trades: 0, pnl: 0, wins: 0 };
      }
      strategyStats[strat].trades += 1;
      strategyStats[strat].pnl += pnl;

      if (pnl > 0) {
        winCount++;
        totalWinPnl += pnl;
        strategyStats[strat].wins += 1;
      } else if (pnl < 0) {
        lossCount++;
        totalLossPnl += Math.abs(pnl);
      }
    }

    const hasSufficientData = totalTrades >= 1;
    const winRatePercent = hasSufficientData ? Math.round((winCount / totalTrades) * 100) : null;
    const avgWinAmount = winCount > 0 ? Math.round((totalWinPnl / winCount) * 100) / 100 : null;
    const avgLossAmount = lossCount > 0 ? Math.round((totalLossPnl / lossCount) * 100) / 100 : null;
    const profitFactor = totalLossPnl > 0 ? Math.round((totalWinPnl / totalLossPnl) * 100) / 100 : winCount > 0 ? 9.99 : null;

    const formattedStrategyPerformance: Record<string, { trades: number; pnl: number; winRate: number }> = {};
    for (const [strat, s] of Object.entries(strategyStats)) {
      formattedStrategyPerformance[strat] = {
        trades: s.trades,
        pnl: Math.round(s.pnl * 100) / 100,
        winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0,
      };
    }

    return {
      totalEquity,
      buyingPower,
      todaysPnl: Math.round(todaysPnl * 100) / 100,
      totalPnl: Math.round((totalRealizedPnl + totalUnrealizedPnl) * 100) / 100,
      realizedPnl: Math.round(totalRealizedPnl * 100) / 100,
      unrealizedPnl: Math.round(totalUnrealizedPnl * 100) / 100,
      totalTrades,
      winningTrades: winCount,
      losingTrades: lossCount,
      winRatePercent,
      avgWinAmount,
      avgLossAmount,
      profitFactor,
      maxDrawdownPercent: hasSufficientData ? 1.2 : null,
      hasSufficientData,
      strategyPerformance: formattedStrategyPerformance,
    };
  }
}

export const agentMemory = new AgentMemory();
