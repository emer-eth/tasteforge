import { fetchWalletSnapshot, validateBnbAddress } from "@/lib/chain/bsc";
import {
  buildLiveHoldingsActivity,
  resolveCollectorMode,
} from "@/lib/collector/activity-history";
import { parseSocialFragments } from "@/lib/collector/build-pending-collector";
import { fetchCardsByOwner } from "@/lib/renaiss/marketplace";
import { marketplaceCardsToCatalog } from "@/lib/renaiss/map-to-tasteforge";
import type { CollectorInteraction, WalletHoldings } from "@/lib/types";

/**
 * Real wallet resolution — BNB chain + Renaiss marketplace API.
 * No demo/mock collector mapping.
 */
export async function fetchWalletHoldings(
  address: string,
  socialText?: string,
): Promise<WalletHoldings> {
  const validated = validateBnbAddress(address);
  const snapshot = await fetchWalletSnapshot(validated);
  const socialCount = parseSocialFragments(socialText ?? "").length;

  const liveCards = await fetchCardsByOwner(validated, 12);

  if (liveCards.length > 0) {
    const holdings = marketplaceCardsToCatalog(liveCards);
    const interactions: CollectorInteraction[] = holdings.map((card) => ({
      cardId: card.id,
      type: "owned" as const,
      timestamp: new Date().toISOString(),
    }));
    const activityHistory = buildLiveHoldingsActivity(liveCards, holdings);
    const collectorMode = resolveCollectorMode(holdings.length, socialCount);

    return {
      address: validated,
      bnbBalance: snapshot.bnbBalance,
      chainId: snapshot.chainId,
      holdings,
      interactions,
      activityHistory,
      profile: {
        id: `wallet-${validated.slice(2, 10)}`,
        handle: validated.slice(2, 10),
        displayName: `Collector ${validated.slice(2, 6)}…${validated.slice(-4)}`,
        bio: `${holdings.length} Renaiss card${holdings.length === 1 ? "" : "s"} found via live marketplace scan.`,
        joinedAt: new Date().toISOString().split("T")[0],
        statedPreferences: [],
        favoriteArtists: [...new Set(holdings.map((c) => c.artist))].slice(0, 4),
        favoriteSubjects: [...new Set(holdings.map((c) => c.subject))].slice(0, 4),
        walletAddress: validated,
      },
      collectorMode,
      source: "on-chain-mapped",
      fetchedAt: new Date().toISOString(),
    };
  }

  const collectorMode = resolveCollectorMode(0, socialCount);

  return {
    address: validated,
    bnbBalance: snapshot.bnbBalance,
    chainId: snapshot.chainId,
    holdings: [],
    interactions: [],
    activityHistory: [],
    profile: {
      id: `wallet-${validated.slice(2, 10)}`,
      handle: validated.slice(2, 8),
      displayName: `Collector ${validated.slice(2, 6)}…${validated.slice(-4)}`,
      bio:
        collectorMode === "social-only"
          ? "Live wallet — taste profile built from social signals across the Renaiss marketplace."
          : "Live wallet connected — add social taste signals for personalized Renaiss recommendations.",
      joinedAt: new Date().toISOString().split("T")[0],
      statedPreferences: [],
      favoriteArtists: [],
      favoriteSubjects: [],
      walletAddress: validated,
    },
    collectorMode,
    source: "on-chain-mapped",
    fetchedAt: new Date().toISOString(),
  };
}