export type StrategyType =
  | 'LONG_CALL'
  | 'LONG_PUT'
  | 'BULL_CALL_SPREAD'
  | 'BEAR_PUT_SPREAD'
  | 'COVERED_CALL'
  | 'CASH_SECURED_PUT';

export type MarketDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE';

export interface OptionLeg {
  symbol: string;
  underlying: string;
  type: 'call' | 'put';
  side: 'buy' | 'sell';
  strike: number;
  expiration: string;
  price: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  iv?: number;
}

export interface EvaluatedStrategy {
  strategy: StrategyType;
  underlyingSymbol: string;
  underlyingPrice: number;
  direction: MarketDirection;
  legs: OptionLeg[];
  netDebit: number;       // Per contract net price paid (positive for debit)
  netCredit: number;      // Per contract net price received
  maxLoss: number;        // Max loss per 100-share contract
  maxReward: number;      // Max profit per 100-share contract
  riskRewardRatio: number;
  breakEvenPrices: number[];
  daysToExpiration: number;
  compositeScore: number;
  rationale: string;
}
