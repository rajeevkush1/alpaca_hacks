import React from 'react';
import { Search, Flame, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { ScannedOpportunity } from '../types/index.js';

interface OpportunityScannerProps {
  opportunities: ScannedOpportunity[];
  onTriggerScan: () => void;
}

export const OpportunityScanner: React.FC<OpportunityScannerProps> = ({ opportunities, onTriggerScan }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Table Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search className="text-cyan" size={22} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>DYNAMIC OPPORTUNITY SCANNER</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live liquid options universe ranking derived dynamically from Alpaca Market Data APIs
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onTriggerScan}>
          <Flame size={16} className="text-amber" /> SCAN NOW
        </button>
      </div>

      {/* Opportunities Table */}
      {opportunities.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>RANK / SYMBOL</th>
                <th style={{ padding: '12px' }}>PRICE / CHANGE</th>
                <th style={{ padding: '12px' }}>DIRECTION</th>
                <th style={{ padding: '12px' }}>COMPOSITE SCORE</th>
                <th style={{ padding: '12px' }}>LIQUIDITY</th>
                <th style={{ padding: '12px' }}>VOLATILITY</th>
                <th style={{ padding: '12px' }}>MOMENTUM</th>
                <th style={{ padding: '12px' }}>PROPOSED STRATEGY</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp, index) => {
                const topStrat = opp.strategies[0];
                return (
                  <tr key={opp.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                          #{index + 1}
                        </span>
                        <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {opp.symbol}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <div className="font-mono" style={{ fontWeight: 700 }}>${opp.price.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: opp.changePercent >= 0 ? 'var(--accent-emerald)' : 'var(--accent-crimson)' }}>
                        {opp.changePercent >= 0 ? '+' : ''}{opp.changePercent}%
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${opp.direction === 'BULLISH' ? 'badge-success' : 'badge-danger'}`}>
                        {opp.direction === 'BULLISH' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {opp.direction}
                      </span>
                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${opp.compositeScore * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f0ff, #10b981)' }} />
                        </div>
                        <span className="font-mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {opp.compositeScore.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px' }} className="font-mono">{opp.liquidityScore}</td>
                    <td style={{ padding: '14px 12px' }} className="font-mono">{opp.volatilityScore}</td>
                    <td style={{ padding: '14px 12px' }} className="font-mono">{opp.momentumScore}</td>

                    <td style={{ padding: '14px 12px' }}>
                      {topStrat ? (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>
                            {topStrat.strategy}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Net Debit: ${topStrat.netDebit} | Max Reward: ${topStrat.maxReward}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Chain Unavailable</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No market scan data available. Click "SCAN NOW" to trigger live market universe scan.</p>
        </div>
      )}
    </div>
  );
};
