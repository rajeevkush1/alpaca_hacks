import { alpacaClient, StockSnapshot } from '../alpaca/client.js';
import { optionsEvaluator } from '../strategies/evaluator.js';
import { EvaluatedStrategy, MarketDirection } from '../strategies/types.js';

export interface ScannedOpportunity {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  liquidityScore: number;    // 0.0 to 1.0
  volatilityScore: number;   // 0.0 to 1.0
  momentumScore: number;     // 0.0 to 1.0
  optionsQualityScore: number; // 0.0 to 1.0
  riskRewardScore: number;   // 0.0 to 1.0
  compositeScore: number;    // 0.0 to 1.0
  direction: MarketDirection;
  strategies: EvaluatedStrategy[];
  scannedAt: string;
}

export class MarketScanner {
  // Default liquid universe candidates to inspect dynamically via Alpaca snapshots
  private baseUniverse: string[] = [
    'SPY', 'QQQ', 'AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMD',
    'AMZN', 'META', 'GOOGL', 'IWM', 'BAC', 'DIS', 'NFLX', 'JPM'
  ];

  private defaultReferencePrices: Record<string, number> = {
    SPY: 590.50, QQQ: 510.20, AAPL: 232.10, NVDA: 131.80, TSLA: 224.50,
    MSFT: 412.30, AMD: 112.40, AMZN: 201.60, META: 654.20, GOOGL: 182.50,
    IWM: 221.10, BAC: 44.80, DIS: 112.30, NFLX: 685.40, JPM: 231.20
  };

  public async scanUniverse(): Promise<ScannedOpportunity[]> {
    console.log(`[Market Scanner] Scanning universe of ${this.baseUniverse.length} liquid assets via Alpaca Market Data...`);

    const snapshots = await alpacaClient.getStockSnapshots(this.baseUniverse);
    const opportunities: ScannedOpportunity[] = [];

    const nowIso = new Date().toISOString();

    for (const symbol of this.baseUniverse) {
      const snap: StockSnapshot | undefined = snapshots[symbol];
      const closePrice = snap?.latestTrade?.p || snap?.dailyBar?.c || snap?.prevDailyBar?.c || this.defaultReferencePrices[symbol] || 0;

      if (closePrice <= 0) {
        continue;
      }

      const openPrice = snap?.dailyBar?.o || snap?.prevDailyBar?.c || closePrice;
      const changePercent = openPrice > 0 ? ((closePrice - openPrice) / openPrice) * 100 : 0;
      const volume = snap?.dailyBar?.v || 1000000;

      // Determine market direction indicator
      const direction: MarketDirection = changePercent >= 0.3
        ? 'BULLISH'
        : changePercent <= -0.3
          ? 'BEARISH'
          : 'NEUTRAL';

      // 1. Liquidity Score: Normalized volume & trade frequency
      const liquidityScore = Math.min(1.0, Math.max(0.2, volume / 10000000));

      // 2. Volatility Score: Price movement range
      const high = snap?.dailyBar?.h || closePrice * 1.01;
      const low = snap?.dailyBar?.l || closePrice * 0.99;
      const dayRangePct = closePrice > 0 ? ((high - low) / closePrice) * 100 : 1.5;
      const volatilityScore = Math.min(1.0, Math.max(0.1, dayRangePct / 4.0));

      // 3. Momentum Score: Direct strength of price change magnitude
      const momentumScore = Math.min(1.0, Math.max(0.1, Math.abs(changePercent) / 3.0));

      // Fetch options snapshots dynamically from Alpaca
      const optionsSnaps = await alpacaClient.getOptionsSnapshots(symbol);

      // Evaluate options strategies for candidate
      const evaluatedStrategies = optionsEvaluator.evaluateCandidate(
        symbol,
        closePrice,
        direction === 'NEUTRAL' ? 'BULLISH' : direction,
        optionsSnaps
      );

      const topStrat = evaluatedStrategies[0];
      const optionsQualityScore = Object.keys(optionsSnaps).length > 0 ? 0.9 : 0.75;
      const riskRewardScore = topStrat ? Math.min(1.0, topStrat.riskRewardRatio / 3.0) : 0.5;

      // Weighted Composite Opportunity Score calculation
      const compositeScore = Math.round(
        (liquidityScore * 0.25 +
          volatilityScore * 0.20 +
          momentumScore * 0.20 +
          optionsQualityScore * 0.15 +
          riskRewardScore * 0.20) * 100
      ) / 100;

      opportunities.push({
        symbol,
        price: closePrice,
        changePercent: Math.round(changePercent * 100) / 100,
        volume,
        liquidityScore: Math.round(liquidityScore * 100) / 100,
        volatilityScore: Math.round(volatilityScore * 100) / 100,
        momentumScore: Math.round(momentumScore * 100) / 100,
        optionsQualityScore: Math.round(optionsQualityScore * 100) / 100,
        riskRewardScore: Math.round(riskRewardScore * 100) / 100,
        compositeScore,
        direction,
        strategies: evaluatedStrategies,
        scannedAt: nowIso,
      });
    }

    // Sort opportunities descending by composite score
    opportunities.sort((a, b) => b.compositeScore - a.compositeScore);

    console.log(`[Market Scanner] Scan complete. Top candidate: ${opportunities[0]?.symbol || 'None'} (Score: ${opportunities[0]?.compositeScore || 0})`);
    return opportunities;
  }
}

export const marketScanner = new MarketScanner();
