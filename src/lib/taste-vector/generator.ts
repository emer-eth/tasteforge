import type {
  CollectorData,
  CollectorInteraction,
  RenaissCard,
  TasteDimensions,
  TasteVector,
} from "@/lib/types";
import { deriveTasteArchetype } from "@/lib/taste-vector/dimensions";
import {
  mergeDimensions,
  parseSocialTasteSignals,
} from "@/lib/taste-vector/social-signals";

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

const NEUTRAL_DIMENSIONS: TasteDimensions = {
  vintage_modern: 0.5,
  minimalist_ornate: 0.5,
  bold_subtle: 0.5,
  warm_cool: 0.5,
  rarity_appreciation: 0.55,
  narrative_depth: 0.5,
  artistic_craft: 0.6,
  nostalgia: 0.45,
  community_social: 0.5,
  investment_mindset: 0.55,
};

function resolveCard(
  cardId: string,
  collection: RenaissCard[],
): RenaissCard | undefined {
  return collection.find((c) => c.id === cardId);
}

function weightedAverage(
  values: Array<{ dims: TasteDimensions; weight: number }>,
  fallback: TasteDimensions,
): TasteDimensions {
  if (values.length === 0) return fallback;

  const result = {} as TasteDimensions;
  for (const key of DIMENSION_KEYS) {
    let sum = 0;
    let weightSum = 0;
    for (const { dims, weight } of values) {
      if (weight === 0) continue;
      sum += dims[key] * Math.abs(weight);
      weightSum += Math.abs(weight);
    }
    result[key] = weightSum > 0 ? sum / weightSum : fallback[key];
  }
  return result;
}

function extractTags(cards: RenaissCard[]): string[] {
  const tagCounts = new Map<string, number>();
  for (const card of cards) {
    for (const tag of card.aestheticTags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

function extractColors(cards: RenaissCard[]): string[] {
  const colors = new Set<string>();
  for (const card of cards) {
    card.colorPalette.slice(0, 2).forEach((c) => colors.add(c));
  }
  return [...colors].slice(0, 6);
}

function extractSubjectAffinities(
  cards: RenaissCard[],
): Record<string, number> {
  const counts = new Map<string, number>();
  let total = 0;
  for (const card of cards) {
    counts.set(card.subject, (counts.get(card.subject) ?? 0) + 1);
    total++;
  }
  const affinities: Record<string, number> = {};
  for (const [subject, count] of counts) {
    affinities[subject] = Math.min(1, count / Math.max(total, 1) + 0.3);
  }
  return affinities;
}

/** Deterministic fallback — wallet + social + holdings signals, no API key required */
export function generateTasteVectorDeterministic(
  data: CollectorData,
): TasteVector {
  const socialParsed = parseSocialTasteSignals(data.socialSignals);
  const vision = data.visionAnalysis;
  const weightedSignals: Array<{ dims: TasteDimensions; weight: number }> = [];

  // Vision — multimodal artwork analysis of held cards
  if (vision && vision.weight > 0) {
    const visionDims = mergeDimensions(
      NEUTRAL_DIMENSIONS,
      vision.dimensions,
      0.72,
    );
    weightedSignals.push({
      dims: visionDims,
      weight: 1.15 * vision.weight,
    });
  }

  // Social signals — primary when wallet is empty or sparse
  if (socialParsed.weight > 0) {
    const socialDims = mergeDimensions(
      NEUTRAL_DIMENSIONS,
      socialParsed.dimensions,
      0.75,
    );
    weightedSignals.push({
      dims: socialDims,
      weight: 1.3 * socialParsed.weight,
    });
  }

  // Stated preferences from profile (includes parsed social fragments)
  if (data.profile.statedPreferences.length > 0) {
    const prefParsed = parseSocialTasteSignals(data.profile.statedPreferences);
    if (prefParsed.weight > 0) {
      weightedSignals.push({
        dims: mergeDimensions(NEUTRAL_DIMENSIONS, prefParsed.dimensions, 0.65),
        weight: 0.9,
      });
    }
  }

  // Owned holdings — supporting signal, not the only source
  for (const card of data.collection) {
    weightedSignals.push({ dims: card.dimensions, weight: 0.75 });
  }

  // Behavioral interactions (wishlist, likes, passes)
  for (const interaction of data.interactions) {
    const card = resolveCard(interaction.cardId, data.collection);
    if (!card) continue;

    let weight = INTERACTION_WEIGHTS[interaction.type];
    if (interaction.type === "viewed" && (interaction.dwellSeconds ?? 0) > 30) {
      weight = 0.55;
    }

    weightedSignals.push({ dims: card.dimensions, weight });
  }

  const dimensions = weightedAverage(weightedSignals, NEUTRAL_DIMENSIONS);

  const positiveCards = [
    ...data.collection,
    ...data.interactions
      .filter((i) => i.type !== "passed")
      .map((i) => resolveCard(i.cardId, data.collection))
      .filter((c): c is RenaissCard => Boolean(c)),
  ];

  const aestheticTags = [
    ...(vision?.aestheticTags ?? []),
    ...socialParsed.aestheticTags,
    ...extractTags(positiveCards),
    ...data.profile.statedPreferences
      .flatMap((p) => p.split(" "))
      .filter((w) => w.length > 4)
      .slice(0, 3),
  ].slice(0, 10);

  const emotionalTags = [
    ...(vision?.emotionalTags ?? []),
    ...socialParsed.emotionalTags,
    ...new Set(positiveCards.flatMap((c) => c.emotionalTags)),
  ].slice(0, 8);

  const subjectAffinities = {
    ...extractSubjectAffinities(positiveCards),
    ...socialParsed.subjectAffinities,
    ...Object.fromEntries(
      data.profile.favoriteSubjects.map((s) => [s, 0.85]),
    ),
  };

  const colorPalette =
    vision?.colorPalette?.length
      ? vision.colorPalette
      : positiveCards.length > 0
        ? extractColors(positiveCards)
        : ["#1a1a2e", "#c9a227", "#e94560"];

  const signalAnalysis = buildSignalAnalysis(
    data,
    dimensions,
    socialParsed.weight,
    vision?.weight ?? 0,
  );
  const summary = buildTasteSummary(
    data,
    dimensions,
    aestheticTags,
    socialParsed.weight,
    vision,
  );

  const signalCount =
    (data.socialSignals?.length ?? 0) +
    data.collection.length +
    data.interactions.length;

  const isNonHolder = data.collection.length === 0;
  const socialAnchored = socialParsed.weight > 0.3;

  return {
    id: `tv-${data.profile.id}-${Date.now()}`,
    collectorId: data.profile.id,
    dimensions,
    aestheticTags: [...new Set(aestheticTags)],
    emotionalTags,
    subjectAffinities,
    colorPalette,
    summary,
    confidence: Math.min(
      0.95,
      isNonHolder && socialAnchored
        ? 0.72 + socialParsed.weight * 0.2
        : 0.4 +
          socialParsed.weight * 0.35 +
          (vision?.weight ?? 0) * 0.15 +
          signalCount * 0.025,
    ),
    signalAnalysis,
    tasteArchetype: deriveTasteArchetype({
      dimensions,
      aestheticTags: [...new Set(aestheticTags)],
    }),
    generatedAt: new Date().toISOString(),
    visionEnriched: Boolean(vision && vision.weight > 0),
  };
}

function buildSignalAnalysis(
  data: CollectorData,
  dims: TasteDimensions,
  socialWeight: number,
  visionWeight: number,
): string {
  const passed = data.interactions
    .filter((i) => i.type === "passed")
    .map((i) => resolveCard(i.cardId, data.collection))
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

  const socialNote =
    socialWeight > 0.3
      ? `Social taste signals (${(socialWeight * 100).toFixed(0)}% confidence) strongly anchor recommendations — ` +
        `${data.socialSignals?.slice(0, 2).join("; ") ?? "stated preferences"}. `
      : "";

  const visionNote =
    visionWeight > 0 && data.visionAnalysis
      ? `Visual analysis of ${data.visionAnalysis.analyzedCards.length} held card image${data.visionAnalysis.analyzedCards.length === 1 ? "" : "s"} (${(visionWeight * 100).toFixed(0)}% confidence): ${data.visionAnalysis.summary} `
      : "";

  const holdingsNote =
    data.collection.length > 0
      ? `${data.collection.length} on-chain holdings reinforce the profile. `
      : "Recommendations lean on wallet identity + social taste — not just current holdings. ";

  return (
    `${visionNote}` +
    `${socialNote}` +
    `${data.profile.displayName}'s collector profile favors ${lean} with ` +
    `${dims.warm_cool > 0.5 ? "cool" : "warm"} tonal palettes. ` +
    holdingsNote +
    `They actively avoid: ${avoids}. ` +
    `Best picks are scored against the full live Renaiss marketplace catalog.`
  );
}

function buildTasteSummary(
  data: CollectorData,
  dims: TasteDimensions,
  tags: string[],
  socialWeight: number,
  vision?: CollectorData["visionAnalysis"],
): string {
  const era = dims.vintage_modern > 0.6 ? "contemporary" : "vintage-leaning";
  const mood = dims.bold_subtle < 0.4 ? "quiet and contemplative" : "bold and expressive";
  const tagStr = tags.slice(0, 3).join(", ") || "curated picks";

  const source =
    vision && vision.weight > 0
      ? "From your card artwork, wallet, and taste signals, you gravitate toward"
      : socialWeight > 0.3 && data.collection.length === 0
        ? "From your wallet + social signals, we recommend"
        : socialWeight > 0.3
          ? "Blending your wallet, social taste, and holdings, you gravitate toward"
          : "You gravitate toward";

  return (
    `${source} ${era} cards with ${mood} energy — ` +
    `especially ${tagStr}. TasteForge scores the full Renaiss marketplace to find ` +
    `the best cards for you, not just what you already own.`
  );
}

export function parseLLMTasteVector(
  raw: string,
  collectorId: string,
  signalAnalysis: string,
  visionEnriched = false,
): TasteVector | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      id: `tv-${collectorId}-${Date.now()}`,
      collectorId,
      dimensions: parsed.dimensions,
      aestheticTags: parsed.aestheticTags ?? [],
      emotionalTags: parsed.emotionalTags ?? [],
      subjectAffinities: parsed.subjectAffinities ?? {},
      colorPalette: parsed.colorPalette ?? [],
      summary: parsed.summary ?? "",
      confidence: parsed.confidence ?? 0.75,
      signalAnalysis,
      tasteArchetype: deriveTasteArchetype({
        dimensions: parsed.dimensions,
        aestheticTags: parsed.aestheticTags ?? [],
      }),
      generatedAt: new Date().toISOString(),
      visionEnriched,
    };
  } catch {
    return null;
  }
}