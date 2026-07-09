import type { RenaissCard } from "@/lib/types";

/** FMV, liquidity, and on-chain token IDs — swap for live Renaiss API later */
export const MARKET_ENRICHMENT: Record<
  string,
  Pick<RenaissCard, "fmv" | "liquidity" | "volume24h" | "tokenId" | "emotionalTags">
> = {
  "rn-001": {
    fmv: 285,
    liquidity: 0.74,
    volume24h: 14,
    tokenId: "1001",
    emotionalTags: ["contemplative", "wonder", "serenity"],
  },
  "rn-002": {
    fmv: 1450,
    liquidity: 0.38,
    volume24h: 3,
    tokenId: "1002",
    emotionalTags: ["dramatic", "reverence", "power"],
  },
  "rn-003": {
    fmv: 72,
    liquidity: 0.88,
    volume24h: 42,
    tokenId: "1003",
    emotionalTags: ["rebellious", "energy", "urban-myth"],
  },
  "rn-004": {
    fmv: 48,
    liquidity: 0.91,
    volume24h: 28,
    tokenId: "1004",
    emotionalTags: ["calm", "intimacy", "patience"],
  },
  "rn-005": {
    fmv: 340,
    liquidity: 0.62,
    volume24h: 9,
    tokenId: "1005",
    emotionalTags: ["melancholy", "memory", "stillness"],
  },
  "rn-006": {
    fmv: 95,
    liquidity: 0.79,
    volume24h: 18,
    tokenId: "1006",
    emotionalTags: ["joy", "nostalgia", "play"],
  },
  "rn-007": {
    fmv: 1050,
    liquidity: 0.41,
    volume24h: 4,
    tokenId: "1007",
    emotionalTags: ["awe", "precision", "devotion"],
  },
  "rn-008": {
    fmv: 395,
    liquidity: 0.58,
    volume24h: 11,
    tokenId: "1008",
    emotionalTags: ["mystery", "desire", "dark-romance"],
  },
  "rn-009": {
    fmv: 118,
    liquidity: 0.7,
    volume24h: 15,
    tokenId: "1009",
    emotionalTags: ["silence", "sacred", "clarity"],
  },
  "rn-010": {
    fmv: 620,
    liquidity: 0.65,
    volume24h: 22,
    tokenId: "1010",
    emotionalTags: ["triumph", "nostalgia", "hype"],
  },
};

export function enrichCard<T extends Omit<RenaissCard, "fmv" | "liquidity" | "volume24h" | "tokenId" | "emotionalTags">>(
  card: T,
): RenaissCard {
  const market = MARKET_ENRICHMENT[card.id];
  return {
    ...card,
    fmv: market?.fmv ?? card.floorPrice * 1.1,
    liquidity: market?.liquidity ?? 0.5,
    volume24h: market?.volume24h ?? 5,
    tokenId: market?.tokenId ?? card.id,
    emotionalTags: market?.emotionalTags ?? ["curiosity"],
  };
}