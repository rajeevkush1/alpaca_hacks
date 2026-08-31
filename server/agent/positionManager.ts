import { alpacaClient, AlpacaPosition } from '../alpaca/client.js';
import { getTrades, saveTrade, DBTrade } from '../db/database.js';

export interface PositionMonitoringReport {
  symbol: string;
  assetClass: 'us_equity' | 'us_option';
  qty: number;
  entryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  decision: 'HOLD' | 'EXIT' | 'ADJUST' | 'REDUCE';
  reason: string;
  monitoredAt: string;
}

export class PositionManager {
  /**
   * Monitor open positions retrieved from Alpaca, calculate live P&L %, and trigger exit logic
   */
  public async monitorPositions(alpacaPositions: AlpacaPosition[]): Promise<PositionMonitoringReport[]> {
    const reports: PositionMonitoringReport[] = [];
    const dbTrades = getTrades();

    for (const pos of alpacaPositions) {
      const qty = parseFloat(pos.qty || '0');
      const entryPrice = parseFloat(pos.avg_entry_price || '0');
      const currentPrice = parseFloat(pos.current_price || '0');
      const marketValue = parseFloat(pos.market_value || '0');
      const unrealizedPnl = parseFloat(pos.unrealized_pl || '0');
      const unrealizedPnlPercent = parseFloat(pos.unrealized_plpc || '0') * 100;

      let decision: 'HOLD' | 'EXIT' | 'ADJUST' | 'REDUCE' = 'HOLD';
      let reason = 'Position operating within risk parameters';

      // 1. Stop-Loss Trigger (-50% loss on option value)
      if (unrealizedPnlPercent <= -50.0) {
        decision = 'EXIT';
        reason = `Stop-loss triggered (${unrealizedPnlPercent.toFixed(1)}% <= -50.0%)`;
      }
      // 2. Take-Profit Trigger (+100% gain on option value)
      else if (unrealizedPnlPercent >= 100.0) {
        decision = 'EXIT';
        reason = `Take-profit target reached (+${unrealizedPnlPercent.toFixed(1)}% >= +100.0%)`;
      }

      // If EXIT decision triggered, submit closing order to Alpaca
      if (decision === 'EXIT') {
        console.log(`[Position Manager] Triggering EXIT for ${pos.symbol}: ${reason}`);
        await alpacaClient.closePosition(pos.symbol);

        // Update corresponding DB trade record to CLOSED status
        const matchTrade = dbTrades.find((t) => t.option_symbol === pos.symbol || t.symbol === pos.symbol);
        if (matchTrade) {
          const updatedTrade: DBTrade = {
            ...matchTrade,
            exit_price: currentPrice,
            unrealized_pnl: 0,
            realized_pnl: unrealizedPnl,
            status: 'CLOSED',
            exit_time: new Date().toISOString(),
            exit_reason: reason,
          };
          saveTrade(updatedTrade);
        }
      }

      reports.push({
        symbol: pos.symbol,
        assetClass: pos.asset_class,
        qty,
        entryPrice,
        currentPrice,
        marketValue,
        unrealizedPnl,
        unrealizedPnlPercent,
        decision,
        reason,
        monitoredAt: new Date().toISOString(),
      });
    }

    return reports;
  }
}

export const positionManager = new PositionManager();
