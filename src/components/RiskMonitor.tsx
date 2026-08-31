import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { DBRiskLog } from '../types/index.js';

interface RiskMonitorProps {
  riskLogs: DBRiskLog[];
}

export const RiskMonitor: React.FC<RiskMonitorProps> = ({ riskLogs }) => {
  const activeGates = [
    { name: 'AI_CONFIDENCE_THRESHOLD', desc: 'Minimum AI confidence >= 70%' },
    { name: 'MAX_POSITION_RISK_LIMIT', desc: 'Single trade max loss <= 5% portfolio equity' },
    { name: 'BUYING_POWER_AVAILABLE', desc: 'Sufficient cash / buying power required' },
    { name: 'MAX_OPEN_POSITIONS_LIMIT', desc: 'Maximum 5 simultaneous open positions' },
    { name: 'PORTFOLIO_EXPOSURE_LIMIT', desc: 'Total portfolio exposure <= 30%' },
    { name: 'DAILY_LOSS_CIRCUIT_BREAKER', desc: 'Daily loss limit circuit breaker -$1,000' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert className="text-cyan" size={22} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>DETERMINISTIC RISK MONITOR & SAFETY GATES</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deterministic trade gate controls enforcing strict risk limits and AI decision overrides
            </p>
          </div>
        </div>
      </div>

      {/* Active Risk Gates Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {activeGates.map((gate) => (
          <div key={gate.name} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <CheckCircle2 size={18} className="text-emerald" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{gate.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{gate.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Gate Evaluation Logs */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
        RECENT RISK GATE EVALUATION LOGS
      </h3>

      {riskLogs.length > 0 ? (
        <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px' }}>SYMBOL</th>
                <th style={{ padding: '10px' }}>GATE NAME</th>
                <th style={{ padding: '10px' }}>STATUS</th>
                <th style={{ padding: '10px' }}>MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {riskLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px' }} className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td style={{ padding: '10px' }} className="font-mono">{log.symbol}</td>
                  <td style={{ padding: '10px' }} className="font-mono">{log.gate_name}</td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge ${log.passed ? 'badge-success' : 'badge-danger'}`}>
                      {log.passed ? 'PASSED' : 'REJECTED'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: log.passed ? 'var(--text-muted)' : 'var(--accent-crimson)' }}>
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          No risk gate evaluations recorded yet. Run an autonomous cycle to populate live risk logs.
        </div>
      )}
    </div>
  );
};
