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

/** Build hold/list activity from live marketplace cards owned by wallet */
export function buildLiveHoldingsActivity(
  cards: RenaissMarketplaceCard[],
  catalog: RenaissCard[],
): CollectorActivityEvent[] {
  const events: CollectorActivityEvent[] = [];
  const now = Date.now();

  for (const [i, marketCard] of cards.entries()) {
    const catalogCard = catalog.find((c) => c.tokenId === marketCard.tokenId);
    const title = catalogCard?.title ?? marketCard.name;
    const imageUrl = catalogCard?.imageUrl ?? marketCard.imageUrl;
    const acquiredAt = new Date(now - (i + 1) * 86_400_000 * 14).toISOString();

    events.push({
      id: `hold-${marketCard.tokenId}`,
      type: "holding",
      tokenId: marketCard.tokenId,
      cardTitle: title,
      imageUrl,
      timestamp: acquiredAt,
      fmv: marketCard.fmv ?? undefined,
      note: "Currently in wallet",
    });

    if (marketCard.isListed && marketCard.askPrice) {
      events.push({
        id: `list-${marketCard.tokenId}`,
        type: "listed",
        tokenId: marketCard.tokenId,
        cardTitle: title,
        imageUrl,
        timestamp: new Date(now - i * 86_400_000 * 3).toISOString(),
        price: marketCard.askPrice,
        fmv: marketCard.fmv ?? undefined,
        note: "Listed on Renaiss marketplace",
      });
    } else {
      events.push({
        id: `acq-${marketCard.tokenId}`,
        type: "acquired",
        tokenId: marketCard.tokenId,
        cardTitle: title,
        imageUrl,
        timestamp: acquiredAt,
        fmv: marketCard.fmv ?? undefined,
        note: "Acquired — holding off-market",
      });
    }
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
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