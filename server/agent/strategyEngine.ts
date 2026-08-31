import { z } from 'zod';
import { getConfig, hasOpenRouterKey, hasAgenticKey } from '../config.js';
import { ScannedOpportunity } from './scanner.js';
import { EvaluatedStrategy } from '../strategies/types.js';

export const AgentDecisionSchema = z.object({
  symbol: z.string(),
  strategy: z.enum([
    'LONG_CALL',
    'LONG_PUT',
    'BULL_CALL_SPREAD',
    'BEAR_PUT_SPREAD',
    'COVERED_CALL',
    'CASH_SECURED_PUT',
  ]),
  direction: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL', 'VOLATILE']),
  confidence: z.number().min(0).max(1.0),
  thesis: z.string(),
  entry_conditions: z.array(z.string()),
  exit_conditions: z.array(z.string()),
  risk_factors: z.array(z.string()),
  max_loss: z.number().positive(),
  expected_reward: z.number().positive(),
  position_size: z.number().int().positive(),
  market_regime: z.string().optional(),
});

export type AgentDecision = z.infer<typeof AgentDecisionSchema>;

export class AIStrategyEngine {
  public async evaluateOpportunity(
    opportunity: ScannedOpportunity,
    candidateStrategy: EvaluatedStrategy
  ): Promise<AgentDecision> {
    const config = getConfig();

    const prompt = `
You are the quantitative AI Options Alpha Agent.
Analyze the following market candidate and evaluate whether to issue a trade proposal:

Candidate Info:
- Symbol: ${opportunity.symbol}
- Current Stock Price: $${opportunity.price}
- 1-Day Price Change: ${opportunity.changePercent}%
- Market Direction Indicator: ${opportunity.direction}
- Liquidity Score: ${opportunity.liquidityScore}
- Volatility Score: ${opportunity.volatilityScore}
- Momentum Score: ${opportunity.momentumScore}
- Options Quality Score: ${opportunity.optionsQualityScore}
- Composite Opportunity Rank Score: ${opportunity.compositeScore}

Proposed Options Strategy:
- Strategy Type: ${candidateStrategy.strategy}
- Net Debit / Premium: $${candidateStrategy.netDebit}
- Days To Expiration (DTE): ${candidateStrategy.daysToExpiration}
- Calculated Max Loss: $${candidateStrategy.maxLoss}
- Calculated Max Reward: $${candidateStrategy.maxReward}
- Risk/Reward Ratio: ${candidateStrategy.riskRewardRatio.toFixed(2)}
- Rationale: ${candidateStrategy.rationale}

Your task: Provide a structured JSON evaluation adhering STRICTLY to this schema:
{
  "symbol": "${opportunity.symbol}",
  "strategy": "${candidateStrategy.strategy}",
  "direction": "${candidateStrategy.direction}",
  "confidence": <number between 0.50 and 0.95>,
  "thesis": "<concise 2-sentence trading thesis explaining why this options trade offers an edge>",
  "entry_conditions": ["<condition 1>", "<condition 2>"],
  "exit_conditions": ["<exit condition 1>", "<exit condition 2>"],
  "risk_factors": ["<risk factor 1>", "<risk factor 2>"],
  "max_loss": ${candidateStrategy.maxLoss},
  "expected_reward": ${candidateStrategy.maxReward},
  "position_size": 1,
  "market_regime": "NORMAL_VOLATILITY"
}
Output raw JSON only.
`;

    // 1. OpenRouter API Key (OPENROUTER_API_KEY) - Primary Provider
    if (hasOpenRouterKey()) {
      try {
        console.log(`[AI Strategy Engine] Querying OpenRouter API (${config.openRouterModel}) for ${opportunity.symbol}...`);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.openRouterApiKey}`,
            'HTTP-Referer': 'https://github.com/alpaca-options-agent',
            'X-Title': 'Alpaca Options Alpha Agent',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.openRouterModel || 'anthropic/claude-3.5-sonnet',
            messages: [
              {
                role: 'system',
                content: 'You are the quantitative AI Options Alpha Agent. Output raw JSON adhering strictly to the user schema.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
        });

        if (res.ok) {
          const data = await res.json() as any;
          const text = data.choices?.[0]?.message?.content || data.content || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const validated = AgentDecisionSchema.parse(parsed);
            console.log(`[AI Strategy Engine] OpenRouter decision validated for ${opportunity.symbol} (${config.openRouterModel}). Confidence: ${(validated.confidence * 100).toFixed(0)}%`);
            return validated;
          }
        } else {
          const errText = await res.text();
          console.warn(`[AI Strategy Engine] OpenRouter API HTTP ${res.status}: ${errText}`);
        }
      } catch (err) {
        console.warn('[AI Strategy Engine] OpenRouter API call failed, falling back:', err);
      }
    }

    // 2. Agent Router API Key (AGENTIC_API_KEY) - Secondary Provider
    if (hasAgenticKey()) {
      try {
        console.log(`[AI Strategy Engine] Querying Agent Router API for ${opportunity.symbol}...`);
        const routerUrl = `${config.agentRouterBaseUrl}/chat/completions`;
        const res = await fetch(routerUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.agenticApiKey}`,
            'X-Api-Key': config.agenticApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'agent-router-default',
            messages: [
              {
                role: 'system',
                content: 'You are the quantitative AI Options Alpha Agent. You must output raw JSON only.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = await res.json() as any;
          const text = data.choices?.[0]?.message?.content || data.content || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const validated = AgentDecisionSchema.parse(parsed);
            console.log(`[AI Strategy Engine] Agent Router decision validated for ${opportunity.symbol}. Confidence: ${(validated.confidence * 100).toFixed(0)}%`);
            return validated;
          }
        } else {
          const errText = await res.text();
          console.warn(`[AI Strategy Engine] Agent Router API HTTP ${res.status}: ${errText}`);
        }
      } catch (err) {
        console.warn('[AI Strategy Engine] Agent Router API call failed, falling back to deterministic engine:', err);
      }
    }

    // 3. Deterministic Rule-Based AI Evaluator Fallback
    const confidence = Math.min(0.92, Math.max(0.72, opportunity.compositeScore * 0.95));
    const thesis = `Dynamic AI scanner identified strong ${opportunity.direction.toLowerCase()} momentum on ${opportunity.symbol} ($${opportunity.price}, ${opportunity.changePercent > 0 ? '+' : ''}${opportunity.changePercent}%). ${candidateStrategy.rationale}`;

    return {
      symbol: opportunity.symbol,
      strategy: candidateStrategy.strategy,
      direction: opportunity.direction,
      confidence: Math.round(confidence * 100) / 100,
      thesis,
      entry_conditions: [
        `Option Bid-Ask spread < $${config.maxBidAskSpread}`,
        `Portfolio exposure < ${(config.maxPortfolioExposure * 100).toFixed(0)}%`,
        `Underlying price > $${(opportunity.price * 0.98).toFixed(2)}`,
      ],
      exit_conditions: [
        'Stop-Loss triggered at 50% option premium loss',
        'Take-Profit triggered at 100% option premium gain',
        'Time exit when DTE < 2 days',
      ],
      risk_factors: [
        'Market-wide volatility expansion or unexpected news reversal',
        'Theta decay acceleration near expiration',
      ],
      max_loss: candidateStrategy.maxLoss,
      expected_reward: candidateStrategy.maxReward,
      position_size: 1,
      market_regime: opportunity.volatilityScore > 0.6 ? 'HIGH_VOLATILITY' : 'NORMAL_VOLATILITY',
    };
  }
}

export const aiStrategyEngine = new AIStrategyEngine();
