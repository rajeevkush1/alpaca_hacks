import dotenv from 'dotenv';
dotenv.config();

export interface Config {
  port: number;
  alpacaApiKey: string;
  alpacaSecretKey: string;
  alpacaBaseUrl: string;
  alpacaDataUrl: string;
  openRouterApiKey: string;
  openRouterModel: string;
  agenticApiKey: string;
  agentRouterBaseUrl: string;
  maxPositionRisk: number;
  maxPortfolioExposure: number;
  maxDailyLoss: number;
  minConfidence: number;
  minLiquidity: number;
  maxBidAskSpread: number;
  maxOpenPositions: number;
  scanIntervalMs: number;
  useMcpCli: boolean;
}

export function loadConfig(): Config {
  return {
    port: parseInt(process.env.PORT || '3001', 10),
    alpacaApiKey: process.env.ALPACA_API_KEY || '',
    alpacaSecretKey: process.env.ALPACA_SECRET_KEY || '',
    alpacaBaseUrl: process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',
    alpacaDataUrl: process.env.ALPACA_DATA_URL || 'https://data.alpaca.markets',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
    agenticApiKey: process.env.AGENTIC_API_KEY || '',
    agentRouterBaseUrl: process.env.AGENT_ROUTER_BASE_URL || 'https://api.agentic.ai/v1',
    maxPositionRisk: parseFloat(process.env.MAX_POSITION_RISK || '0.05'),
    maxPortfolioExposure: parseFloat(process.env.MAX_PORTFOLIO_EXPOSURE || '0.30'),
    maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS || '1000'),
    minConfidence: parseFloat(process.env.MIN_CONFIDENCE || '0.70'),
    minLiquidity: parseFloat(process.env.MIN_LIQUIDITY || '100000'),
    maxBidAskSpread: parseFloat(process.env.MAX_BID_ASK_SPREAD || '0.15'),
    maxOpenPositions: parseInt(process.env.MAX_OPEN_POSITIONS || '5', 10),
    scanIntervalMs: parseInt(process.env.SCAN_INTERVAL || '60000', 10),
    useMcpCli: process.env.USE_MCP_CLI === 'true' || true,
  };
}

let activeConfig = loadConfig();

export function getConfig(): Config {
  return activeConfig;
}

export function updateConfig(newPartialConfig: Partial<Config>): Config {
  activeConfig = { ...activeConfig, ...newPartialConfig };
  return activeConfig;
}

export function hasAlpacaCredentials(): boolean {
  return Boolean(activeConfig.alpacaApiKey && activeConfig.alpacaSecretKey);
}

export function hasOpenRouterKey(): boolean {
  return Boolean(activeConfig.openRouterApiKey);
}

export function hasAgenticKey(): boolean {
  return Boolean(activeConfig.agenticApiKey);
}
