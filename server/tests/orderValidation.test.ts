import { describe, it, expect } from 'vitest';
import { OrderExecutor } from '../agent/executor.js';
import { AgentDecision } from '../agent/strategyEngine.js';
import { EvaluatedStrategy } from '../strategies/types.js';

describe('OrderExecutor', () => {
  const executor = new OrderExecutor();

  const sampleDecision: AgentDecision = {
    symbol: 'MSFT',
    strategy: 'LONG_CALL',
    direction: 'BULLISH',
    confidence: 0.82,
    thesis: 'Bullish trend continuation',
    entry_conditions: [],
    exit_conditions: [],
    risk_factors: [],
    max_loss: 200,
    expected_reward: 500,
    position_size: 1,
  };

  const sampleStrategy: EvaluatedStrategy = {
    strategy: 'LONG_CALL',
    underlyingSymbol: 'MSFT',
    underlyingPrice: 410,
    direction: 'BULLISH',
    legs: [],
    netDebit: 2.00,
    netCredit: 0,
    maxLoss: 200,
    maxReward: 500,
    riskRewardRatio: 2.5,
    breakEvenPrices: [412],
    daysToExpiration: 25,
    compositeScore: 0.82,
    rationale: 'Long call option',
  };

  it('should process trade execution in paper mode', async () => {
    const result = await executor.executeTrade(sampleDecision, sampleStrategy, 'test_cycle_1');
    expect(result.success).toBe(true);
    expect(result.status).toBeDefined();
  });
});
