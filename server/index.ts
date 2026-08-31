import express from 'express';
import cors from 'cors';
import { getConfig, updateConfig, hasAlpacaCredentials, hasOpenRouterKey, hasAgenticKey } from './config.js';
import { alpacaClient } from './alpaca/client.js';
import { agentLoop } from './agent/loop.js';
import { getDecisions, getTrades, getRiskLogs, getAuditTrail } from './db/database.js';
import { agentMemory } from './agent/memory.js';
import { marketScanner } from './agent/scanner.js';
import { mcpWrapper } from './alpaca/mcpWrapper.js';

const app = express();
app.use(cors());
app.use(express.json());

const config = getConfig();

// Status endpoint
app.get('/api/status', async (req, res) => {
  const clock = await alpacaClient.getClock();
  const mcpStatus = await mcpWrapper.checkAvailability();

  res.json({
    agentStatus: agentLoop.getStatus(),
    alpacaConnected: hasAlpacaCredentials(),
    openRouterConfigured: hasOpenRouterKey(),
    openRouterModel: config.openRouterModel,
    agenticConfigured: hasAgenticKey(),
    paperMode: true,
    marketOpen: clock?.is_open || false,
    clock,
    mcpStatus,
  });
});

// Agent controls
app.post('/api/agent/control', (req, res) => {
  const { action } = req.body;
  if (action === 'start') {
    agentLoop.start();
  } else if (action === 'pause') {
    agentLoop.pause();
  } else if (action === 'stop') {
    agentLoop.stop();
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }
  res.json({ status: agentLoop.getStatus() });
});

app.post('/api/agent/scan', async (req, res) => {
  await agentLoop.triggerManualScan();
  res.json({ success: true, message: 'Manual scan completed' });
});

// Account & Positions
app.get('/api/account', async (req, res) => {
  const account = await alpacaClient.getAccount();
  res.json(account || {
    id: 'PAPER_MODE',
    status: 'ACTIVE',
    buying_power: '100000.00',
    cash: '100000.00',
    equity: '100000.00',
    portfolio_value: '100000.00',
    last_equity: '100000.00',
  });
});

app.get('/api/positions', async (req, res) => {
  const positions = await alpacaClient.getPositions();
  res.json(positions);
});

// Market Scanner
app.get('/api/scanner', async (req, res) => {
  const opportunities = await marketScanner.scanUniverse();
  res.json(opportunities);
});

// Database queries
app.get('/api/decisions', (req, res) => {
  const decisions = getDecisions(100);
  res.json(decisions);
});

app.get('/api/trades', (req, res) => {
  const trades = getTrades();
  res.json(trades);
});

app.get('/api/analytics', async (req, res) => {
  const account = await alpacaClient.getAccount();
  const positions = await alpacaClient.getPositions();
  const analytics = agentMemory.calculatePerformance(account, positions);
  res.json(analytics);
});

app.get('/api/risk', async (req, res) => {
  const logs = getRiskLogs(100);
  const account = await alpacaClient.getAccount();
  const positions = await alpacaClient.getPositions();
  const portfolioEquity = account ? parseFloat(account.equity || '100000') : 100000;

  let totalExposure = 0;
  for (const p of positions) {
    totalExposure += Math.abs(parseFloat(p.market_value || '0'));
  }

  res.json({
    config: getConfig(),
    currentExposure: Math.round(totalExposure * 100) / 100,
    exposurePercent: Math.round((totalExposure / portfolioEquity) * 10000) / 100,
    openPositionsCount: positions.length,
    riskLogs: logs,
  });
});

app.get('/api/audit', (req, res) => {
  const audit = getAuditTrail(100);
  res.json(audit);
});

// Configuration endpoints
app.get('/api/config', (req, res) => {
  res.json(getConfig());
});

app.post('/api/config', (req, res) => {
  const updated = updateConfig(req.body);
  res.json(updated);
});

// Server-Sent Events (SSE) Stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const unsubscribe = agentLoop.subscribe((state) => {
    res.write(`data: ${JSON.stringify(state)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// Serve static frontend in production container environment
import path from 'path';
import fs from 'fs';

const clientDistPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n🦙 Autonomous Alpaca Options Alpha Agent backend running on http://localhost:${PORT}`);
  console.log(`- Paper Base URL: ${config.alpacaBaseUrl}`);
  console.log(`- Data Base URL: ${config.alpacaDataUrl}`);
  console.log(`- Alpaca Credentials: ${hasAlpacaCredentials() ? 'CONFIGURED' : 'NOT CONFIGURED (Safe Inspection Mode)'}`);
  console.log(`- OpenRouter AI Key: ${hasOpenRouterKey() ? `CONFIGURED (${config.openRouterModel})` : 'NOT CONFIGURED'}`);
  console.log(`- Agent Router Key: ${hasAgenticKey() ? 'CONFIGURED (Agentic API)' : 'NOT CONFIGURED'}`);
});
