"use client";

import { useEffect, useState } from "react";
import type { MarketplaceListing } from "@/lib/types";

const MIN_PICKS = 3;
const POOL = 12;

export function VisualTasteQuiz({
  onReveal,
  isRunning,
}: {
  onReveal: (cards: MarketplaceListing[]) => void;
  isRunning?: boolean;
}) {
  const [pool, setPool] = useState<MarketplaceListing[]>([]);
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState<Record<string, MarketplaceListing>>({});
  const [loading, setLoading] = useState(true);

  const load = (off: number) => {
    setLoading(true);
    fetch(`/api/listings?limit=${POOL}&offset=${off}`)
      .then((r) => r.json())
      .then((d) => {
        const cards = (d.listings ?? []).filter((c: MarketplaceListing) =>
          c.imageUrl?.startsWith("http"),
        );
        setPool(cards.slice(0, POOL));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(0);
  }, []);

  const toggle = (card: MarketplaceListing) => {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[card.tokenId]) delete next[card.tokenId];
      else next[card.tokenId] = card;
      return next;
    });
  };

  const shuffle = () => {
    const next = offset + POOL;
    setOffset(next);
    load(next);
  };

  const pickedList = Object.values(picked);
  const canReveal = pickedList.length >= MIN_PICKS && !isRunning;

  return (
    <section id="discover" className="glass-card scroll-mt-28 rounded-[28px] p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label text-[var(--gold)]">No wallet needed</p>
          <h2 className="headline mt-2 text-[clamp(1.6rem,3vw,2.5rem)] text-[#f5f3ee]">
            Which of these speak to you?
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            Tap a few cards you&apos;re drawn to — we&apos;ll reveal your
            collector identity from your taste alone.
          </p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          disabled={loading || isRunning}
          className="btn-glass btn-gold-sm !h-auto !py-2 disabled:opacity-40"
        >
          Shuffle ↻
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {loading && pool.length === 0
          ? Array.from({ length: POOL }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-[#171511]" />
            ))
          : pool.map((card) => {
              const isPicked = Boolean(picked[card.tokenId]);
              return (
                <button
                  key={card.tokenId}
                  type="button"
                  onClick={() => toggle(card)}
                  aria-pressed={isPicked}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl border transition-all"
                  style={{
                    borderColor: isPicked
                      ? "var(--gold)"
                      : "var(--border)",
                    boxShadow: isPicked
                      ? "0 0 0 2px var(--gold), 0 10px 30px rgba(216,181,107,0.25)"
                      : "none",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span
                    className={`absolute inset-0 transition-opacity ${
                      isPicked ? "bg-[var(--gold)]/10" : "bg-black/0 group-hover:bg-black/20"
                    }`}
                  />
                  {isPicked && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-bold text-[#0c0a08]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-3)]">
          {pickedList.length < MIN_PICKS
            ? `Pick at least ${MIN_PICKS} (${pickedList.length}/${MIN_PICKS})`
            : `${pickedList.length} selected`}
        </p>
        <button
          type="button"
          onClick={() => onReveal(pickedList)}
          disabled={!canReveal}
          className="btn-gold disabled:opacity-40"
        >
          {isRunning ? "Reading your taste…" : "Reveal my Collector DNA →"}
        </button>
      </div>
    </section>
  );
}
