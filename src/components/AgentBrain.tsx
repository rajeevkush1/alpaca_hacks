import React from 'react';
import { Cpu, ArrowRight, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Brain, Sparkles } from 'lucide-react';
import { AgentBrainState } from '../types/index.js';

interface AgentBrainProps {
  brainState: AgentBrainState;
}

export const AgentBrain: React.FC<AgentBrainProps> = ({ brainState }) => {
  const { currentStage, latestOpportunity, latestDecision, latestRiskResult, message } = brainState;

  const stages = [
    { id: 'POSITION_MONITORING', label: 'Position Monitor' },
    { id: 'MARKET_SCANNING', label: 'Market Scanner' },
    { id: 'AI_REASONING', label: 'AI Strategy Engine' },
    { id: 'RISK_GATE_VALIDATION', label: 'Deterministic Risk Gates' },
    { id: 'EXECUTING_ORDER', label: 'Alpaca Execution' },
  ];

  const getStageIndex = (stage: string) => {
    return stages.findIndex((s) => s.id === stage);
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Brain className="text-cyan" size={24} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AGENT BRAIN — REASONING PIPELINE</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Continuous Autonomous Decision Flow & Safety Gate Controls
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', padding: '6px 14px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Status: {message}
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
        {stages.map((stage, idx) => {
          const isActive = currentStage === stage.id;
          const isPassed = activeIndex > idx;

          return (
            <React.Fragment key={stage.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: isActive ? 'rgba(0, 240, 255, 0.15)' : isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'var(--accent-cyan)' : isPassed ? 'var(--accent-emerald)' : 'var(--border-card)'}`,
                boxShadow: isActive ? 'var(--cyan-glow)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                <div className={`pulse-dot ${isActive ? 'pulse-dot-cyan' : isPassed ? 'pulse-dot-emerald' : ''}`} style={{ width: '8px', height: '8px' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: isActive || isPassed ? 700 : 500, color: isActive ? 'var(--accent-cyan)' : isPassed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {stage.label}
                </span>
              </div>

              {idx < stages.length - 1 && (
                <ArrowRight size={16} style={{ color: activeIndex > idx ? 'var(--accent-emerald)' : 'var(--text-dim)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Grid: Latest Discovered Opportunity & AI Thesis Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Discovered Opportunity */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
            1. TOP DISCOVERED CANDIDATE
          </h3>
          {latestOpportunity ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {latestOpportunity.symbol}
                </span>
                <span className={`badge ${latestOpportunity.direction === 'BULLISH' ? 'badge-success' : 'badge-danger'}`}>
                  {latestOpportunity.direction}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                Stock Price: <strong>${latestOpportunity.price.toFixed(2)}</strong> ({latestOpportunity.changePercent > 0 ? '+' : ''}{latestOpportunity.changePercent}%)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Composite Score: <strong className="text-cyan">{latestOpportunity.compositeScore}</strong></div>
                <div>Liquidity Score: <strong>{latestOpportunity.liquidityScore}</strong></div>
                <div>Volatility Score: <strong>{latestOpportunity.volatilityScore}</strong></div>
                <div>Momentum Score: <strong>{latestOpportunity.momentumScore}</strong></div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Scanning market for opportunities...
            </div>
          )}
        </div>

        {/* AI Proposal & Thesis */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
            2. AI STRATEGY THESIS
          </h3>
          {latestDecision ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                  {latestDecision.strategy}
                </span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Confidence: {(latestDecision.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '10px', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{latestDecision.thesis}"
              </p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
                <div>Max Risk: <strong className="text-crimson">${latestDecision.max_loss}</strong></div>
                <div>Expected Payoff: <strong className="text-emerald">${latestDecision.expected_reward}</strong></div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Awaiting AI evaluation...
            </div>
          )}
        </div>

        {/* Deterministic Risk Gates Results */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
            3. DETERMINISTIC RISK GATES
          </h3>
          {latestRiskResult ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                {latestRiskResult.passed ? (
                  <span className="badge badge-success"><ShieldCheck size={14} /> GATES PASSED</span>
                ) : (
                  <span className="badge badge-danger"><ShieldAlert size={14} /> RISK OVERRIDE</span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {latestRiskResult.reason || 'All safety limits verified'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                {latestRiskResult.gates.map((g) => (
                  <div key={g.gateName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: g.passed ? 'var(--accent-emerald)' : 'var(--accent-crimson)' }}>
                    <span>{g.gateName}</span>
                    {g.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Awaiting trade risk validation...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
