import type { RenaissCard } from "@/lib/types";

/**
 * Value Score blends taste resonance with market efficiency.
 *
 * - valueEfficiency: FMV vs floor (undervalued cards score higher)
 * - liquidity: ease of entry/exit
 * - resonance: personal taste match (passed in)
 */
export function computeValueEfficiency(card: RenaissCard): number {
  if (card.floorPrice <= 0) return 0.5;
  const ratio = card.fmv / card.floorPrice;

  // FMV > floor → undervalued opportunity (cap at 40% discount equivalent)
  if (ratio >= 1) {
    return Math.min(1, 0.55 + (ratio - 1) * 1.2);
  }

  // Overpriced vs FMV — penalize gently
  return Math.max(0.1, ratio * 0.7);
}

export function buildValueInsight(card: RenaissCard): string {
  const delta = ((card.fmv - card.floorPrice) / card.fmv) * 100;

  if (delta > 8) {
    return `${delta.toFixed(0)}% below FMV ($${card.fmv}) — strong value entry`;
  }
  if (delta > 0) {
    return `${delta.toFixed(0)}% below FMV — fair value with upside`;
  }
  if (delta > -10) {
    return `Near FMV ($${card.fmv}) — priced fairly`;
  }
  return `${Math.abs(delta).toFixed(0)}% above FMV — premium for rarity/liquidity`;
}

export function computeValueScore(
  card: RenaissCard,
  resonanceScore: number,
): number {
  const efficiency = computeValueEfficiency(card);
  const liquidity = card.liquidity;

  return Math.min(
    1,
    resonanceScore * 0.45 + efficiency * 0.35 + liquidity * 0.2,
  );
}

export function computeOverallScore(
  resonanceScore: number,
  valueScore: number,
): number {
  return resonanceScore * 0.65 + valueScore * 0.35;
}