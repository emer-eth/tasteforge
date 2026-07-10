import type { CollectorActivityEvent, RenaissCard } from "@/lib/types";

export interface PortfolioStats {
  cardCount: number;
  listedCount: number;
  /** Sum of FMV estimates (USD) */
  totalFmv: number;
  /** Sum of live ask prices for listed cards only */
  totalListedAsk: number;
  /** Sum of best available mark (ask if listed, else FMV) */
  totalMark: number;
}

export function computePortfolioStats(cards: RenaissCard[]): PortfolioStats {
  let totalFmv = 0;
  let totalListedAsk = 0;
  let totalMark = 0;
  let listedCount = 0;

  for (const card of cards) {
    const fmv = Number.isFinite(card.fmv) ? card.fmv : 0;
    const ask =
      card.isListed && card.askPrice != null && Number.isFinite(card.askPrice)
        ? card.askPrice
        : null;
    totalFmv += fmv;
    if (ask != null) {
      listedCount += 1;
      totalListedAsk += ask;
      totalMark += ask;
    } else {
      totalMark += fmv;
    }
  }

  return {
    cardCount: cards.length,
    listedCount,
    totalFmv,
    totalListedAsk,
    totalMark,
  };
}

/** Sort holdings: listed first, then by FMV desc */
export function sortHoldingsForDisplay(cards: RenaissCard[]): RenaissCard[] {
  return [...cards].sort((a, b) => {
    const aListed = a.isListed ? 1 : 0;
    const bListed = b.isListed ? 1 : 0;
    if (aListed !== bListed) return bListed - aListed;
    return (b.fmv || 0) - (a.fmv || 0);
  });
}

/** Recent marketplace-facing events for the holdings panel (honest snapshot) */
export function recentSnapshotActivity(
  events: CollectorActivityEvent[] | undefined,
  limit = 6,
): CollectorActivityEvent[] {
  if (!events?.length) return [];
  // Prefer listed (actionable), then holdings — already sorted in builder
  const listed = events.filter((e) => e.type === "listed");
  const rest = events.filter((e) => e.type !== "listed");
  return [...listed, ...rest].slice(0, limit);
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  }
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
