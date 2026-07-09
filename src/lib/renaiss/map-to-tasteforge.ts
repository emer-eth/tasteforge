import type { RenaissCard } from "@/lib/types";
import type { RenaissMarketplaceCard } from "@/lib/renaiss/marketplace";

/** Heuristic taste dimensions from real graded Pokemon card metadata */
function inferDimensions(card: RenaissMarketplaceCard): RenaissCard["dimensions"] {
  const year = card.year ?? 2015;
  const vintageModern = Math.min(1, Math.max(0, (year - 1995) / 30));
  const isGem = card.grade.toLowerCase().includes("10");
  const isJapanese = card.language.toLowerCase().includes("japanese");

  return {
    vintage_modern: year < 2010 ? 0.2 : year < 2018 ? 0.5 : 0.75,
    minimalist_ornate: 0.45,
    bold_subtle: isGem ? 0.55 : 0.4,
    warm_cool: isJapanese ? 0.6 : 0.45,
    rarity_appreciation: isGem ? 0.75 : 0.5,
    narrative_depth: 0.5,
    artistic_craft: isGem ? 0.85 : 0.6,
    nostalgia: year < 2012 ? 0.8 : year < 2018 ? 0.5 : 0.3,
    community_social: 0.55,
    investment_mindset: card.fmv && card.askPrice ? 0.7 : 0.4,
  };
}

function inferTags(card: RenaissMarketplaceCard): string[] {
  const tags = [card.grader, card.language, card.setName]
    .filter(Boolean)
    .map((t) => t.toLowerCase().replace(/\s+/g, "-"));
  if (card.grade.includes("10")) tags.push("gem-mint");
  if (card.year && card.year < 2012) tags.push("vintage");
  return [...new Set(tags)].slice(0, 6);
}

function inferEmotions(card: RenaissMarketplaceCard): string[] {
  const emotions: string[] = [];
  if (card.grade.includes("10")) emotions.push("pride", "precision");
  if (card.year && card.year < 2012) emotions.push("nostalgia");
  if (card.characterName) emotions.push("fandom");
  return emotions.length ? emotions : ["collecting"];
}

export function marketplaceCardToTasteforge(
  card: RenaissMarketplaceCard,
  index: number,
): RenaissCard {
  const floorPrice = card.askPrice ?? card.fmv ?? 0;
  const fmv = card.fmv ?? floorPrice;
  const discount = fmv > 0 ? (fmv - floorPrice) / fmv : 0;
  const liquidity = card.isListed
    ? Math.min(0.95, 0.55 + discount * 0.4)
    : 0.25;

  return {
    id: `live-${card.tokenId.slice(0, 12)}`,
    title: card.name.length > 48 ? card.name.slice(0, 45) + "…" : card.name,
    artist: card.grader || "Renaiss",
    series: card.setName || "Marketplace",
    era: (card.year ?? 2015) < 2012 ? "vintage" : "contemporary",
    rarity: card.grade.includes("10")
      ? "legendary"
      : card.grade.includes("9")
        ? "rare"
        : "uncommon",
    subject: card.characterName || "pokemon",
    aestheticTags: inferTags(card),
    colorPalette: ["#1a1a2e", "#c9a227", "#e94560"],
    dimensions: inferDimensions(card),
    emotionalTags: inferEmotions(card),
    description: `${card.grader} ${card.grade} · ${card.serial}`,
    imageUrl: card.imageUrl,
    floorPrice,
    fmv,
    liquidity,
    volume24h: card.isListed ? 8 : 1,
    editionSize: 1,
    tokenId: card.tokenId,
  };
}

export function marketplaceCardsToCatalog(
  cards: RenaissMarketplaceCard[],
): RenaissCard[] {
  return cards.map((c, i) => marketplaceCardToTasteforge(c, i));
}