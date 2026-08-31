import { describe, it, expect } from 'vitest';
import { OptionsStrategyEvaluator } from '../strategies/evaluator.js';
import { AgentDecisionSchema } from '../agent/strategyEngine.js';

describe('OptionsStrategyEvaluator & Schema', () => {
  const evaluator = new OptionsStrategyEvaluator();

  it('should parse OCC Option Symbol format correctly', () => {
    const parsed = evaluator.parseOccSymbol('AAPL260918C00230000');
    expect(parsed).not.toBeNull();
    expect(parsed?.underlying).toBe('AAPL');
    expect(parsed?.type).toBe('call');
    expect(parsed?.strike).toBe(230);
    expect(parsed?.expiration).toBe('2026-09-18');
  });

  it('should calculate DTE accurately', () => {
    const exp = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dte = evaluator.calculateDTE(exp);
    expect(dte).toBeGreaterThanOrEqual(9);
    expect(dte).toBeLessThanOrEqual(11);
  });

  it('should validate structured AgentDecision schema correctly', () => {
    const validJson = {
      symbol: 'NVDA',
      strategy: 'LONG_CALL',
      direction: 'BULLISH',
      confidence: 0.88,
      thesis: 'Strong momentum and high options volume on NVDA',
      entry_conditions: ['Bid-ask spread < $0.15'],
      exit_conditions: ['Take profit 100%'],
      risk_factors: ['Earnings release nearby'],
      max_loss: 300,
      expected_reward: 750,
      position_size: 1,
    };

    const parsed = AgentDecisionSchema.safeParse(validJson);
    expect(parsed.success).toBe(true);
  });
});
