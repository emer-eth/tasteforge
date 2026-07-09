# TasteForge

**Renaiss Hackathon MVP** — AI agent + web app that helps collectors find the best cards for their personal taste and money value.

**Deadline:** July 11, 2026

## What it does

1. Paste a **BNB wallet** (required) + optional **X handle** and **social taste text**
2. Scan **live Renaiss marketplace** holdings and ~150 listings
3. Build a **taste vector** + archetype (Blink LLM or deterministic fallback)
4. Recommend **Best Overall** and **Best Value** with explanations
5. Surface **consecutive serial pairs** matched to taste
6. **Ask AI** guide with session context (top picks, share link)
7. **Share URL** — `?wallet=0x…&social=…&analyze=1` for judge demos

## Quick Start

```bash
cd tasteforge
npm install
cp .env.example .env.local   # add BLINK_API_KEY for LLM mode
npm run dev
```

Open **http://localhost:3000**

### LLM (Blink AI Gateway — recommended)

```bash
# .env.local
BLINK_API_KEY=blnk_ak_...
BLINK_MODEL=xai/grok-4.1-fast-non-reasoning
RENAISS_USE_LIVE=true
```

Uses `https://core.blink.new/api/v1/ai` (OpenAI-compatible). Also powers **Fetch bio via Blink** for X handles.

Alternative: `OPENAI_API_KEY` or `GROK_API_KEY` / `XAI_API_KEY` (see `.env.example`).

### Demo wallets (verified on-chain)

| Label | Wallet |
|-------|--------|
| Big holder (62) | `0x378ffaaf220ac102ea5c29bddcff1a16a2cab731` |
| Big holder (54) | `0xc0fe1b4bb133011fb7a5e8617fcb80e7b4edec6e` |
| Medium (7) | `0x56efe774d232cdf76b44f2b1fcec49ab0a0b77f5` |
| Small (1) | `0x269852797b01b5739c34bb478609312928c9ab89` |
| Non-holder test | `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` + social text |

Use **Quick demo wallets** chips in the UI.

### Share link example

```
http://localhost:3000/?wallet=0x378ffaaf220ac102ea5c29bddcff1a16a2cab731&analyze=1
```

## Deploy (Vercel)

```bash
npm run build
npx vercel --prod
```

Set env vars in Vercel dashboard: `BLINK_API_KEY`, `RENAISS_USE_LIVE=true`.

## Renaiss integrations

| Source | URL | Role |
|--------|-----|------|
| Marketplace API | [renaiss.xyz tRPC](https://www.renaiss.xyz/api/trpc/collectible.list) | Live FMV, prices, owner scan |
| renaiss-scanner | [GitHub](https://github.com/blueskylh/renaiss-scanner) | Reference + pairs tool |
| Scanner tool | [renaiss-tool](https://renaiss-tool-689931.napa.de5.net/) | Consecutive pairs |

No Renaiss API key required.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind v4 |
| Agent | LangGraph 4-node pipeline + real progress streaming |
| Chain | viem — read-only BNB |
| LLM | Blink Gateway / OpenAI / Grok |
| Data | Live Renaiss only |

## Features

- One-click demo wallets + sample social text
- Real agent progress (holdings → catalog → signals → vector → score → explain → pairs)
- 10-minute analysis cache per wallet+social
- Post-analysis refine filters (max price, vintage, PSA 10, below FMV)
- Presentation summary card + copy share link
- Ask AI with live session context (top pick explanations)
- Optional Blink X bio fetch

## Project Structure

```
src/
├── app/api/          analyze (NDJSON stream), chat, wallet, social/fetch-x
├── components/       TasteForgeDemo, PresentationSummary, TasteAssistant, …
├── lib/agents/       LangGraph taste pipeline
├── lib/analysis/     cache + refine filters
├── lib/renaiss/      marketplace, pairs, catalog
└── lib/llm/          Blink / OpenAI / Grok client
```

## License

Hackathon project — Renaiss ecosystem.