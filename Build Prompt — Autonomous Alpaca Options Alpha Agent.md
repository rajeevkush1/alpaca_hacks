# Build Prompt — Autonomous Alpaca Options Alpha Agent

Build a production-quality **AI-powered autonomous options trading agent** for the **Alpaca AI Trading Agents Hackathon — Options Alpha Agents** track.

## Objective

Build an autonomous agent that uses **live market data from Alpaca** and operates exclusively in the **Alpaca paper-trading environment**.

The agent must independently:

1. Discover tradable opportunities.
2. Analyze stocks and their options chains.
3. Generate a trading thesis.
4. Select an options strategy.
5. Calculate risk and position sizing.
6. Apply strict risk gates.
7. Submit paper orders through Alpaca.
8. Monitor open positions.
9. Decide when to hold, adjust, or exit.
10. Record every decision and its outcome.
11. Continuously evaluate strategy performance.

The system must be genuinely connected to Alpaca. **Do NOT build a simulated trading engine or fake trading dashboard.**

---

# NON-NEGOTIABLE REQUIREMENTS

### 1. Alpaca integration

Use Alpaca's actual:

- Trading API
- Market Data API
- Options data
- Account/portfolio endpoints
- Order endpoints
- Positions endpoints
- Orders/history endpoints

Also integrate **either Alpaca MCP Server or Alpaca CLI**, preferably MCP where practical.

All credentials must come from environment variables.

Example:

```env
ALPACA_API_KEY=
ALPACA_SECRET_KEY=
ALPACA_BASE_URL=
ALPACA_DATA_URL=
```

Never expose credentials in frontend code.

---

# 2. NO HARDCODED MARKET DATA

This is extremely important.

DO NOT hardcode:

- stock prices
- option prices
- strikes
- expiration dates
- Greeks
- account balance
- buying power
- P&L
- positions
- market status
- volume
- volatility
- news
- trade results
- performance metrics
- winning trades
- portfolio values

Every market/account/trading value shown by the application must come from a real API response or be calculated from real API data.

Bad:

```javascript
const price = 245.32;
const pnl = 1240;
```

Good:

```javascript
const quote = await alpaca.getLatestQuote(symbol);
```

If Alpaca does not provide a particular metric directly, calculate it from retrieved data.

If data is unavailable, clearly display:

> Data unavailable

Never substitute fake values.

---

# 3. Autonomous Trading Agent

Implement an actual agent loop.

Architecture:

```text
Market Data
     ↓
Market Scanner
     ↓
Opportunity Detector
     ↓
AI Strategy Engine
     ↓
Risk Engine
     ↓
Risk Gates
     ↓
Trade Decision
     ↓
Alpaca Order Execution
     ↓
Position Monitor
     ↓
Exit / Adjustment Decision
     ↓
Performance Memory
     ↓
Next Decision Cycle
```

The agent should be able to operate without manually selecting a ticker or trade.

---

# 4. Options-only strategy requirement

Every trading strategy must incorporate options.

Do not build a stock-only trading agent.

The agent may consider strategies such as:

- Long Call
- Long Put
- Covered Call
- Cash-Secured Put
- Bull Call Spread
- Bear Put Spread
- Call Debit Spread
- Put Debit Spread
- Credit Spreads
- Protective Put
- Collar
- Volatility-based strategies

Do NOT blindly implement every strategy.

Start with a small number of strategies that can be objectively evaluated and explain why the agent selected one.

---

# 5. Opportunity Detection

Build a dynamic scanner.

Do not scan only hardcoded symbols.

The scanner should retrieve an appropriate universe of liquid tradable securities from Alpaca and dynamically identify candidates based on available data.

Potential signals can include:

- price momentum
- realized volatility
- implied volatility
- volume
- liquidity
- bid/ask spread
- unusual activity where data supports it
- trend
- volatility regime
- earnings proximity
- market regime
- technical indicators
- option-chain characteristics

The system should rank opportunities rather than simply choosing the first symbol.

Example:

```text
Candidate
   ↓
Liquidity Score
   ↓
Volatility Score
   ↓
Momentum Score
   ↓
Options Quality
   ↓
Risk/Reward
   ↓
Composite Opportunity Score
```

All thresholds should be configurable rather than buried throughout the code.

---

# 6. AI Decision Engine

Use an LLM as the reasoning layer, but do NOT allow the LLM to directly execute unrestricted trades.

The AI should produce structured output such as:

```json
{
  "symbol": "...",
  "strategy": "...",
  "direction": "...",
  "confidence": 0.0,
  "thesis": "...",
  "entry_conditions": [],
  "exit_conditions": [],
  "risk_factors": [],
  "max_loss": 0,
  "expected_reward": 0,
  "position_size": 0
}
```

The output must then pass through deterministic risk validation.

Use structured schemas/Pydantic/Zod rather than parsing arbitrary LLM text.

---

# 7. Risk Engine

Implement deterministic risk controls.

At minimum:

### Position risk

Calculate:

- maximum loss
- maximum potential profit
- risk/reward ratio
- position size
- portfolio exposure
- concentration
- buying-power impact

### Trade gates

Reject trades when:

- liquidity is insufficient
- bid/ask spread is excessive
- maximum portfolio exposure would be exceeded
- maximum position size would be exceeded
- estimated loss exceeds configured limits
- options contract data is incomplete
- market is closed
- account cannot support the order
- contract has insufficient volume/open interest when available
- confidence is below the configured threshold

The risk engine must be capable of overriding the AI.

Architecture:

```text
AI says BUY
     ↓
Risk Engine
     ↓
PASS → Execute
FAIL → Reject + Explain
```

---

# 8. Position Management

The agent must continuously monitor existing positions.

For every position track:

- entry price
- current price
- unrealized P&L
- realized P&L
- expiration
- time to expiration
- Greeks where available/calculable
- position exposure
- risk status
- original thesis
- current thesis
- exit conditions

The agent should be able to decide:

```text
HOLD
EXIT
ADJUST
REDUCE
REJECT
```

Do not create an adjustment unless the strategy explicitly supports it.

---

# 9. Autonomous Execution

Orders must be submitted using Alpaca's paper trading API.

Implement:

- order validation
- duplicate-order prevention
- order status tracking
- retry handling
- failed-order handling
- partial-fill handling where applicable
- cancellation handling
- execution logging

Never assume an order succeeded simply because an order request was sent.

Verify the actual order status from Alpaca.

---

# 10. Agent Memory

Create persistent storage for:

### Trade memory

```text
trade_id
timestamp
symbol
strategy
thesis
entry
exit
risk
result
reason_for_entry
reason_for_exit
agent_confidence
market_regime
```

### Decision memory

Store:

- previous decisions
- rejected trades
- risk-gate failures
- successful trades
- failed trades
- strategy performance

This allows the system to analyze its historical behavior.

---

# 11. Performance Analytics

Build real analytics using actual Alpaca account/trade data.

Display:

- total P&L
- daily P&L
- realized P&L
- unrealized P&L
- win rate
- average win
- average loss
- profit factor
- maximum drawdown
- number of trades
- strategy-level performance
- risk-adjusted performance where meaningful

Do not fabricate any metrics.

If insufficient historical data exists, show:

> Insufficient data

rather than inventing a number.

---

# 12. Dashboard

Create a professional trading-agent dashboard.

Suggested layout:

### Header

```text
OPTIONS ALPHA AGENT
● Connected to Alpaca
● Paper Trading
Market: OPEN/CLOSED
Agent: RUNNING/PAUSED
```

### Portfolio

```text
Account Equity
Buying Power
Today's P&L
Total P&L
Open Positions
Exposure
```

### Agent Brain

Show the latest reasoning:

```text
MARKET REGIME
↓

OPPORTUNITY DETECTED
↓

STRATEGY SELECTED
↓

RISK CHECK

✓ Liquidity
✓ Position Size
✓ Max Loss
✓ Exposure

↓

DECISION
BUY / HOLD / EXIT / REJECT
```

### Live Positions

Show actual positions retrieved from Alpaca.

### Opportunity Scanner

Show dynamically discovered opportunities.

### Trade Journal

Show historical agent decisions and outcomes.

### Risk Monitor

Show:

- portfolio exposure
- position concentration
- max loss
- risk-gate failures
- current risk state

---

# 13. Agent Control

Provide controls:

```text
START AGENT
PAUSE AGENT
STOP AGENT
SCAN NOW
REFRESH DATA
```

Stopping the agent must prevent new trades.

Pausing must stop new trade decisions while still allowing monitoring of existing positions.

---

# 14. Safety

Implement:

- paper trading only
- environment-based credentials
- server-side API calls
- rate-limit handling
- request logging
- error handling
- order idempotency
- maximum daily loss gate
- maximum position exposure
- maximum number of simultaneous positions
- emergency stop

Never implement a path that accidentally sends orders to a live account.

Require explicit configuration for the Alpaca paper endpoint.

---

# 15. Configuration

Create a central configuration system.

Example:

```env
MAX_POSITION_RISK=
MAX_PORTFOLIO_EXPOSURE=
MAX_DAILY_LOSS=
MIN_CONFIDENCE=
MIN_LIQUIDITY=
MAX_BID_ASK_SPREAD=
MAX_OPEN_POSITIONS=
SCAN_INTERVAL=
```

Do not scatter magic numbers throughout the application.

---

# 16. Real-Time Updates

Do not rely exclusively on page refreshes.

Where supported, use streaming/websocket mechanisms for:

- quotes
- trades
- order updates
- account changes
- position updates

Use polling only where streaming is unavailable or inappropriate.

---

# 17. Error States

Every external API interaction must handle:

- timeout
- authentication failure
- rate limit
- invalid symbol
- missing options chain
- unavailable market data
- rejected order
- network failure
- malformed response

The UI should show meaningful errors instead of crashing.

---

# 18. Development Mode

Create a clear separation between:

```text
Development
Testing
Paper Trading
```

Do NOT create fake market data and present it as real.

For unit tests, mocks may be used internally, but the production dashboard must always clearly distinguish mocked test data from Alpaca data.

---

# 19. Auditability

Every autonomous decision must produce an audit record.

Example:

```text
10:42:13
Scanner discovered XYZ

10:42:14
Momentum: ...
Volatility: ...
Liquidity: ...

10:42:15
AI selected Bull Call Spread

10:42:15
Risk Engine:
Max Loss: ...
Expected Reward: ...
Exposure: ...

10:42:16
Risk Gate: PASSED

10:42:17
Order submitted to Alpaca

10:42:18
Order status: FILLED
```

All values must be generated dynamically.

---

# 20. One-page hackathon write-up

Generate a page inside the application/documentation explaining:

### AI Logic
How the agent detects opportunities and chooses strategies.

### Risk Gates
How deterministic controls prevent unsafe trades.

### Alpaca Infrastructure
How Trading API + MCP/CLI are integrated.

### Autonomous Loop
How the agent continuously scans, decides, executes and manages positions.

### Results
Show actual paper-trading performance once data exists.

Do not invent performance results.

---

# TECHNICAL QUALITY

Use a clean architecture with separation between:

```text
/frontend
/backend
/agent
/alpaca
/strategies
/risk
/data
/database
/tests
```

Use strong typing.

Validate all external API responses.

Keep secrets server-side.

Use reusable services instead of putting business logic inside UI components.

Add logging and structured error handling.

Write tests for:

- strategy selection
- risk calculations
- risk gates
- position sizing
- order validation
- duplicate-order prevention
- API failure handling
- agent state transitions

---

# IMPORTANT ANTI-HARDCODING RULE

Before considering the project complete, search the entire codebase for suspicious hardcoded trading values.

There must be NO hardcoded:

- prices
- P&L
- positions
- account balances
- option contracts
- market conditions
- trade outcomes
- performance statistics

Hardcoded configuration defaults are acceptable only when clearly documented and configurable through environment/configuration.

The final application must be capable of connecting to a **fresh $100,000 Alpaca paper account** and operating using the account's actual state.

---

# FINAL ACCEPTANCE TEST

Before declaring the project finished:

1. Connect to Alpaca paper account.
2. Retrieve actual account information.
3. Retrieve actual market data.
4. Discover candidates dynamically.
5. Retrieve real options information.
6. Generate a strategy.
7. Run deterministic risk gates.
8. Submit a paper order if all gates pass.
9. Verify the actual order status.
10. Display the resulting position.
11. Monitor the position.
12. Record the decision.
13. Calculate performance from actual data.
14. Restart the application and confirm state persists.
15. Confirm no hardcoded trading data exists.
16. Confirm Alpaca MCP server OR CLI is genuinely used.
17. Confirm the entire system works with a fresh $100,000 paper account.

Do not mark the project complete if the dashboard only looks functional while the backend is mocked.

The final result should feel like a **real autonomous AI options trading desk**, not a static trading dashboard.