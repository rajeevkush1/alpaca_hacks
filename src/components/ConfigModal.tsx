import React, { useState, useEffect } from 'react';
import { Sliders, Save, X } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import React, { useState, useEffect } from 'react';
import { Sliders, Save, X, Key, ShieldCheck } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    alpacaApiKey: '',
    alpacaSecretKey: '',
    alpacaBaseUrl: 'https://paper-api.alpaca.markets',
    openRouterApiKey: '',
    openRouterModel: 'anthropic/claude-3.5-sonnet',
    maxPositionRisk: 0.05,
    maxPortfolioExposure: 0.30,
    maxDailyLoss: 1000,
    minConfidence: 0.70,
    maxOpenPositions: 5,
    scanIntervalMs: 60000,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config')
        .then((res) => res.json())
        .then((data) => {
          if (data) setConfig((prev) => ({ ...prev, ...data }));
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
      window.location.reload(); // Refresh to update active credentials and account state
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-card)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders className="text-cyan" size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AGENT & CREDENTIAL CONFIGURATION</h3>
          </div>
          <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
          
          {/* Section: Alpaca Paper Trading Credentials */}
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              <Key size={16} />
              🦙 Alpaca API Credentials (Paper Trading)
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Alpaca API Key ID
                </label>
                <input
                  type="text"
                  placeholder="PKFE..."
                  value={config.alpacaApiKey || ''}
                  onChange={(e) => setConfig({ ...config, alpacaApiKey: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Alpaca Secret Key
                </label>
                <input
                  type="password"
                  placeholder="Personal Secret Key"
                  value={config.alpacaSecretKey || ''}
                  onChange={(e) => setConfig({ ...config, alpacaSecretKey: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Alpaca Base Environment URL
                </label>
                <input
                  type="text"
                  placeholder="https://paper-api.alpaca.markets"
                  value={config.alpacaBaseUrl || 'https://paper-api.alpaca.markets'}
                  onChange={(e) => setConfig({ ...config, alpacaBaseUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Section: AI LLM Credentials */}
          <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#818cf8', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              🧠 AI Model Credentials (OpenRouter)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  OpenRouter API Key (Optional for live reasoning)
                </label>
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={config.openRouterApiKey || ''}
                  onChange={(e) => setConfig({ ...config, openRouterApiKey: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  OpenRouter Primary Model
                </label>
                <input
                  type="text"
                  placeholder="anthropic/claude-3.5-sonnet"
                  value={config.openRouterModel || ''}
                  onChange={(e) => setConfig({ ...config, openRouterModel: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Section: Risk & Limits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Max Single Position Risk (% Equity)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.maxPositionRisk}
                onChange={(e) => setConfig({ ...config, maxPositionRisk: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Max Total Portfolio Exposure (% Equity)
              </label>
              <input
                type="number"
                step="0.05"
                value={config.maxPortfolioExposure}
                onChange={(e) => setConfig({ ...config, maxPortfolioExposure: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Daily Loss Circuit Breaker ($)
              </label>
              <input
                type="number"
                step="100"
                value={config.maxDailyLoss}
                onChange={(e) => setConfig({ ...config, maxDailyLoss: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Min AI Confidence (0.50 - 0.95)
              </label>
              <input
                type="number"
                step="0.05"
                value={config.minConfidence}
                onChange={(e) => setConfig({ ...config, minConfidence: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Scan Interval (ms)
            </label>
            <input
              type="number"
              step="5000"
              value={config.scanIntervalMs}
              onChange={(e) => setConfig({ ...config, scanIntervalMs: parseInt(e.target.value, 10) })}
              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '8px', color: '#fff' }}
            />
          </div>

        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>CANCEL</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> {saved ? 'SAVED!' : 'SAVE CONFIG'}
          </button>
        </div>

      </div>
    </div>
  );
};
