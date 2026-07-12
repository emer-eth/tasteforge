"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type {
  CardRecommendation,
  MarketplaceListing,
  TasteForgeResult,
} from "@/lib/types";

interface MarketItem {
  tokenId: string;
  name: string;
  imageUrl: string;
  askPrice: number;
  fmv: number | null;
  gradeLabel: string | null;
  isBargain: boolean;
  discountPct: number;
  matchPct?: number;
  vintage?: boolean;
}

const PAGE = 48;
const PREFETCH_PAGES = 4; // load ~192 up front for rich filtering
const REFRESH_MS = 60_000;

function fromListing(l: MarketplaceListing): MarketItem {
  return {
    tokenId: l.tokenId,
    name: l.name,
    imageUrl: l.imageUrl,
    askPrice: l.askPrice,
    fmv: l.fmv,
    gradeLabel: l.grade ? `${l.grader} ${l.grade}` : null,
    isBargain: l.isBargain,
    discountPct: Math.round(l.discountPct),
    vintage: l.year != null && l.year <= 2005,
  };
}

function fromRec(r: CardRecommendation): MarketItem {
  const price = r.card.askPrice ?? r.card.floorPrice ?? 0;
  const fmv = r.card.fmv ?? 0;
  const disc = fmv > 0 && price < fmv ? Math.round(((fmv - price) / fmv) * 100) : 0;
  return {
    tokenId: r.card.tokenId,
    name: r.card.title,
    imageUrl: r.card.imageUrl,
    askPrice: price,
    fmv,
    gradeLabel: r.card.rarity,
    isBargain: disc > 0,
    discountPct: disc,
    matchPct: Math.round(r.resonanceScore * 100),
    vintage: r.card.era === "vintage",
  };
}

const money = (n: number | null | undefined) =>
  n == null ? "—" : `$${Math.round(n).toLocaleString()}`;

function agoLabel(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

interface Mode {
  key: string;
  label: string;
  needsTaste?: boolean;
}
const MODES: Mode[] = [
  { key: "ai", label: "AI Picks", needsTaste: true },
  { key: "all", label: "All" },
  { key: "starter", label: "Starter picks" },
  { key: "belowFmv", label: "Below FMV" },
  { key: "gems", label: "Hidden Gems" },
  { key: "rare", label: "Rare Finds" },
  { key: "drops", label: "Biggest Discounts" },
];

function MarketCard({ item }: { item: MarketItem }) {
  return (
    <a
      href={`https://www.renaiss.xyz/card/${item.tokenId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="market-card group flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#0e0c09]">
        {item.imageUrl?.startsWith("http") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="market-img h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="headline text-3xl text-[var(--gold)]">TF</span>
          </div>
        )}
        {item.gradeLabel && (
          <span className="absolute left-3 top-3 rounded-md bg-[#0c0a08]/85 px-2 py-1 font-mono text-[10px] font-semibold capitalize text-[#f1d18a] backdrop-blur">
            {item.gradeLabel}
          </span>
        )}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {item.isBargain && item.discountPct > 0 && (
            <span className="rounded-md bg-[var(--live)]/90 px-2 py-1 text-[10px] font-semibold text-[#04140f]">
              {item.discountPct}% below FMV
            </span>
          )}
          {item.vintage && (
            <span className="rounded-md bg-[#0c0a08]/85 px-2 py-1 text-[10px] font-medium text-[var(--ink-2)] backdrop-blur">
              Vintage
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-[#f5f3ee]">
          {item.name}
        </p>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold text-[#f5f3ee]">
              {money(item.askPrice)}
            </p>
            <p className="text-[11px] text-[var(--ink-3)]">FMV {money(item.fmv)}</p>
          </div>
          {item.matchPct != null ? (
            <span className="rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--gold)]">
              Match {item.matchPct}%
            </span>
          ) : (
            <span className="text-[11px] text-[var(--ink-3)]">View ↗</span>
          )}
        </div>
      </div>
    </a>
  );
}

export function MarketplaceExplorer({ result }: { result?: TasteForgeResult | null }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [mode, setMode] = useState<string>(result ? "ai" : "belowFmv");
  const [visible, setVisible] = useState(PAGE);
  const seen = useRef<Set<string>>(new Set());
  const autoAi = useRef(Boolean(result));

  // When an analysis lands after mount, surface AI Picks once.
  useEffect(() => {
    if (result && !autoAi.current) {
      autoAi.current = true;
      setMode("ai");
      setVisible(PAGE);
    }
  }, [result]);

  const ingest = useCallback((cards: MarketplaceListing[]) => {
    setListings((prev) => {
      const next = [...prev];
      for (const c of cards) {
        if (!seen.current.has(c.tokenId)) {
          seen.current.add(c.tokenId);
          next.push(c);
        }
      }
      return next;
    });
  }, []);

  const fetchPage = useCallback(
    async (offset: number) => {
      const r = await fetch(`/api/listings?limit=${PAGE}&offset=${offset}`);
      const d = await r.json();
      ingest(d.listings ?? []);
      if (typeof d.total === "number") setTotal(d.total);
      setHasMore(Boolean(d.hasMore));
      setSyncedAt(Date.now());
      return d;
    },
    [ingest],
  );

  // initial prefetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      for (let i = 0; i < PREFETCH_PAGES; i++) {
        if (cancelled) break;
        const d = await fetchPage(i * PAGE).catch(() => null);
        if (!d || !d.hasMore) break;
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  // "synced N ago" ticking + periodic re-sync of the first page
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const resync = setInterval(() => {
      fetch(`/api/listings?limit=${PAGE}&offset=0`)
        .then((r) => r.json())
        .then((d) => {
          ingest(d.listings ?? []);
          if (typeof d.total === "number") setTotal(d.total);
          setSyncedAt(Date.now());
        })
        .catch(() => {});
    }, REFRESH_MS);
    return () => {
      clearInterval(tick);
      clearInterval(resync);
    };
  }, [ingest]);

  const items = useMemo<MarketItem[]>(() => {
    if (mode === "ai" && result) {
      const seenIds = new Set<string>();
      return [...result.bestOverall, ...result.bestValue]
        .filter((r) => (seenIds.has(r.card.id) ? false : seenIds.add(r.card.id)))
        .map(fromRec)
        .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0));
    }
    let arr = listings.map(fromListing);
    switch (mode) {
      case "belowFmv":
        arr = arr.filter((i) => i.isBargain).sort((a, b) => b.discountPct - a.discountPct);
        break;
      case "gems":
        arr = arr
          .filter((i) => i.isBargain && /10|9(\.5)?$/.test(i.gradeLabel ?? ""))
          .sort((a, b) => a.askPrice - b.askPrice);
        break;
      case "rare":
        arr = arr
          .filter((i) => i.vintage || /10/.test(i.gradeLabel ?? ""))
          .sort((a, b) => (b.fmv ?? 0) - (a.fmv ?? 0));
        break;
      case "drops":
        arr = arr.filter((i) => i.discountPct > 0).sort((a, b) => b.discountPct - a.discountPct);
        break;
      case "starter":
        // Affordable, beginner-friendly entry points — cheapest first.
        arr = arr
          .filter((i) => i.askPrice > 0 && i.askPrice <= 150)
          .sort((a, b) => a.askPrice - b.askPrice);
        break;
      default:
        break;
    }
    return arr;
  }, [mode, listings, result]);

  const shown = items.slice(0, visible);
  const ago = syncedAt != null && now != null ? agoLabel(now - syncedAt) : null;

  return (
    <section id="marketplace" className="scroll-mt-28 py-14 lg:py-20">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label text-[var(--gold)]">Live marketplace</p>
          <h2 className="headline mt-3 text-[clamp(1.85rem,3.6vw,2.75rem)] text-[#f5f3ee]">
            {result ? "Curated for your taste" : "Marketplace intelligence"}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--ink-2)]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {ago ? `Synced ${ago}` : "Syncing…"}
          </span>
          {total != null && (
            <>
              <span className="text-[var(--ink-3)]">·</span>
              <span className="font-mono text-[var(--gold)]">
                {total.toLocaleString()}
              </span>
              <span className="text-[var(--ink-3)]">active listings</span>
            </>
          )}
        </div>
      </Reveal>

      {/* discovery modes */}
      <div className="mt-6 flex flex-wrap gap-2">
        {MODES.filter((m) => !m.needsTaste || result).map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              setMode(m.key);
              setVisible(PAGE);
            }}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              mode === m.key
                ? "border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--gold-hover)]"
                : "border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--gold)]/30 hover:text-[#f5f3ee]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {shown.length === 0 && loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="market-card aspect-[3/4] animate-pulse bg-[#171511]" />
            ))
          : shown.map((item, i) => (
              <Reveal key={`${item.tokenId}-${i}`} delay={(i % 4) * 0.05}>
                <MarketCard item={item} />
              </Reveal>
            ))}
      </div>

      {shown.length === 0 && !loading && (
        <p className="mt-8 text-center text-sm text-[var(--ink-3)]">
          No listings match this view yet — try another mode.
        </p>
      )}

      {/* load more */}
      {visible < items.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setVisible((v) => v + PAGE);
              if (mode !== "ai" && hasMore && visible + PAGE > listings.length - PAGE) {
                void fetchPage(listings.length);
              }
            }}
            className="btn-glass"
          >
            Load more ({items.length - visible} more)
          </button>
        </div>
      )}
    </section>
  );
}
