import { describe, it, expect } from 'vitest';
import { DeterministicRiskEngine } from '../agent/riskEngine.js';
import { AgentDecision } from '../agent/strategyEngine.js';
import { EvaluatedStrategy } from '../strategies/types.js';

describe('DeterministicRiskEngine', () => {
  const riskEngine = new DeterministicRiskEngine();

  const sampleDecision: AgentDecision = {
    symbol: 'AAPL',
    strategy: 'LONG_CALL',
    direction: 'BULLISH',
    confidence: 0.85,
    thesis: 'Bullish breakout setup',
    entry_conditions: ['Spread < $0.15'],
    exit_conditions: ['Stop loss 50%'],
    risk_factors: ['Earnings news'],
    max_loss: 250,
    expected_reward: 600,
    position_size: 1,
  };

  const sampleStrategy: EvaluatedStrategy = {
    strategy: 'LONG_CALL',
    underlyingSymbol: 'AAPL',
    underlyingPrice: 220,
    direction: 'BULLISH',
    legs: [],
    netDebit: 2.50,
    netCredit: 0,
    maxLoss: 250,
    maxReward: 600,
    riskRewardRatio: 2.4,
    breakEvenPrices: [222.50],
    daysToExpiration: 30,
    compositeScore: 0.85,
    rationale: 'Long call at $220 strike',
  };

  it('should PASS when all risk gates are satisfied', () => {
    const result = riskEngine.evaluateTrade(
      sampleDecision,
      sampleStrategy,
      {
        id: 'acc_1',
        account_number: '123',
        status: 'ACTIVE',
        currency: 'USD',
        buying_power: '100000',
        regt_buying_power: '100000',
        daytrading_buying_power: '100000',
        cash: '100000',
        portfolio_value: '100000',
        equity: '100000',
        last_equity: '100000',
        long_market_value: '0',
        short_market_value: '0',
        initial_margin: '0',
        maintenance_margin: '0',
        daytrade_count: 0,
        pattern_day_trader: false,
        trading_blocked: false,
        transfers_blocked: false,
        account_blocked: false,
        created_at: new Date().toISOString(),
      },
      []
    );

    expect(result.passed).toBe(true);
    expect(result.status).toBe('PASSED');
    expect(result.gates.every((g) => g.passed)).toBe(true);
  });

  it('should REJECT when confidence is below minimum threshold', () => {
    const lowConfDecision = { ...sampleDecision, confidence: 0.50 };
    const result = riskEngine.evaluateTrade(
      lowConfDecision,
      sampleStrategy,
      null,
      []
    );

    expect(result.passed).toBe(false);
    expect(result.status).toBe('OVERRIDDEN');
    expect(result.reason).toContain('Confidence');
  });

  it('should REJECT when position max loss exceeds single position risk limit', () => {
    const highRiskStrategy = { ...sampleStrategy, maxLoss: 15000 };
    const result = riskEngine.evaluateTrade(
      sampleDecision,
      highRiskStrategy,
      null,
      []
    );

    expect(result.passed).toBe(false);
    expect(result.status).toBe('OVERRIDDEN');
    expect(result.reason).toContain('exceeds maximum allowed risk limit');
  });
});
