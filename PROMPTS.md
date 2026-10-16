# SingaFX Development & Prompt Log

This document records the user prompts, technical architecture, and implementation history for the **SingaFX** Singapore Dollar (SGD) Exchange Rate and Serverless Currency Conversion Tool.

---

## Prompt 1: Initial App Creation & Frontend UI

### User Prompt
```text
1. build a singapore-based exchange rate tool that provides real-time currency conversion for the SGD against global currencies.

2. build just the front end for now. i will add the backend integration using MAS API keys later. Please include a dark mode toggle and a clean, minimalist calculator interface.
```

### Delivered Solution & Technical Architecture
1. **Minimalist Calculator Interface (`src/components/Calculator.tsx`)**:
   - Two-way real-time currency conversion with SGD as the anchor.
   - Built-in tactile on-screen keypad and mathematical expression evaluator (supporting arithmetic operations such as Singapore GST multipliers, additions, etc.).
   - Preset quick buttons for SGD denominations (S$50, S$100, S$500, S$1,000, S$5,000, S$10,000).
   - Inverse rate calculation and official Monetary Authority of Singapore (MAS) quotation standards (units vs 100 units for MYR, JPY, THB, IDR, KRW, TWD, VND, PHP).
2. **Exchange Rate Watchlist Matrix (`src/components/RateWatchlist.tsx`)**:
   - Dynamic comparison table converting the user's input amount across 20+ currencies simultaneously.
   - 24h percentage changes, regional filtering (ASEAN, Asia-Pacific, Americas, Europe, Middle East), and customizable star/pin favorites.
3. **Historical Performance Analytics (`src/components/HistoricalTrend.tsx`)**:
   - Interactive SVG trend line chart with hover tooltips across 1D, 1W, 1M, 3M, and 1Y timeframes.
   - Statistics strip tracking period highs, lows, moving averages, and MAS reference figures.
4. **Singapore Exchange Channel & Fee Analysis (`src/components/FeeComparison.tsx`)**:
   - Comparative fee breakdown across MAS Benchmark (0%), Multi-Currency Digital Cards (Wise / YouTrip / Revolut @ 0.45%), Physical Money Changers (The Arcade Raffles Place / People's Park Chinatown @ 0.85%), and Retail Bank Credit Cards / Wire (DBS / OCBC / UOB @ 2.95%).
5. **Dark Mode Toggle (`src/hooks/useDarkMode.ts`)**:
   - Smooth theme switching with system color-scheme detection and `localStorage` persistence.
6. **MAS API Integration Modal (`src/components/MasApiModal.tsx`)**:
   - Interface to configure local API keys, test latency, preview JSON schemas, and inspect backend integration code.

---

## Prompt 2: GitHub Repository Setup & Push

### User Prompt
```text
git push https://<TOKEN>@https://github.com/dylanficklestone/vibe-sgd
```

### Delivered Actions
1. Initialized local git repository on branch `main`.
2. Configured committer credentials:
   - Name: `dylanficklestone`
   - Email: `doggy82002@gmail.com`
3. Staged project files and created initial commit:
   - Commit hash: `166c5ef`
   - Message: `"Initial commit: SingaFX exchange rate tool and calculator"`
4. Pushed branch to remote repository:
   - Target: `https://github.com/dylanficklestone/vibe-sgd`
5. Sanitized personal access token from persistent `.git/config` remotes to uphold credential security.

---

## Prompt 3: Serverless MAS API Connection

### User Prompt
```text
1. add a serverless API connection that pulls live data 

GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily?end_of_day=2026-10-14

2. store this in /api folder at the project rootlevel not the src folder
3. include a /health.ts and /exchangerates.ts within the same subflder
4. do not hardcode any API key, I will manually include them.
```

### Delivered Solution & Technical Architecture
1. **Serverless Files Created in `/api` (Root Level)**:
   - **`/api/health.ts`**:
     - Endpoint: `GET /api/health`
     - Returns service health status, server uptime, and whether `MAS_API_KEY` is present in the environment without exposing key secrets.
   - **`/api/exchangerates.ts`**:
     - Endpoint: `GET /api/exchangerates?end_of_day=YYYY-MM-DD`
     - Upstream Target:
       `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily`
     - Reads `process.env.MAS_API_KEY` or incoming client headers (`x-mas-api-key` / `Authorization`).
     - **No hardcoded keys**: Fully prepared for manual key injection.
     - Handles timeouts, errors (e.g. 401/403 authentication rejections), and forwards CORS headers.
2. **Full-Stack Server & Dev Runner (`server.ts`)**:
   - Built Express server mounting both `/api/health` and `/api/exchangerates` serverless handlers.
   - Integrates Vite development middleware on port `3000` for seamless local testing.
   - Updated `package.json` scripts:
     - `"dev": "tsx server.ts"`
     - `"start": "tsx server.ts"`
3. **Environment Documentation (`.env.example`)**:
   - Added placeholder for `MAS_API_KEY=""`.
4. **Git Sync**:
   - Committed changes: `e5c94a9` (*"Add serverless API endpoints /api/health and /api/exchangerates querying MAS gateway"*).
   - Pushed cleanly to GitHub `main` branch.

---

## Prompt 4: Chat Export

### User Prompt
```text
export this chat as a .md file as PROMPTS.md
```

### Action
- Generated and saved `PROMPTS.md` containing the complete prompt and solution log.
