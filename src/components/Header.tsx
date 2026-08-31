import React from 'react';
import { Play, Pause, Square, RefreshCw, Sliders, Cpu } from 'lucide-react';
import { AgentStatus } from '../types/index.js';

interface HeaderProps {
  agentStatus: AgentStatus;
  alpacaConnected: boolean;
  openRouterConfigured: boolean;
  openRouterModel?: string;
  agenticConfigured?: boolean;
  marketOpen: boolean;
  onControl: (action: 'start' | 'pause' | 'stop') => void;
  onScan: () => void;
  onRefresh: () => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  agentStatus,
  alpacaConnected,
  openRouterConfigured,
  openRouterModel,
  agenticConfigured,
  marketOpen,
  onControl,
  onScan,
  onRefresh,
  onOpenConfig,
}) => {
  const aiProviderLabel = openRouterConfigured
    ? `OpenRouter (${openRouterModel || 'Model'})`
    : agenticConfigured
      ? 'Agent Router (Agentic API)'
      : 'Deterministic Engine';

  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Title & System Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>🦙</span>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                OPTIONS ALPHA AGENT
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Autonomous Alpaca Options Trading Desk
              </p>
            </div>
          </div>

          <div style={{ height: '32px', width: '1px', background: 'var(--border-card)' }} />

          {/* Connection Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge ${alpacaConnected ? 'badge-success' : 'badge-warning'}`}>
              <span className={`pulse-dot ${alpacaConnected ? 'pulse-dot-emerald' : 'pulse-dot-amber'}`} />
              {alpacaConnected ? 'Alpaca Connected' : 'Alpaca Inspection Mode'}
            </span>

            <span className="badge badge-info">
              ● Paper Trading
            </span>

            <span className={`badge ${marketOpen ? 'badge-success' : 'badge-danger'}`}>
              Market: {marketOpen ? 'OPEN' : 'CLOSED'}
            </span>

            <span className={`badge ${openRouterConfigured || agenticConfigured ? 'badge-info' : 'badge-warning'}`}>
              <Cpu size={12} />
              AI: {aiProviderLabel}
            </span>
          </div>
        </div>

        {/* Action Controls & Agent Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Agent State Indicators */}
          <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', fontWeight: 700 }}>
            AGENT: <span className={agentStatus === 'RUNNING' || agentStatus === 'SCANNING' || agentStatus === 'EXECUTING' ? 'text-emerald' : agentStatus === 'PAUSED' ? 'text-amber' : 'text-crimson'}>{agentStatus}</span>
          </div>

          {/* Start / Pause / Stop Buttons */}
          {agentStatus !== 'RUNNING' && agentStatus !== 'SCANNING' && agentStatus !== 'EXECUTING' ? (
            <button className="btn btn-primary" onClick={() => onControl('start')}>
              <Play size={16} fill="currentColor" /> START AGENT
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => onControl('pause')}>
              <Pause size={16} /> PAUSE AGENT
            </button>
          )}

          {agentStatus !== 'STOPPED' && (
            <button className="btn btn-danger" onClick={() => onControl('stop')}>
              <Square size={16} fill="currentColor" /> STOP
            </button>
          )}

          <button className="btn btn-secondary" onClick={onScan} title="Run Opportunity Scan Now">
            <RefreshCw size={16} /> SCAN NOW
          </button>

          <button className="btn btn-secondary" onClick={onRefresh} title="Refresh Live Data">
            <RefreshCw size={16} />
          </button>

          <button className="btn btn-secondary" onClick={onOpenConfig} title="Agent Risk Settings">
            <Sliders size={16} />
          </button>
        </div>

      </div>
    </header>
  );
};
