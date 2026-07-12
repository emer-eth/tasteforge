/**
 * Client-side "collector intelligence" derivations.
 *
 * Everything here is computed deterministically from a real TasteForgeResult
 * (and live listings) — no fabricated numbers. These power the Live Dashboard,
 * Collector Identity, Taste DNA, Portfolio Health, Wishlist, and Daily Brief.
 */

import type {
  CardRecommendation,
  CollectorData,
  MarketplaceListing,
  RenaissCard,
  TasteForgeResult,
  TasteVector,
} from "@/lib/types";
import {
  DIMENSION_LABELS,
  DIMENSION_SHORT_LABELS,
} from "@/lib/taste-vector/dimensions";
import type { TasteDimensions } from "@/lib/types";

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const pct = (n: number) => clamp(Math.round(n * 100));

/** Mean distance of dimensions from neutral (0.5) → how strong the signal is. */
function conviction(dims: TasteDimensions): number {
  const vals = Object.values(dims);
  const avg = vals.reduce((s, v) => s + Math.abs(v - 0.5), 0) / vals.length;
  return Math.min(1, avg * 2); // 0..1
}

function avgResonance(recs: CardRecommendation[]): number {
  const top = recs.slice(0, 5);
  if (!top.length) return 0;
  return top.reduce((s, r) => s + r.resonanceScore, 0) / top.length;
}

// ---------------------------------------------------------------------------
// Collector Identity
// ---------------------------------------------------------------------------

export interface CollectorIdentity {
  archetype: string;
  /** 0..100 */
  confidence: number;
  /** 0..100 blended taste conviction */
  tasteScore: number;
  /** e.g. "Top 5%" */
  rank: string;
  primaryInterests: string[];
  investmentStyle: string;
  diversity: string;
  holdingsCount: number;
  savedAt?: string;
}

function rankLabel(score: number): string {
  if (score >= 95) return "Top 1%";
  if (score >= 90) return "Top 5%";
  if (score >= 82) return "Top 10%";
  if (score >= 70) return "Top 25%";
  return "Top 50%";
}

function investmentStyle(dims: TasteDimensions): string {
  const inv = dims.investment_mindset;
  if (inv >= 0.62) return "Long-Term Investor";
  if (inv <= 0.4) return "Passion-Led Collector";
  return "Balanced";
}

function diversityLabel(collection: RenaissCard[]): string {
  if (collection.length === 0) return "Emerging";
  const series = new Set(collection.map((c) => c.series)).size;
  const eras = new Set(collection.map((c) => c.era)).size;
  const rarities = new Set(collection.map((c) => c.rarity)).size;
  const spread = series + eras + rarities;
  if (collection.length < 3) return "Focused";
  if (spread >= 9) return "Excellent";
  if (spread >= 6) return "Strong";
  if (spread >= 4) return "Moderate";
  return "Focused";
}

export function primaryInterests(tv: TasteVector): string[] {
  const fromTags = (tv.aestheticTags ?? []).slice(0, 3);
  if (fromTags.length >= 3) return fromTags;

  // fall back to strongest dimension poles
  const poles = (
    Object.entries(tv.dimensions) as [keyof TasteDimensions, number][]
  )
    .map(([k, v]) => ({ k, v, lean: Math.abs(v - 0.5) }))
    .sort((a, b) => b.lean - a.lean)
    .slice(0, 3)
    .map(({ k, v }) => (v >= 0.5 ? DIMENSION_LABELS[k][1] : DIMENSION_LABELS[k][0]));

  return [...new Set([...fromTags, ...poles])].slice(0, 3);
}

export function deriveCollectorIdentity(
  result: TasteForgeResult,
): CollectorIdentity {
  const tv = result.tasteVector;
  const conv = conviction(tv.dimensions);
  const res = avgResonance(result.bestOverall);
  const tasteScore = clamp(
    Math.round((tv.confidence * 0.4 + res * 0.4 + conv * 0.2) * 100),
  );
  const holdingsCount = result.collectorData.collection.length;

  return {
    archetype: tv.tasteArchetype || "Balanced Collector",
    confidence: pct(tv.confidence),
    tasteScore,
    rank: rankLabel(tasteScore),
    primaryInterests: primaryInterests(tv),
    investmentStyle: investmentStyle(tv.dimensions),
    diversity: diversityLabel(result.collectorData.collection),
    holdingsCount,
  };
}

// ---------------------------------------------------------------------------
// Taste DNA — radar-ready axes
// ---------------------------------------------------------------------------

export interface TasteDnaAxis {
  key: keyof TasteDimensions;
  label: string;
  /** 0..1 raw dimension value */
  value: number;
  /** high or low pole label depending on lean */
  poleLabel: string;
}

export function deriveTasteDna(tv: TasteVector): TasteDnaAxis[] {
  return (Object.entries(tv.dimensions) as [keyof TasteDimensions, number][]).map(
    ([key, value]) => ({
      key,
      label: DIMENSION_SHORT_LABELS[key],
      value,
      poleLabel: value >= 0.5 ? DIMENSION_LABELS[key][1] : DIMENSION_LABELS[key][0],
    }),
  );
}

// ---------------------------------------------------------------------------
// Portfolio Health
// ---------------------------------------------------------------------------

export interface PortfolioAllocation {
  label: string;
  count: number;
  pct: number;
}

export interface PortfolioHealth {
  holdingsCount: number;
  portfolioValue: number;
  /** 0..100 */
  score: number;
  diversification: number;
  liquidity: number;
  longTermPotential: number;
  risk: "Low" | "Moderate" | "Elevated";
  allocation: PortfolioAllocation[];
  recentAdds: number;
}

function allocate(
  collection: RenaissCard[],
  pick: (c: RenaissCard) => string,
): PortfolioAllocation[] {
  const counts = new Map<string, number>();
  for (const c of collection) {
    const key = pick(c) || "Other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = collection.length || 1;
  return [...counts.entries()]
    .map(([label, count]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function derivePortfolioHealth(data: CollectorData): PortfolioHealth {
  const collection = data.collection;
  const n = collection.length;
  const portfolioValue = collection.reduce(
    (s, c) => s + (c.fmv || c.floorPrice || 0),
    0,
  );

  const avgLiquidity =
    n > 0 ? collection.reduce((s, c) => s + (c.liquidity ?? 0), 0) / n : 0;

  const seriesSpread = new Set(collection.map((c) => c.series)).size;
  const eraSpread = new Set(collection.map((c) => c.era)).size;
  const diversification = n === 0 ? 0 : clamp((seriesSpread * 14 + eraSpread * 18));

  const raritySize = collection.filter(
    (c) => c.rarity === "rare" || c.rarity === "legendary",
  ).length;
  const vintageShare =
    n > 0 ? collection.filter((c) => c.era === "vintage").length / n : 0;
  const longTermPotential = clamp(
    Math.round((raritySize / Math.max(1, n)) * 60 + vintageShare * 40),
  );

  const liquidity = pct(avgLiquidity);
  const risk: PortfolioHealth["risk"] =
    liquidity >= 60 && diversification >= 55
      ? "Low"
      : liquidity >= 40
        ? "Moderate"
        : "Elevated";

  const score = clamp(
    Math.round(diversification * 0.35 + liquidity * 0.3 + longTermPotential * 0.35),
  );

  const recentAdds = (data.activityHistory ?? []).filter(
    (e) => e.type === "acquired" || e.type === "transferred_in",
  ).length;

  return {
    holdingsCount: n,
    portfolioValue,
    score,
    diversification,
    liquidity,
    longTermPotential,
    risk,
    allocation: allocate(collection, (c) => c.era),
    recentAdds,
  };
}

// ---------------------------------------------------------------------------
// Explainability — "Why this card?"
// ---------------------------------------------------------------------------

export interface WhyReason {
  text: string;
}

export function deriveWhyReasons(rec: CardRecommendation): {
  reasons: WhyReason[];
  confidence: number;
} {
  const reasons: WhyReason[] = [];
  const c = rec.card;

  if (rec.matchingTags?.length) {
    reasons.push({
      text: `Matches your taste for ${rec.matchingTags.slice(0, 2).join(" & ")}`,
    });
  }

  const topDim = (
    Object.entries(rec.dimensionAlignment ?? {}) as [
      keyof TasteDimensions,
      number,
    ][]
  ).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
  if (topDim && topDim[1] != null) {
    reasons.push({ text: `Fits your ${DIMENSION_SHORT_LABELS[topDim[0]]} signature` });
  }

  const fmv = c.fmv || 0;
  const price = c.askPrice ?? c.floorPrice ?? 0;
  if (fmv > 0 && price > 0 && price < fmv) {
    const disc = Math.round(((fmv - price) / fmv) * 100);
    if (disc >= 3) reasons.push({ text: `${disc}% below fair market value` });
  }

  if (c.rarity === "legendary" || c.rarity === "rare") {
    reasons.push({ text: `High rarity (${c.rarity})` });
  }

  if (rec.whyNow) reasons.push({ text: rec.whyNow });

  const confidence = pct(rec.resonanceScore);
  return { reasons: reasons.slice(0, 5), confidence };
}

// ---------------------------------------------------------------------------
// Wishlist — recommended next purchases
// ---------------------------------------------------------------------------

export interface WishlistItem {
  id: string;
  title: string;
  imageUrl: string;
  reason: string;
  matchPct: number;
  price: number;
  fmv: number;
  tokenId: string;
}

export function deriveWishlist(result: TasteForgeResult): WishlistItem[] {
  const pool = [...result.bestOverall, ...result.bestValue];
  const seen = new Set<string>();
  const items: WishlistItem[] = [];
  for (const rec of pool) {
    if (seen.has(rec.card.id)) continue;
    seen.add(rec.card.id);
    items.push({
      id: rec.card.id,
      title: rec.card.title,
      imageUrl: rec.card.imageUrl,
      reason: rec.whyNow || rec.explanation || rec.valueInsight,
      matchPct: pct(rec.resonanceScore),
      price: rec.card.askPrice ?? rec.card.floorPrice ?? 0,
      fmv: rec.card.fmv ?? 0,
      tokenId: rec.card.tokenId,
    });
    if (items.length >= 5) break;
  }
  return items.sort((a, b) => b.matchPct - a.matchPct);
}

// ---------------------------------------------------------------------------
// Daily Brief
// ---------------------------------------------------------------------------

export interface DailyBrief {
  newListings: number;
  perfectMatches: number;
  belowFmv: number;
  wishlistAvailable: number;
  portfolioValue: number;
  sentiment: "Bullish" | "Neutral" | "Cautious";
}

export function deriveDailyBrief(
  result: TasteForgeResult,
  listings: MarketplaceListing[],
): DailyBrief {
  const belowFmv = listings.filter((l) => l.isBargain).length;
  const perfectMatches = [...result.bestOverall, ...result.bestValue].filter(
    (r) => r.resonanceScore >= 0.6,
  ).length;
  const portfolioValue = result.collectorData.collection.reduce(
    (s, c) => s + (c.fmv || c.floorPrice || 0),
    0,
  );
  const bargainRatio = listings.length ? belowFmv / listings.length : 0;
  const sentiment: DailyBrief["sentiment"] =
    bargainRatio >= 0.3 ? "Bullish" : bargainRatio >= 0.12 ? "Neutral" : "Cautious";

  return {
    newListings: listings.length,
    perfectMatches,
    belowFmv,
    wishlistAvailable: deriveWishlist(result).length,
    portfolioValue,
    sentiment,
  };
}

// ---------------------------------------------------------------------------
// Notifications (client-side preview — real delivery/monitoring is a later phase)
// ---------------------------------------------------------------------------

export type NotificationKind = "match" | "belowFmv" | "wishlist" | "milestone";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  meta?: string;
  tokenId?: string;
  group: "Today" | "This week";
}

interface NotifPrefsLike {
  matchThreshold: number;
  maxPrice: number | null;
  belowFmvOnly: boolean;
  gradedOnly: boolean;
  wishlistOnly: boolean;
}

export function deriveNotifications(
  result: TasteForgeResult,
  listings: MarketplaceListing[],
  prefs: NotifPrefsLike,
): NotificationItem[] {
  const out: NotificationItem[] = [];
  const withinPrice = (p: number) => prefs.maxPrice == null || p <= prefs.maxPrice;

  // Perfect matches from scored recommendations
  if (!prefs.wishlistOnly) {
    for (const rec of result.bestOverall.slice(0, 6)) {
      const m = pct(rec.resonanceScore);
      const price = rec.card.askPrice ?? rec.card.floorPrice ?? 0;
      if (m < prefs.matchThreshold) continue;
      if (!withinPrice(price)) continue;
      out.push({
        id: `match-${rec.card.id}`,
        kind: "match",
        title: `Strong match — ${rec.card.title}`,
        detail: rec.whyNow || rec.explanation,
        meta: `${m}% match`,
        tokenId: rec.card.tokenId,
        group: "Today",
      });
    }
  }

  // Below-FMV opportunities from live listings
  const bargains = [...listings]
    .filter((l) => l.isBargain && l.discountPct > 0 && withinPrice(l.askPrice))
    .filter((l) => !prefs.gradedOnly || Boolean(l.grade))
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 4);
  for (const l of bargains) {
    out.push({
      id: `fmv-${l.tokenId}`,
      kind: "belowFmv",
      title: `Below FMV — ${l.name}`,
      detail: `Asking ${l.askPrice ? `$${Math.round(l.askPrice).toLocaleString()}` : "—"} vs fair value.`,
      meta: `${Math.round(l.discountPct)}% below FMV`,
      tokenId: l.tokenId,
      group: "Today",
    });
  }

  // Wishlist availability
  for (const w of deriveWishlist(result).slice(0, 3)) {
    if (w.matchPct < prefs.matchThreshold && prefs.wishlistOnly) continue;
    out.push({
      id: `wish-${w.id}`,
      kind: "wishlist",
      title: `Wishlist available — ${w.title}`,
      detail: w.reason,
      meta: `${w.matchPct}% match`,
      tokenId: w.tokenId,
      group: "This week",
    });
  }

  // Milestone
  const identity = deriveCollectorIdentity(result);
  if (identity.diversity === "Excellent") {
    out.push({
      id: "milestone-diversity",
      kind: "milestone",
      title: "Collection milestone",
      detail: "Your collection now spans an excellent range of series and eras.",
      group: "This week",
    });
  }

  return out;
}

/** Grounded, forward-looking one-liner for the dashboard "AI insight". */
export function deriveAiInsight(
  result: TasteForgeResult,
  brief: DailyBrief,
): string {
  const tv = result.tasteVector;
  const interests = primaryInterests(tv);
  const firstSentence =
    (tv.summary || "").split(/(?<=[.!?])\s/)[0] || tv.summary || "";
  const parts: string[] = [];
  if (firstSentence) parts.push(firstSentence);
  if (interests.length) parts.push(`Your strongest signals: ${interests.join(", ")}.`);
  if (brief.belowFmv > 0) {
    parts.push(
      `${brief.belowFmv} live ${
        brief.belowFmv === 1 ? "listing sits" : "listings sit"
      } below fair market value right now — we recommend watching the ones that match your signature.`,
    );
  }
  return parts.join(" ");
}
