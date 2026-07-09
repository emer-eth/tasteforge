import type {
  CardDimensions,
  RenaissCard,
  TasteDimensions,
  TasteVector,
} from "@/lib/types";
import {
  buildValueInsight,
  computeOverallScore,
  computeValueScore,
} from "@/lib/taste-vector/value-scorer";

const DIMENSION_KEYS = Object.keys({
  vintage_modern: 0,
  minimalist_ornate: 0,
  bold_subtle: 0,
  warm_cool: 0,
  rarity_appreciation: 0,
  narrative_depth: 0,
  artistic_craft: 0,
  nostalgia: 0,
  community_social: 0,
  investment_mindset: 0,
}) as (keyof TasteDimensions)[];

const RARITY_SCORE: Record<string, number> = {
  common: 0.1,
  uncommon: 0.35,
  rare: 0.65,
  legendary: 0.9,
};

export function cosineSimilarity(a: TasteDimensions, b: CardDimensions): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of DIMENSION_KEYS) {
    dot += a[key] * b[key];
    magA += a[key] ** 2;
    magB += b[key] ** 2;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function tagOverlap(
  tasteTags: string[],
  cardTags: string[],
): { score: number; matching: string[] } {
  const normalizedTaste = new Set(tasteTags.map((t) => t.toLowerCase()));
  const matching = cardTags.filter((t) => normalizedTaste.has(t.toLowerCase()));
  const union = new Set([
    ...tasteTags.map((t) => t.toLowerCase()),
    ...cardTags.map((t) => t.toLowerCase()),
  ]);
  return {
    score: union.size > 0 ? matching.length / union.size : 0,
    matching,
  };
}

export function emotionalOverlap(
  tasteEmotions: string[],
  cardEmotions: string[],
): number {
  if (tasteEmotions.length === 0) return 0.3;
  const tasteSet = new Set(tasteEmotions.map((e) => e.toLowerCase()));
  const matches = cardEmotions.filter((e) => tasteSet.has(e.toLowerCase()));
  return matches.length / Math.max(tasteEmotions.length, 1);
}

export function subjectAffinityScore(
  affinities: Record<string, number>,
  subject: string,
): number {
  const direct = affinities[subject];
  if (direct !== undefined) return direct;

  const partial = Object.entries(affinities).find(
    ([key]) => subject.includes(key) || key.includes(subject),
  );
  return partial?.[1] ?? 0.3;
}

export function computeDimensionAlignment(
  taste: TasteDimensions,
  card: CardDimensions,
): Partial<TasteDimensions> {
  const alignment: Partial<TasteDimensions> = {};
  for (const key of DIMENSION_KEYS) {
    alignment[key] = 1 - Math.abs(taste[key] - card[key]);
  }
  return alignment;
}

export interface ScoredCard {
  card: RenaissCard;
  resonanceScore: number;
  valueScore: number;
  overallScore: number;
  alignment: Partial<TasteDimensions>;
  matchingTags: string[];
  valueInsight: string;
}

/** Resonance = pure taste match (no price bias) */
export function scoreCardResonance(
  card: RenaissCard,
  tasteVector: TasteVector,
): ScoredCard {
  const dimScore = cosineSimilarity(tasteVector.dimensions, card.dimensions);
  const { score: tagScore, matching } = tagOverlap(
    tasteVector.aestheticTags,
    card.aestheticTags,
  );
  const emotionScore = emotionalOverlap(
    tasteVector.emotionalTags,
    card.emotionalTags,
  );
  const subjectScore = subjectAffinityScore(
    tasteVector.subjectAffinities,
    card.subject,
  );

  const resonanceScore = Math.min(
    1,
    dimScore * 0.5 +
      tagScore * 0.2 +
      subjectScore * 0.15 +
      emotionScore * 0.1 +
      RARITY_SCORE[card.rarity] * tasteVector.dimensions.rarity_appreciation * 0.05,
  );

  const valueScore = computeValueScore(card, resonanceScore);
  const overallScore = computeOverallScore(resonanceScore, valueScore);

  return {
    card,
    resonanceScore,
    valueScore,
    overallScore,
    alignment: computeDimensionAlignment(tasteVector.dimensions, card.dimensions),
    matchingTags: matching,
    valueInsight: buildValueInsight(card),
  };
}

export function rankByOverall(
  catalog: RenaissCard[],
  tasteVector: TasteVector,
  ownedIds: Set<string>,
  limit = 5,
): ScoredCard[] {
  return catalog
    .filter((card) => !ownedIds.has(card.id))
    .map((card) => scoreCardResonance(card, tasteVector))
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, limit);
}

export function rankByValue(
  catalog: RenaissCard[],
  tasteVector: TasteVector,
  ownedIds: Set<string>,
  limit = 5,
): ScoredCard[] {
  return catalog
    .filter((card) => !ownedIds.has(card.id))
    .map((card) => scoreCardResonance(card, tasteVector))
    .filter((s) => s.resonanceScore >= 0.35)
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, limit);
}

/** @deprecated use rankByOverall */
export function rankRecommendations(
  catalog: RenaissCard[],
  tasteVector: TasteVector,
  ownedIds: Set<string>,
  limit = 5,
): ScoredCard[] {
  return rankByOverall(catalog, tasteVector, ownedIds, limit);
}