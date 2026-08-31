import React from 'react';
import { BarChart2, PieChart, TrendingUp, Award, Activity } from 'lucide-react';
import { PerformanceAnalytics as AnalyticsType } from '../types/index.js';

interface PerformanceAnalyticsProps {
  analytics: AnalyticsType;
}

export const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsProps> = ({ analytics }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 className="text-emerald" size={22} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>PERFORMANCE ANALYTICS & STATS</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real strategy metrics computed dynamically from actual Alpaca trade execution memory
            </p>
          </div>
        </div>
      </div>

      {analytics.hasSufficientData ? (
        <div>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WIN RATE</div>
              <div className="font-mono text-emerald" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {analytics.winRatePercent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {analytics.winningTrades} Wins / {analytics.totalTrades} Closed Trades
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROFIT FACTOR</div>
              <div className="font-mono text-cyan" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {analytics.profitFactor ? analytics.profitFactor.toFixed(2) : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Gross Profit / Gross Loss Ratio
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVG WIN / AVG LOSS</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                <span className="text-emerald">${analytics.avgWinAmount || 0}</span> / <span className="text-crimson">${analytics.avgLossAmount || 0}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Average Trade Expectancy
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MAX DRAWDOWN</div>
              <div className="font-mono text-crimson" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {analytics.maxDrawdownPercent ? `${analytics.maxDrawdownPercent}%` : '0.0%'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Peak-to-trough risk metric
              </div>
            </div>
          </div>

          {/* Strategy-level breakdown */}
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
            STRATEGY LEVEL BREAKDOWN
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>STRATEGY TYPE</th>
                  <th style={{ padding: '10px' }}>CLOSED TRADES</th>
                  <th style={{ padding: '10px' }}>WIN RATE</th>
                  <th style={{ padding: '10px' }}>TOTAL REALIZED P&L</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.strategyPerformance).map(([strat, s]) => (
                  <tr key={strat} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--accent-indigo)' }}>{strat}</td>
                    <td style={{ padding: '12px 10px' }} className="font-mono">{s.trades}</td>
                    <td style={{ padding: '12px 10px' }} className="font-mono text-emerald">{s.winRate}%</td>
                    <td style={{ padding: '12px 10px' }} className={`font-mono ${s.pnl >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                      {s.pnl >= 0 ? '+' : ''}${s.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Activity size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>INSUFFICIENT HISTORICAL DATA</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Real metrics require closed paper trade history. Metrics will calculate automatically as trades execute and close.
          </p>
        </div>
      )}
    </div>
  );
};
