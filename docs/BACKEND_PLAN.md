# TasteForge — Backend Scoping Plan (the "always-on curator")

**Status:** proposal. Nothing here is built yet — it needs a provider choice + credentials.

## Why

Everything currently labeled **"Preview · live delivery ships with accounts"** — Watch My Market, real notifications, an identity that *evolves over time*, and Compare Collectors — is impossible without server state. Today the app is a stateless analyze pipeline + a 10-min in-memory cache, and the engagement UI persists only to the current browser's `localStorage`. This plan is what turns those previews into the real thing.

## Recommended stack

- **DB + Auth:** Supabase (Postgres + Auth + Row Level Security). One dependency covers persistence, auth, and realtime. Alternative: Neon + Auth.js.
- **Scheduled worker:** Vercel Cron (hits an internal route every N minutes) for MVP; graduate to a queue (Upstash QStash / Inngest) if volume grows.
- **Email:** Resend. **Push:** Web Push (VAPID). **Telegram:** bot token + chat id.
- All secrets via env vars; nothing client-side.

## Data model (first cut)

```
users            id, email, created_at                     (Supabase Auth)
wallets          id, user_id, address, label               -- watched wallets
profiles         id, wallet_id, archetype, taste_score,
                 rank, dimensions jsonb, summary, created_at -- one row per scan → history/timeline
prefs            user_id, match_threshold, max_price,
                 filters jsonb, channels jsonb
wishlist         id, user_id, token_id, card jsonb, created_at
listings_seen    token_id, first_seen_at, last_synced_at,
                 fmv, ask, discount_pct, meta jsonb          -- marketplace mirror
alerts           id, user_id, kind, token_id, payload jsonb,
                 created_at, read_at, delivered_channels[]
```

`profiles` as an append-only log is what powers the **Collector Timeline** and *evolving identity* (#17, #2) for free.

## Monitoring pipeline (#7, #8)

Cron route `POST /api/cron/sync` (secured by a shared secret), every ~2–5 min:

1. Paginate the Renaiss marketplace (the `/api/listings` offset/total plumbing already exists) → upsert into `listings_seen`; diff to find **new** token_ids.
2. For each watching user: score new listings against their stored `dimensions` (reuse `src/lib/taste-vector/*` server-side — the scoring already exists).
3. Where score ≥ `prefs.match_threshold` and price filters pass → insert `alerts`.
4. Deliver via enabled channels (Resend / Web Push / Telegram); stamp `delivered_channels`.

## API surface

`/api/auth/*` (Supabase) · `/api/wallets` CRUD · `/api/prefs` GET/PUT · `/api/wishlist` toggle · `/api/alerts` list + mark-read · `/api/cron/sync` (internal).

## Migration from the current preview

The v2 UI is already wired to a persistence shape — swap `src/lib/store/local-store.ts` for API calls with the **same function signatures** (`getPrefs`/`setPrefs`, `getSavedWishlist`/`toggleWishlistId`, `getReadNotifications`, identity history). `CollectorConsole`, `NotificationCenter`, and `AiWishlist` shouldn't need structural changes — only their data source. `deriveNotifications` becomes the server scoring step instead of a client derivation.

## Compare Collectors (#18)

Once `profiles` exists, compare two wallets' stored `dimensions` (cosine similarity) + shared tags → similarity score, overlaps, and "you have X, they have Y" trade ideas. Pure read over existing data.

## Phasing

1. **Auth + prefs/wishlist persistence** (replaces localStorage) — small, unblocks accounts.
2. **Listings mirror + cron sync + in-app alerts** — the core monitoring loop.
3. **Email delivery** (Resend) → then Web Push / Telegram.
4. **Timeline + Compare Collectors** (reads over `profiles`).

## What I need from you to start

- Provider confirmation (Supabase vs. alternative) and a project + keys.
- Sender domain for email (Resend) if we do email in phase 3.
- Confirmation this is a separate multi-session workstream (it is — phase 1 alone is a meaningful chunk).
