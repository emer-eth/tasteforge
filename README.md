# TasteForge

**Renaiss Hackathon MVP** — An AI agent that builds a collector's **Taste Vector** from behavioral signals and surfaces high-resonance card recommendations with curator-style explanations.

## Stack

- **Next.js 16** + TypeScript + Tailwind CSS v4
- **LangGraph** — 4-node agent pipeline
- **LangChain + OpenAI/Grok** — LLM-powered analysis (deterministic fallback for demos)
- Mock Renaiss catalog (Supabase-ready for persistence)

## Quick Start

```bash
cd tasteforge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the interactive demo.

**Demo flow:**
1. Pick a collector (Maya, Luca, or Jordan)
2. Click **Generate Taste Vector**
3. Watch the 4-step agent pipeline
4. Review taste archetype + recommendations

### Enable LLM mode

```bash
cp .env.example .env.local
# Add OPENAI_API_KEY or GROK_API_KEY / XAI_API_KEY
```

Without an API key, the agent runs in **deterministic mode** — fully functional for hackathon demos.

## Agent Pipeline (LangGraph)

```
START → analyzeSignals → generateTasteVector → scoreCatalog → explainRecommendations → END
```

| Node | Purpose |
|------|---------|
| `analyzeSignals` | LLM interprets collection + interaction patterns |
| `generateTasteVector` | Produces 10-axis taste fingerprint |
| `scoreCatalog` | Cosine similarity + tag/subject scoring |
| `explainRecommendations` | Personal curator explanations per card |

## API Routes

```bash
# Taste vector only
GET /api/taste-vector?collectorId=collector-demo-01

# Full recommendations
GET /api/recommendations?collectorId=collector-demo-01
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Demo homepage
│   └── api/
│       ├── taste-vector/route.ts
│       └── recommendations/route.ts
├── components/                     # UI components
├── lib/
│   ├── agents/
│   │   ├── graph.ts                # LangGraph workflow
│   │   ├── state.ts                # Agent state schema
│   │   └── taste-forge-agent.ts    # Public agent entrypoint
│   ├── data/mock-renaiss.ts        # Mock catalog + collector
│   ├── llm/client.ts               # OpenAI / Grok client
│   ├── taste-vector/
│   │   ├── generator.ts            # Deterministic + LLM parser
│   │   ├── scorer.ts               # Resonance scoring
│   │   └── prompts.ts              # Agent prompts
│   └── types/index.ts
```

## Taste Vector Dimensions

Each axis is scored 0.0–1.0:

- `vintage_modern` · `minimalist_ornate` · `bold_subtle` · `warm_cool`
- `rarity_appreciation` · `narrative_depth` · `artistic_craft`
- `nostalgia` · `community_social` · `investment_mindset`

## Demo Collectors

| Collector | Handle | Taste Profile |
|-----------|--------|---------------|
| Maya Chen | `quiet_horizons` | Cool minimalism, landscapes |
| Luca Fontaine | `gilded_archive` | Baroque grail hunter |
| Jordan Reyes | `pixel_pilgrim` | Street culture + 90s nostalgia |

## Deploy to Vercel

**Repo:** https://github.com/emer-eth/tasteforge

### Option A — Vercel Dashboard (fastest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `emer-eth/tasteforge`
3. Click **Deploy** (no env vars required for demo mode)
4. Optional: add `OPENAI_API_KEY` or `GROK_API_KEY` in Project Settings → Environment Variables for LLM mode

### Option B — Vercel CLI

```bash
vercel login
cd tasteforge
vercel deploy --prod
```

## Next Steps

- [ ] Supabase persistence for collectors + taste vectors
- [ ] Vision layer (GPT-4o / CLIP) for card image analysis
- [ ] Real Renaiss API integration