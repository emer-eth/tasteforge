import type {
  CardDimensions,
  RenaissCard,
  TasteDimensions,
  TasteVector,
} from "@/lib/types";

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
  score: number;
  alignment: Partial<TasteDimensions>;
  matchingTags: string[];
}

export function scoreCardAgainstTaste(
  card: RenaissCard,
  tasteVector: TasteVector,
): ScoredCard {
  const dimScore = cosineSimilarity(tasteVector.dimensions, card.dimensions);
  const { score: tagScore, matching } = tagOverlap(
    tasteVector.aestheticTags,
    card.aestheticTags,
  );
  const subjectScore = subjectAffinityScore(
    tasteVector.subjectAffinities,
    card.subject,
  );
  const artistBonus = tasteVector.aestheticTags.some((t) =>
    card.artist.toLowerCase().includes(t.toLowerCase()),
  )
    ? 0.05
    : 0;

  const score =
    dimScore * 0.55 +
    tagScore * 0.25 +
    subjectScore * 0.15 +
    artistBonus +
    RARITY_SCORE[card.rarity] * tasteVector.dimensions.rarity_appreciation * 0.05;

  return {
    card,
    score: Math.min(1, score),
    alignment: computeDimensionAlignment(tasteVector.dimensions, card.dimensions),
    matchingTags: matching,
  };
}

export function rankRecommendations(
  catalog: RenaissCard[],
  tasteVector: TasteVector,
  ownedIds: Set<string>,
  limit = 5,
): ScoredCard[] {
  return catalog
    .filter((card) => !ownedIds.has(card.id))
    .map((card) => scoreCardAgainstTaste(card, tasteVector))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}