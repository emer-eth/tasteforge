# TasteForge — Agent Instructions

> **Open this project in Cursor** for the best experience. Rules live in `.cursor/rules/tasteforge.mdc`.

## Renaiss Hackathon MVP (deadline July 11, 2026)

TasteForge is an AI agent + Next.js app that helps Renaiss collectors find cards matching **personal taste** and **money value**.

## External resources

- **Renaiss Marketplace API**: `https://www.renaiss.xyz/api/trpc/collectible.list`
- **renaiss-scanner** (reference): https://github.com/blueskylh/renaiss-scanner
- **Scanner web tool**: https://renaiss-tool-689931.napa.de5.net/

## Stack

- Next.js App Router + TypeScript + Tailwind (dark theme)
- LangGraph agent (`src/lib/agents/graph.ts`)
- viem — read-only BNB Chain
- OpenAI / Grok for LLM (deterministic fallback)

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Demo flow

1. Paste demo wallet `0x0000000000000000000000000000000000000001`
2. Fetch Holdings → Analyze Taste
3. Review Taste Vector, Best Overall, Best Value

## Scoring

- **Resonance** — taste dimensions, tags, emotions
- **Value** — resonance + FMV efficiency + liquidity
- **Best Overall** — blended rank
- **Best Value** — value-optimized picks

## Safety

- Wallet input is **read-only** — never store or request private keys
- Use mock fallback when live APIs unavailable

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->