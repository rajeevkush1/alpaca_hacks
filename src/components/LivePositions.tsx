import React from 'react';
import { Briefcase, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { AlpacaPosition } from '../types/index.js';

interface LivePositionsProps {
  positions: AlpacaPosition[];
  onRefresh: () => void;
}

export const LivePositions: React.FC<LivePositionsProps> = ({ positions, onRefresh }) => {
  const handleClosePosition = async (symbol: string) => {
    if (confirm(`Submit paper order to close position for ${symbol}?`)) {
      try {
        await fetch(`/api/positions/${encodeURIComponent(symbol)}`, { method: 'DELETE' });
        onRefresh();
      } catch (err) {
        console.error('Failed to close position:', err);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase className="text-amber" size={22} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>LIVE ALPACA PAPER POSITIONS</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real open portfolio holdings retrieved directly from Alpaca Paper Trading API
            </p>
          </div>
        </div>

        <span className="badge badge-info">
          Active: {positions.length}
        </span>
      </div>

      {positions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>SYMBOL</th>
                <th style={{ padding: '12px' }}>ASSET CLASS</th>
                <th style={{ padding: '12px' }}>QUANTITY</th>
                <th style={{ padding: '12px' }}>ENTRY PRICE</th>
                <th style={{ padding: '12px' }}>CURRENT PRICE</th>
                <th style={{ padding: '12px' }}>MARKET VALUE</th>
                <th style={{ padding: '12px' }}>UNREALIZED P&L</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const qty = parseFloat(pos.qty || '0');
                const entry = parseFloat(pos.avg_entry_price || '0');
                const curr = parseFloat(pos.current_price || '0');
                const val = parseFloat(pos.market_value || '0');
                const pnl = parseFloat(pos.unrealized_pl || '0');
                const pnlPct = parseFloat(pos.unrealized_plpc || '0') * 100;

                return (
                  <tr key={pos.asset_id || pos.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="font-mono" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                        {pos.symbol}
                      </span>
                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${pos.asset_class === 'us_option' ? 'badge-info' : 'badge-warning'}`}>
                        {pos.asset_class === 'us_option' ? 'OPTION' : 'STOCK'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 12px' }} className="font-mono">{qty}</td>
                    <td style={{ padding: '14px 12px' }} className="font-mono">${entry.toFixed(2)}</td>
                    <td style={{ padding: '14px 12px' }} className="font-mono">${curr.toFixed(2)}</td>
                    <td style={{ padding: '14px 12px' }} className="font-mono">${val.toFixed(2)}</td>

                    <td style={{ padding: '14px 12px' }}>
                      <div className={`font-mono ${pnl >= 0 ? 'text-emerald' : 'text-crimson'}`} style={{ fontWeight: 700 }}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                      </div>
                    </td>

                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleClosePosition(pos.symbol)}>
                        <XCircle size={14} /> CLOSE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No open positions in Alpaca paper account.</p>
        </div>
      )}
    </div>
  );
};
