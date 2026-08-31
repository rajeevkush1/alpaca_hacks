import React, { useState } from 'react';
import { BookOpen, FileText, CheckCircle2, XCircle, ChevronRight, Layers } from 'lucide-react';
import { DBDecision } from '../types/index.js';

interface TradeJournalProps {
  decisions: DBDecision[];
}

export const TradeJournal: React.FC<TradeJournalProps> = ({ decisions }) => {
  const [selectedDecision, setSelectedDecision] = useState<DBDecision | null>(null);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen className="text-indigo" size={22} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AUTONOMOUS TRADE JOURNAL & DECISION MEMORY</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Complete persistent memory of every scanner discovery, AI proposal, risk check, and order outcome
            </p>
          </div>
        </div>
      </div>

      {decisions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px' }}>SYMBOL</th>
                <th style={{ padding: '12px' }}>STRATEGY</th>
                <th style={{ padding: '12px' }}>CONFIDENCE</th>
                <th style={{ padding: '12px' }}>RISK STATUS</th>
                <th style={{ padding: '12px' }}>MAX RISK</th>
                <th style={{ padding: '12px' }}>EXPECTED REWARD</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>AUDIT TRACE</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((dec) => (
                <tr key={dec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 12px' }} className="font-mono">{new Date(dec.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="font-mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{dec.symbol}</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>{dec.strategy}</span>
                  </td>
                  <td style={{ padding: '14px 12px' }} className="font-mono">{(dec.confidence * 100).toFixed(0)}%</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className={`badge ${dec.risk_status === 'PASSED' ? 'badge-success' : 'badge-danger'}`}>
                      {dec.risk_status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }} className="font-mono text-crimson">${dec.max_loss}</td>
                  <td style={{ padding: '14px 12px' }} className="font-mono text-emerald">${dec.expected_reward}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setSelectedDecision(dec)}>
                      VIEW AUDIT <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No decision memory logged yet.</p>
        </div>
      )}

      {/* Audit Modal */}
      {selectedDecision && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                AUDIT TRACE — {selectedDecision.symbol} ({selectedDecision.strategy})
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => setSelectedDecision(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div><strong>Timestamp:</strong> <span className="font-mono">{new Date(selectedDecision.timestamp).toLocaleString()}</span></div>
              <div><strong>Trading Thesis:</strong> <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>"{selectedDecision.thesis}"</p></div>
              <div><strong>Risk Gate Status:</strong> <span className={`badge ${selectedDecision.risk_status === 'PASSED' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>{selectedDecision.risk_status}</span></div>
              {selectedDecision.risk_reason && (
                <div><strong>Risk Rejection Reason:</strong> <span className="text-crimson">{selectedDecision.risk_reason}</span></div>
              )}
              <div>
                <strong>Entry Conditions:</strong>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedDecision.entry_conditions?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div>
                <strong>Exit Conditions:</strong>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedDecision.exit_conditions?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setSelectedDecision(null)}>CLOSE AUDIT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
