import type {
  CollectorData,
  CollectorInteraction,
  TasteDimensions,
  TasteVector,
} from "@/lib/types";
import { getCardById } from "@/lib/data/mock-renaiss";
import { deriveTasteArchetype } from "@/lib/taste-vector/dimensions";

const DIMENSION_KEYS: (keyof TasteDimensions)[] = [
  "vintage_modern",
  "minimalist_ornate",
  "bold_subtle",
  "warm_cool",
  "rarity_appreciation",
  "narrative_depth",
  "artistic_craft",
  "nostalgia",
  "community_social",
  "investment_mindset",
];

const INTERACTION_WEIGHTS: Record<CollectorInteraction["type"], number> = {
  owned: 1.0,
  wishlisted: 0.8,
  liked: 0.7,
  viewed: 0.4,
  bid: 0.6,
  passed: -0.35,
};

function weightedAverage(
  values: Array<{ dims: TasteDimensions; weight: number }>,
): TasteDimensions {
  const result = {} as TasteDimensions;
  for (const key of DIMENSION_KEYS) {
    let sum = 0;
    let weightSum = 0;
    for (const { dims, weight } of values) {
      if (weight === 0) continue;
      sum += dims[key] * Math.abs(weight);
      weightSum += Math.abs(weight);
    }
    result[key] = weightSum > 0 ? sum / weightSum : 0.5;
  }
  return result;
}

function extractTags(cards: ReturnType<typeof getCardById>[]): string[] {
  const tagCounts = new Map<string, number>();
  for (const card of cards) {
    if (!card) continue;
    for (const tag of card.aestheticTags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

function extractColors(cards: ReturnType<typeof getCardById>[]): string[] {
  const colors = new Set<string>();
  for (const card of cards) {
    if (!card) continue;
    card.colorPalette.slice(0, 2).forEach((c) => colors.add(c));
  }
  return [...colors].slice(0, 6);
}

function extractSubjectAffinities(
  cards: ReturnType<typeof getCardById>[],
): Record<string, number> {
  const counts = new Map<string, number>();
  let total = 0;
  for (const card of cards) {
    if (!card) continue;
    counts.set(card.subject, (counts.get(card.subject) ?? 0) + 1);
    total++;
  }
  const affinities: Record<string, number> = {};
  for (const [subject, count] of counts) {
    affinities[subject] = Math.min(1, count / Math.max(total, 1) + 0.3);
  }
  return affinities;
}

/** Deterministic fallback — no API key required. Great for hackathon demos. */
export function generateTasteVectorDeterministic(
  data: CollectorData,
): TasteVector {
  const weightedSignals: Array<{ dims: TasteDimensions; weight: number }> = [];

  for (const interaction of data.interactions) {
    const card = getCardById(interaction.cardId);
    if (!card) continue;

    let weight = INTERACTION_WEIGHTS[interaction.type];
    if (interaction.type === "viewed" && (interaction.dwellSeconds ?? 0) > 30) {
      weight = 0.55;
    }

    weightedSignals.push({ dims: card.dimensions, weight });
  }

  const dimensions = weightedAverage(weightedSignals);

  const positiveCards = data.interactions
    .filter((i) => i.type !== "passed")
    .map((i) => getCardById(i.cardId))
    .filter(Boolean);

  const aestheticTags = [
    ...extractTags(positiveCards),
    ...data.profile.statedPreferences
      .flatMap((p) => p.split(" "))
      .filter((w) => w.length > 4)
      .slice(0, 3),
  ].slice(0, 10);

  const subjectAffinities = {
    ...extractSubjectAffinities(positiveCards),
    ...Object.fromEntries(
      data.profile.favoriteSubjects.map((s) => [s, 0.85]),
    ),
  };

  const colorPalette = extractColors(positiveCards);

  const ownedArtists = new Set(data.collection.map((c) => c.artist));
  const wishlistCards = data.interactions
    .filter((i) => i.type === "wishlisted")
    .map((i) => getCardById(i.cardId))
    .filter(Boolean);

  const signalAnalysis = buildSignalAnalysis(data, dimensions);

  const summary = buildTasteSummary(data, dimensions, aestheticTags);

  return {
    id: `tv-${data.profile.id}-${Date.now()}`,
    collectorId: data.profile.id,
    dimensions,
    aestheticTags: [...new Set(aestheticTags)],
    subjectAffinities,
    colorPalette,
    summary,
    confidence: Math.min(0.95, 0.55 + data.interactions.length * 0.03),
    signalAnalysis,
    tasteArchetype: deriveTasteArchetype(dimensions),
    generatedAt: new Date().toISOString(),
  };
}

function buildSignalAnalysis(
  data: CollectorData,
  dims: TasteDimensions,
): string {
  const passed = data.interactions
    .filter((i) => i.type === "passed")
    .map((i) => getCardById(i.cardId))
    .filter(Boolean);

  const avoids = passed.length
    ? passed.map((c) => c!.aestheticTags.slice(0, 2).join("/")).join(", ")
    : "nothing strongly yet";

  const lean =
    dims.minimalist_ornate < 0.4
      ? "minimal, breathing compositions"
      : dims.minimalist_ornate > 0.7
        ? "ornate, detail-rich work"
        : "balanced visual complexity";

  return (
    `${data.profile.displayName} consistently acquires ${lean} with ` +
    `${dims.warm_cool > 0.5 ? "cool" : "warm"} tonal palettes. ` +
    `Strongest signals come from ${data.collection.length} owned pieces by ` +
    `${[...new Set(data.collection.map((c) => c.artist))].join(" and ")}. ` +
    `They actively avoid: ${avoids}. ` +
    `Wishlist activity suggests appetite for ${dims.narrative_depth > 0.5 ? "conceptually layered" : "purely aesthetic"} additions.`
  );
}

function buildTasteSummary(
  data: CollectorData,
  dims: TasteDimensions,
  tags: string[],
): string {
  const era = dims.vintage_modern > 0.6 ? "contemporary" : "vintage-leaning";
  const mood = dims.bold_subtle < 0.4 ? "quiet and contemplative" : "bold and expressive";
  const tagStr = tags.slice(0, 3).join(", ");

  return (
    `You gravitate toward ${era} cards with ${mood} energy — ` +
    `especially ${tagStr}. Your collection reads as a curated gallery of ` +
    `${dims.artistic_craft > 0.6 ? "craft-forward" : "accessible"} work, ` +
    `with ${dims.rarity_appreciation > 0.5 ? "an eye for scarcity" : "taste over floor price"} ` +
    `guiding your acquisitions.`
  );
}

export function parseLLMTasteVector(
  raw: string,
  collectorId: string,
  signalAnalysis: string,
): TasteVector | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      id: `tv-${collectorId}-${Date.now()}`,
      collectorId,
      dimensions: parsed.dimensions,
      aestheticTags: parsed.aestheticTags ?? [],
      subjectAffinities: parsed.subjectAffinities ?? {},
      colorPalette: parsed.colorPalette ?? [],
      summary: parsed.summary ?? "",
      confidence: parsed.confidence ?? 0.75,
      signalAnalysis,
      tasteArchetype: deriveTasteArchetype(parsed.dimensions),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}