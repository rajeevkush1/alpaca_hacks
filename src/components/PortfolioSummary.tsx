import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Briefcase, ShieldAlert, Zap } from 'lucide-react';
import { AlpacaAccount, PerformanceAnalytics, AlpacaPosition } from '../types/index.js';

interface PortfolioSummaryProps {
  account: AlpacaAccount | null;
  analytics: PerformanceAnalytics;
  positions: AlpacaPosition[];
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ account, analytics, positions }) => {
  const equity = account ? parseFloat(account.equity || '100000') : 100000;
  const buyingPower = account ? parseFloat(account.buying_power || '100000') : 100000;
  const todaysPnl = analytics.todaysPnl;
  const totalPnl = analytics.totalPnl;

  let totalExposure = 0;
  for (const pos of positions) {
    totalExposure += Math.abs(parseFloat(pos.market_value || '0'));
  }
  const exposurePct = equity > 0 ? (totalExposure / equity) * 100 : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      
      {/* Account Equity Card */}
      <div className="glass-panel glass-card-interactive" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCOUNT EQUITY</span>
          <DollarSign size={18} className="text-cyan" />
        </div>
        <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Real-time Alpaca Paper Balance
        </div>
      </div>

      {/* Buying Power Card */}
      <div className="glass-panel glass-card-interactive" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>BUYING POWER</span>
          <Zap size={18} className="text-indigo" />
        </div>
        <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          ${buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Available for options trades
        </div>
      </div>

      {/* Today's P&L Card */}
      <div className="glass-panel glass-card-interactive" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S P&L</span>
          {todaysPnl >= 0 ? <TrendingUp size={18} className="text-emerald" /> : <TrendingDown size={18} className="text-crimson" />}
        </div>
        <div className={`font-mono ${todaysPnl >= 0 ? 'text-emerald' : 'text-crimson'}`} style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {todaysPnl >= 0 ? '+' : ''}${todaysPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Unrealized + Realized Day Change
        </div>
      </div>

      {/* Total P&L Card */}
      <div className="glass-panel glass-card-interactive" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL P&L</span>
          {totalPnl >= 0 ? <TrendingUp size={18} className="text-emerald" /> : <TrendingDown size={18} className="text-crimson" />}
        </div>
        <div className={`font-mono ${totalPnl >= 0 ? 'text-emerald' : 'text-crimson'}`} style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Cumulative strategy performance
        </div>
      </div>

      {/* Open Positions Card */}
      <div className="glass-panel glass-card-interactive" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPEN POSITIONS</span>
          <Briefcase size={18} className="text-amber" />
        </div>
        <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {positions.length}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Max limit: 5 positions
        </div>
      </div>

      {/* Portfolio Exposure Card */}
      <div className="glass-panel glass-card-interactive" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPOSURE</span>
          <ShieldAlert size={18} className="text-cyan" />
        </div>
        <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {exposurePct.toFixed(1)}%
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          ${totalExposure.toLocaleString('en-US', { maximumFractionDigits: 0 })} / 30% Limit
        </div>
      </div>

    </div>
  );
};
