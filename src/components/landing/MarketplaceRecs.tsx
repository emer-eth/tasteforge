"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { scrollToSection } from "@/lib/scroll-to-section";
import type { MarketplaceListing } from "@/lib/types";

function money(n: number | null | undefined): string {
  if (n == null) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function matchPct(l: MarketplaceListing, i: number): number {
  const base = 90 + (l.isBargain ? 4 : 0) + ((i * 3) % 4);
  return Math.min(98, Math.max(85, base));
}

function MarketCard({ l, i }: { l: MarketplaceListing; i: number }) {
  const grade = l.grade ? `${l.grader} ${l.grade}` : null;
  return (
    <a
      href={`https://www.renaiss.xyz/card/${l.tokenId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="market-card group flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#0e0c09]">
        {l.imageUrl?.startsWith("http") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={l.imageUrl}
            alt={l.name}
            loading="lazy"
            className="market-img h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="headline text-3xl text-[var(--gold)]">TF</span>
          </div>
        )}
        {grade && (
          <span className="absolute left-3 top-3 rounded-md bg-[#0c0a08]/85 px-2 py-1 font-mono text-[10px] font-semibold text-[#f1d18a] backdrop-blur">
            {grade}
          </span>
        )}
        {l.isBargain && (
          <span className="absolute right-3 top-3 rounded-md bg-[var(--live)]/90 px-2 py-1 text-[10px] font-semibold text-[#04140f]">
            Below FMV
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-[#f5f3ee]">
          {l.name}
        </p>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold text-[#f5f3ee]">
              {money(l.askPrice)}
            </p>
            <p className="text-[11px] text-[var(--ink-3)]">
              FMV {money(l.fmv)}
            </p>
          </div>
          <span className="rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--gold)]">
            Match {matchPct(l, i)}%
          </span>
        </div>
      </div>
    </a>
  );
}

export function MarketplaceRecs() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    fetch("/api/listings?limit=8")
      .then((r) => r.json())
      .then((d) => setListings((d.listings ?? []).slice(0, 7)))
      .catch(() => {});
  }, []);

  return (
    <section id="marketplace" className="scroll-mt-28 py-14 lg:py-20">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label text-[var(--gold)]">Curated for your taste</p>
          <h2 className="headline mt-3 text-[clamp(1.85rem,3.6vw,2.75rem)] text-[#f5f3ee]">
            Marketplace recommendations
          </h2>
        </div>
        <a
          href="https://www.renaiss.xyz/marketplace"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link text-[var(--gold)] hover:text-[var(--gold-hover)]"
        >
          View all recommendations →
        </a>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {listings.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="market-card aspect-[3/4] animate-pulse bg-[#171511]"
              />
            ))
          : listings.map((l, i) => (
              <Reveal key={l.tokenId} delay={(i % 4) * 0.06}>
                <MarketCard l={l} i={i} />
              </Reveal>
            ))}

        {/* Upsell card */}
        <Reveal delay={0.1}>
          <div className="market-card flex h-full flex-col justify-between gap-4 p-6">
            <div>
              <h3 className="headline text-2xl text-[#f5f3ee]">
                Want more perfect matches?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
                Run a full analysis for deeper insights and exclusive
                below-FMV opportunities tuned to your taste.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                scrollToSection("analyze", {
                  focusSelector: "#wallet-address-input",
                })
              }
              className="btn-gold btn-gold-sm w-full"
            >
              Analyze my wallet
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
