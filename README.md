# TasteForge

**Renaissance Taste Intelligence** — an AI agent + web app that reads a collector's
on-chain holdings and taste signals to reveal their **collector identity**, then
surfaces the best Renaiss cards for their taste, value, and budget.

🔗 **Live:** https://tasteforge.vercel.app · Built for the Renaiss ecosystem.

## What it does

1. **Discover your collector identity** — archetype, Taste Score, confidence, and rank.
2. **Live dashboard** — 10-D **Taste DNA** radar, **portfolio health**, and a daily collector brief.
3. **AI explainability** — every recommendation shows *why* it was picked, with an AI-confidence score.
4. **Marketplace intelligence** — full paginated sync of live Renaiss listings with AI discovery modes (AI Picks · Below FMV · Hidden Gems · Rare Finds · Biggest Discounts · **Starter picks**), live sync status, and enhanced cards.
5. **Collector Team** (`/team`) — drop in multiple wallets to see a community's archetype mix, a blended team taste signature, a leaderboard, and collective gaps.
6. **Engagement shell** — notification center, alert preferences, AI wishlist, and Watch My Market (client-side preview; real delivery is a backend phase — see `docs/BACKEND_PLAN.md`).
7. **Ask AI** — chat grounded in your live scan/taste results with result-aware suggested questions.
8. **Shareable Collector DNA** — a share link with a dynamic, per-archetype Open Graph card (`/api/og`).

## Entry paths — no wallet required

- **Wallet** — paste a BNB address (read-only; no keys, no transactions).
- **Visual taste quiz** — tap the Renaiss cards you're drawn to → full identity, zero wallet.
- **See a live example** — one-click demo run, no input.
- **Social / X** — paste a bio/tweets, or fetch a bio via Blink.

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
# NEXT_PUBLIC_SITE_URL is optional — defaults to https://tasteforge.vercel.app
# (used for absolute Open Graph image URLs on shared links)
```

Uses `https://core.blink.new/api/v1/ai` (OpenAI-compatible). Also powers **Fetch bio via Blink**.
Alternatives: `OPENAI_API_KEY` or `GROK_API_KEY` / `XAI_API_KEY` (see `.env.example`).
Without a key, the agent falls back to a deterministic taste engine.

### Demo wallets (verified on-chain)

| Label | Wallet |
|-------|--------|
| Big holder (62) | `0x378ffaaf220ac102ea5c29bddcff1a16a2cab731` |
| Big holder (54) | `0xc0fe1b4bb133011fb7a5e8617fcb80e7b4edec6e` |
| Medium (7) | `0x56efe774d232cdf76b44f2b1fcec49ab0a0b77f5` |
| Small (1) | `0x269852797b01b5739c34bb478609312928c9ab89` |
| Non-holder test | `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` + social text |

Use the **Quick demo wallets** chips, the **See a live example** button, or **Load demo team** on `/team`.

### Share link example

```
https://tasteforge.vercel.app/?wallet=0x378ffaaf220ac102ea5c29bddcff1a16a2cab731&analyze=1
```

Shared "Collector DNA" links also carry `&arch=…&ts=…&rank=…&dims=…` so social crawlers render a personalized card via `/api/og`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing → analysis → live dashboard → marketplace |
| `/team` | Collector Team aggregate (multi-wallet) |
| `/api/og` | Dynamic Collector-DNA Open Graph image |
| `/api/analyze`, `/api/chat`, `/api/listings`, `/api/wallet`, … | Agent + data endpoints |

## Deploy (Vercel)

```bash
vercel            # preview
vercel --prod     # production → tasteforge.vercel.app
```

Set env vars in the Vercel dashboard: `BLINK_API_KEY`, `RENAISS_USE_LIVE=true`
(for **all** environments if you want previews at full fidelity).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind v4, Framer Motion |
| Type | Geist (UI) · Cormorant Garamond (display) · IBM Plex Mono (data) |
| Agent | LangGraph pipeline + real progress streaming |
| Chain | viem — read-only BNB |
| LLM | Blink Gateway / OpenAI / Grok (deterministic fallback) |
| Data | Live Renaiss marketplace |

## Project Structure

```
src/
├── app/
│   ├── page.tsx            landing + generateMetadata (shareable OG)
│   ├── team/               Collector Team page
│   └── api/                analyze (NDJSON), chat, listings, wallet, og, …
├── components/
│   ├── landing/            hero (coverflow), how-it-works, footer, …
│   ├── intelligence/       dashboard, identity, Taste DNA, portfolio, marketplace, curator, visual quiz
│   ├── team/               team experience + dashboard
│   └── motion/             Reveal, CountUp, in-view hook
├── lib/
│   ├── agents/             LangGraph taste pipeline
│   ├── intelligence/       derivations (identity, portfolio, team, notifications, visual picks)
│   ├── store/              client-side prefs/wishlist persistence
│   ├── renaiss/            marketplace, pairs, catalog
│   └── taste-vector/       dimensions, archetypes, scoring
docs/BACKEND_PLAN.md        scoping for the always-on curator (DB + auth + worker)
```

## License

Renaiss ecosystem project.
