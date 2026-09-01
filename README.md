# 🦙 Autonomous Alpaca Options Alpha Agent

[![Alpaca AI Trading Agents Hackathon](https://img.shields.io/badge/Hackathon-Alpaca%20AI%20Trading%20Agents-🦙%20yellow)](https://alpaca.markets)
[![Live GCP Demo](https://img.shields.io/badge/GCP%20Cloud%20Run-Live%20Demo-4285F4?logo=googlecloud)](https://alpaca-options-agent-423150728087.us-central1.run.app)
[![Track](https://img.shields.io/badge/Track-Options%20Alpha%20Agents-blueviolet)](#)
[![Paper Trading](https://img.shields.io/badge/Environment-Alpaca%20Paper%20Trading-success)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff)](https://vitejs.dev/)

An autonomous, end-to-end **AI-powered options trading agent** built for the **Alpaca AI Trading Agents Hackathon**. The agent operates live in the **Alpaca Paper-Trading Environment**, discovering opportunities, analyzing options chains, generating trading theses, sizing risk, executing multi-leg options orders, monitoring positions, and recording full audit trails.

> 🌐 **Live GCP Cloud Run Deployment**: [https://alpaca-options-agent-423150728087.us-central1.run.app](https://alpaca-options-agent-423150728087.us-central1.run.app)

---

## 🌟 Key Features

* **🦙 Live Alpaca Integration**: Real-time connection to Alpaca's Trading API, Market Data API, and Options Chains. No hardcoded prices, Greeks, positions, or balances.
* **🧠 Autonomous AI Reasoning Engine**: LLM-driven decision loop (powered by OpenRouter / Gemini / Claude) combined with deterministic options pricing and strategy evaluation.
* **🎯 Multi-Strategy Options Engine**: Supports dynamic selection across multiple strategies:
  * **Covered Call**
  * **Cash-Secured Put**
  * **Long Call / Long Put**
  * **Bull Call Spread / Bear Put Spread**
* **🛡️ Strict Risk Management & Gatekeeping**:
  * Max portfolio exposure limit (%)
  * Max single-position size limit (%)
  * Max account loss limit & daily drawdown limits
  * Automatic stop-loss and take-profit monitoring
* **⚡ Real-Time Live Dashboard**: Responsive React 19 UI built with Vite, Tailwind-styled Vanilla CSS, Recharts, and Server-Sent Events (SSE) streaming live status updates.
* **📜 Complete Audit Trail & Trade Journal**: Every market scan, AI reasoning prompt, risk check pass/fail, and order submission is recorded in a persistent log database.
* **🛠️ MCP Server Ready**: Prepared to interface with the Alpaca Model Context Protocol (MCP) tool server.

---

## 📐 Detailed System Design

The **Autonomous Alpaca Options Alpha Agent** is designed as a decoupled, multi-layered event-driven system operating an autonomous loop every 5 minutes (or on-demand manual triggers).

### 🏗️ Architecture Component Diagram

```mermaid
flowchart TD
    UI["React Frontend Dashboard"] -->|HTTP & SSE API| Server["Express Backend Server"]
    
    subgraph Agent Core Architecture
        Server --> Loop["Agent Autonomous Loop"]
        Loop --> Scanner["Market Opportunity Scanner"]
        Loop --> Strategy["Options Strategy Engine"]
        Loop --> Risk["Risk Gatekeeper Engine"]
        Loop --> Memory["Memory & Audit Store"]
    end

    subgraph External Integrations
        Strategy -->|LLM Prompts| AI["OpenRouter AI Engine"]
        Loop -->|Trading API| Alpaca["Alpaca Paper Trading API"]
        Server -.->|Protocol Bridge| MCP["Alpaca MCP Server"]
    end
```

### 🔄 Trade Execution Sequence Diagram

```mermaid
sequenceDiagram
    participant Loop as Agent Loop
    participant Alpaca as Alpaca Paper API
    participant Scanner as Opportunity Scanner
    participant LLM as OpenRouter AI
    participant Risk as Risk Gatekeeper
    participant Exec as Order Executor
    participant DB as Audit Database

    Loop->>Alpaca: 1. Fetch Account Equity & Buying Power
    Alpaca-->>Loop: Return Account Details
    Loop->>Scanner: 2. Scan Tickers & Options Chains
    Scanner->>Alpaca: Request Volatility & RSI Snapshots
    Alpaca-->>Scanner: Return Market Snapshots
    Scanner-->>Loop: Return Opportunity Candidates
    Loop->>LLM: 3. Request Thesis & Strategy JSON
    LLM-->>Loop: Return Strategy & Confidence Score
    Loop->>Risk: 4. Evaluate 6-Gate Risk Engine
    Risk->>DB: Log Risk Check Results
    Risk->>Exec: Approve Execution Proposal
    Exec->>Alpaca: 5. Submit Options Order
    Alpaca-->>Exec: Return Order Confirmation ID
    Exec->>DB: 6. Record Trade & Audit Journal
```

### 🧠 7-Step Autonomous Trading Engine

1. **Market Universe Scanner (`scanner.ts`)**: Retrieves stock quotes, historical daily bars, technical indicators (20 SMA, 50 SMA, RSI, Implied Volatility), and option chain snapshots across liquid market tickers (`AAPL`, `MSFT`, `NVDA`, `AMD`, `SPY`, `QQQ`).
2. **Options Strategy Evaluator (`strategyEngine.ts`)**: Formulates an options thesis selecting from 5 multi-leg strategies:
   * **Covered Call** (Bullish / Neutral income)
   * **Cash-Secured Put** (Neutral / Moderate Bullish entry)
   * **Long Call / Long Put** (High-conviction directional movement)
   * **Bull Call Spread / Bear Put Spread** (Defined-risk vertical spreads)
3. **AI Reasoning Prompt Engine**: Sends real-time market data to OpenRouter (`anthropic/claude-3.5-sonnet` / `google/gemini-2.5-flash`) to generate structured JSON rationale, directional confidence rating (0.0 to 1.0), and recommended strike prices.
4. **Deterministic Risk Gatekeeper (`riskEngine.ts`)**: Evaluates every proposed trade through **6 hard-coded safety gates** before order dispatch:
   * 🛡️ **Gate 1: Minimum Confidence Threshold** (≥ 70%)
   * 🛡️ **Gate 2: Max Single-Position Risk** (≤ 5% of Account Equity)
   * 🛡️ **Gate 3: Available Buying Power Check** (Ensures trade max loss ≤ free buying power)
   * 🛡️ **Gate 4: Max Open Positions Limit** (≤ 5 simultaneous open positions)
   * 🛡️ **Gate 5: Total Portfolio Exposure Limit** (≤ 30% total portfolio allocation)
   * 🛡️ **Gate 6: Daily Drawdown Circuit Breaker** (Halts trading if daily loss exceeds limit)
5. **Order Execution & Alpaca Dispatch (`executor.ts`)**: Constructs exact Alpaca order parameters (Single-leg or multi-leg `mleg` orders) and submits via `alpacaClient` or Model Context Protocol (`mcpWrapper`).
6. **Live Position Manager (`positionManager.ts`)**: Tracks live open positions, automatically issuing limit close orders when profit target (+30%) or stop-loss (-20%) thresholds are reached.
7. **Persistent Audit Trail & Memory Store (`memory.ts` + SQLite)**: Records all scans, LLM prompts, gatekeeper pass/fail logs, order status changes, and equity curves into a persistent database.

---

## 📂 Directory Structure

```
ALPACA/
├── server/                    # Node.js Express Backend & Agent Loop
│   ├── agent/                 # Agent Core Logic
│   │   ├── executor.ts        # Order Execution Manager
│   │   ├── loop.ts            # Autonomous Interval & Scan Loop
│   │   ├── memory.ts          # Decision History & Performance Analytics
│   │   ├── positionManager.ts # Open Position Monitoring & Adjustments
│   │   ├── riskEngine.ts      # Risk Gatekeeper & Sizing Controls
│   │   ├── scanner.ts         # Market Opportunity Scanner
│   │   └── strategyEngine.ts  # Options Strategy Evaluation & Prompting
│   ├── alpaca/                # Alpaca API & MCP Integration
│   │   ├── client.ts          # Official Alpaca SDK Wrapper
│   │   └── mcpWrapper.ts      # Model Context Protocol Bridge
│   ├── db/                    # Persistent SQLite Database & Schema
│   │   └── database.ts        # Audit Trail & Trade Journal Store
│   ├── config.ts              # System Configuration & Env Loader
│   └── index.ts               # Server Entrypoint & API Endpoints
├── src/                       # React Frontend Application
│   ├── components/            # UI Panels & Visualizations
│   │   ├── AgentBrain.tsx     # Real-time Reasoning & Audit Logs
│   │   ├── Header.tsx         # Connection Status & Control Bar
│   │   ├── LivePositions.tsx  # Open Options & Equity Positions
│   │   ├── OpportunityScanner.tsx # Real-time Market Opportunity Board
│   │   ├── PerformanceAnalytics.tsx # Equity Curve & Win-Rate Charts
│   │   ├── PortfolioSummary.tsx # Buying Power & P&L Cards
│   │   ├── RiskMonitor.tsx    # Risk Limits & Gatekeeper Metrics
│   │   └── TradeJournal.tsx   # History of Executed Options Trades
│   ├── hooks/                 # Custom React Hooks (useAgentState)
│   ├── types/                 # TypeScript Interfaces & Types
│   ├── App.tsx                # Dashboard Layout
│   └── main.tsx               # Client Entrypoint
├── Dockerfile                 # Container Deployment File
├── .env.example               # Template for Environment Variables
└── package.json               # Dependencies & Scripts
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the project root based on `.env.example`:

```env
# Alpaca Paper Trading Credentials
ALPACA_API_KEY=your_alpaca_paper_api_key
ALPACA_SECRET_KEY=your_alpaca_paper_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets
ALPACA_DATA_URL=https://data.alpaca.markets

# AI Model Configuration (Optional but recommended for LLM reasoning)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.5-flash

# Server Configuration
PORT=3001
AGENT_SCAN_INTERVAL_MINUTES=5
```

> ⚠️ **Security Note**: Never commit your `.env` file. It is excluded by default in `.gitignore`.

---

## 🚀 Quickstart Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Development Mode

Starts both the Express backend server and the Vite development server concurrently:

```bash
npm run dev
```

* **Frontend Dashboard**: `http://localhost:5173`
* **Backend API Server**: `http://localhost:3001`

### 3. Run Unit Tests

Execute the Vitest test suite covering order validation, risk gates, and strategy selection:

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

Build and run the agent inside a containerized environment:

```bash
# Build the Docker image
docker build -t alpaca-options-agent .

# Run the container with your environment file
docker run -d --name options-agent -p 3001:3001 --env-file .env alpaca-options-agent
```

Access the unified application dashboard at `http://localhost:3001`.

---

## 📜 Non-Negotiable Compliance Checklist

* [x] **Connected to Alpaca Paper Environment**: Uses live endpoints (`https://paper-api.alpaca.markets`).
* [x] **Zero Hardcoded Data**: All market quotes, option greeks, account equity, and positions come directly from real API responses.
* [x] **Strict Risk Gates**: Hard checks enforce maximum position sizes, stop-losses, and portfolio exposure limits prior to order placement.
* [x] **Transparent Audit Trail**: Every decision step (Scan → Thesis → Strategy → Sizing → Risk Check → Execution) is logged.

---

## 📄 License

MIT License. Built for the Alpaca AI Trading Agents Hackathon.
