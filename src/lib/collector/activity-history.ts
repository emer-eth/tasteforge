import type {
  CollectorActivityEvent,
  CollectorMode,
  RenaissCard,
} from "@/lib/types";
import type { RenaissMarketplaceCard } from "@/lib/renaiss/marketplace";

export function resolveCollectorMode(
  holdingsCount: number,
  socialSignalCount: number,
): CollectorMode {
  if (holdingsCount > 0) return "holder";
  if (socialSignalCount > 0) return "social-only";
  return "non-holder";
}

/**
 * Honest holdings snapshot from live Renaiss ownership + listing data.
 *
 * We only emit facts we actually observe:
 * - card is currently owned by the wallet (via marketplace owner scan)
 * - card is currently listed (real ask price)
 *
 * We do NOT invent acquisition dates, sales, transfers, or trade history.
 * Timestamps are the snapshot observation time, not on-chain event times.
 */
export function buildLiveHoldingsActivity(
  cards: RenaissMarketplaceCard[],
  catalog: RenaissCard[],
  observedAt: Date = new Date(),
): CollectorActivityEvent[] {
  const events: CollectorActivityEvent[] = [];
  const snapshotIso = observedAt.toISOString();

  for (const marketCard of cards) {
    const catalogCard = catalog.find((c) => c.tokenId === marketCard.tokenId);
    const title = catalogCard?.title ?? marketCard.name;
    const imageUrl = catalogCard?.imageUrl ?? marketCard.imageUrl;

    events.push({
      id: `hold-${marketCard.tokenId}`,
      type: "holding",
      tokenId: marketCard.tokenId,
      cardTitle: title,
      imageUrl,
      timestamp: snapshotIso,
      fmv: marketCard.fmv ?? undefined,
      note: "Observed in wallet now · Renaiss ownership scan (not acquisition date)",
    });

    if (marketCard.isListed && marketCard.askPrice != null) {
      events.push({
        id: `list-${marketCard.tokenId}`,
        type: "listed",
        tokenId: marketCard.tokenId,
        cardTitle: title,
        imageUrl,
        timestamp: snapshotIso,
        price: marketCard.askPrice,
        fmv: marketCard.fmv ?? undefined,
        note: "Listed now on Renaiss marketplace · live ask price",
      });
    }
  }

  // Listed first (actionable), then holdings — stable by tokenId
  return events.sort((a, b) => {
    if (a.type !== b.type) {
      if (a.type === "listed") return -1;
      if (b.type === "listed") return 1;
    }
    return a.tokenId.localeCompare(b.tokenId);
  });
}

export function mergeActivityHistory(
  ...lists: CollectorActivityEvent[][]
): CollectorActivityEvent[] {
  const seen = new Set<string>();
  const merged: CollectorActivityEvent[] = [];

  for (const list of lists) {
    for (const event of list) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      merged.push(event);
    }
  }

  return merged.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
