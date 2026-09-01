import React, { useState } from 'react';
import { useAgentState } from './hooks/useAgentState.js';
import { Header } from './components/Header.js';
import { PortfolioSummary } from './components/PortfolioSummary.js';
import { AgentBrain } from './components/AgentBrain.js';
import { OpportunityScanner } from './components/OpportunityScanner.js';
import { LivePositions } from './components/LivePositions.js';
import { RiskMonitor } from './components/RiskMonitor.js';
import { TradeJournal } from './components/TradeJournal.js';
import { PerformanceAnalyticsView } from './components/PerformanceAnalytics.js';
import { ConfigModal } from './components/ConfigModal.js';
import { LayoutDashboard, Search, Briefcase, ShieldAlert, BookOpen, BarChart2 } from 'lucide-react';

export function App() {
  const {
    brainState,
    account,
    positions,
    opportunities,
    decisions,
    riskLogs,
    analytics,
    statusInfo,
    sendControl,
    triggerScan,
    refreshData,
  } = useAgentState();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'positions' | 'risk' | 'journal' | 'analytics'>('dashboard');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'positions', label: `Positions (${positions.length})`, icon: Briefcase },
    { id: 'risk', label: 'Risk Monitor', icon: ShieldAlert },
    { id: 'journal', label: `Journal (${decisions.length})`, icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header */}
      <Header
        agentStatus={brainState.status}
        alpacaConnected={statusInfo.alpacaConnected}
        openRouterConfigured={statusInfo.openRouterConfigured}
        openRouterModel={statusInfo.openRouterModel}
        agenticConfigured={statusInfo.agenticConfigured}
        marketOpen={statusInfo.marketOpen}
        onControl={sendControl}
        onScan={triggerScan}
        onRefresh={refreshData}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Portfolio Quick Cards */}
      <PortfolioSummary account={account} analytics={analytics} positions={positions} />

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-card)', paddingBottom: '12px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="btn"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(99,102,241,0.2) 100%)' : 'rgba(255,255,255,0.03)',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'transparent'}`,
                boxShadow: isActive ? 'var(--cyan-glow)' : 'none',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content View */}
      {activeTab === 'dashboard' && (
        <>
          <AgentBrain brainState={brainState} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <LivePositions positions={positions} onRefresh={refreshData} />
            <OpportunityScanner opportunities={opportunities} onTriggerScan={triggerScan} />
          </div>
        </>
      )}

      {activeTab === 'scanner' && (
        <OpportunityScanner opportunities={opportunities} onTriggerScan={triggerScan} />
      )}

      {activeTab === 'positions' && (
        <LivePositions positions={positions} onRefresh={refreshData} />
      )}

      {activeTab === 'risk' && (
        <RiskMonitor riskLogs={riskLogs} />
      )}

      {activeTab === 'journal' && (
        <TradeJournal decisions={decisions} />
      )}

      {activeTab === 'analytics' && (
        <PerformanceAnalyticsView analytics={analytics} />
      )}

      {/* Config Slide-Over Modal */}
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

    </div>
  );
}
