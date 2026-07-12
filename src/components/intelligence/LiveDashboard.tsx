"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketplaceListing, TasteForgeResult } from "@/lib/types";
import {
  deriveAiInsight,
  deriveCollectorIdentity,
  deriveDailyBrief,
  derivePortfolioHealth,
  deriveTasteDna,
  deriveWishlist,
} from "@/lib/intelligence/derive";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";
import { pushIdentitySnapshot } from "@/lib/store/local-store";
import { CollectorIdentityCard } from "@/components/intelligence/CollectorIdentityCard";
import { TasteDnaRadar } from "@/components/intelligence/TasteDnaRadar";
import { DailyBrief } from "@/components/intelligence/DailyBrief";
import { PortfolioHealth } from "@/components/intelligence/PortfolioHealth";

function collectorName(result: TasteForgeResult): string {
  const dn = result.collectorData.profile.displayName?.trim();
  if (dn && !dn.startsWith("0x") && !/^0x/i.test(dn)) return dn.split(" ")[0];
  const h = result.collectorData.profile.handle?.replace(/^@/, "");
  if (h && !h.startsWith("0x")) return h;
  return "Collector";
}

function KpiTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="metric-card !min-h-[112px] !p-5">
      <p className="metric-num text-[2rem]" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-1.5 text-xs text-[var(--ink-2)]">{label}</p>
    </div>
  );
}

export function LiveDashboard({ result }: { result: TasteForgeResult }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [greeting, setGreeting] = useState("Welcome back");

  const identity = useMemo(() => deriveCollectorIdentity(result), [result]);
  const dna = useMemo(() => deriveTasteDna(result.tasteVector), [result]);
  const health = useMemo(
    () => derivePortfolioHealth(result.collectorData),
    [result],
  );
  const wishlist = useMemo(() => deriveWishlist(result), [result]);
  const brief = useMemo(
    () => deriveDailyBrief(result, listings),
    [result, listings],
  );
  const theme = getArchetypeTheme(identity.archetype);
  const name = collectorName(result);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    fetch("/api/listings?limit=48")
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    pushIdentitySnapshot(identity, result.analyzedAt);
  }, [identity, result.analyzedAt]);

  const insight = useMemo(() => deriveAiInsight(result, brief), [result, brief]);

  return (
    <section id="dashboard" className="scroll-mt-28 space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="headline text-[clamp(1.75rem,3.4vw,2.75rem)] text-[#f5f3ee]">
          {greeting}, <span style={{ color: theme.accent }}>{name}</span>.
        </h2>
        <span className="badge-live flex items-center gap-1.5 px-3 py-1 text-[11px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live intelligence
        </span>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiTile label="Taste Score" value={String(identity.tasteScore)} accent={theme.accent} />
        <KpiTile label="Perfect matches" value={String(brief.perfectMatches)} />
        <KpiTile label="Wishlist alerts" value={String(wishlist.length)} />
        <KpiTile label="Portfolio Score" value={String(health.score)} />
        <KpiTile label="Opportunities" value={String(brief.belowFmv)} />
        <KpiTile label="Sentiment" value={brief.sentiment} accent={theme.accent} />
      </div>

      {/* Identity + Taste DNA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <CollectorIdentityCard identity={identity} />
        <div className="glass-card flex flex-col rounded-[24px] p-6 sm:p-8">
          <p className="section-label text-[var(--gold)]">Taste DNA</p>
          <div className="flex flex-1 items-center justify-center py-2">
            <TasteDnaRadar
              axes={dna}
              accent={theme.accent}
              accentRgb={theme.accentRgb}
            />
          </div>
        </div>
      </div>

      {/* AI insight + Daily brief */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass-card rounded-[24px] p-6 sm:p-8">
          <p className="section-label text-[var(--gold)]">Latest AI insight</p>
          <p className="mt-4 text-[1.0625rem] leading-[1.7] text-[var(--ink-2)]">
            {insight}
          </p>
          <p className="mt-5 text-xs text-[var(--ink-3)]">
            Derived from {result.catalogSize} live Renaiss listings ·{" "}
            {result.processingMode === "llm" ? "LLM analysis" : "Deterministic analysis"}
          </p>
        </div>
        <DailyBrief brief={brief} />
      </div>

      {/* Portfolio health */}
      <PortfolioHealth health={health} />
    </section>
  );
}
