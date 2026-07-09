import type { TasteDimensions } from "@/lib/types";

export const DIMENSION_LABELS: Record<
  keyof TasteDimensions,
  [string, string]
> = {
  vintage_modern: ["Vintage", "Modern"],
  minimalist_ornate: ["Minimal", "Ornate"],
  bold_subtle: ["Subtle", "Bold"],
  warm_cool: ["Warm", "Cool"],
  rarity_appreciation: ["Accessible", "Grail Hunter"],
  narrative_depth: ["Decorative", "Narrative"],
  artistic_craft: ["Commercial", "Fine Art"],
  nostalgia: ["Forward", "Nostalgic"],
  community_social: ["Personal", "Community"],
  investment_mindset: ["Pure Taste", "Investment"],
};

export const DIMENSION_SHORT_LABELS: Record<keyof TasteDimensions, string> = {
  vintage_modern: "Era",
  minimalist_ornate: "Style",
  bold_subtle: "Energy",
  warm_cool: "Palette",
  rarity_appreciation: "Rarity",
  narrative_depth: "Story",
  artistic_craft: "Craft",
  nostalgia: "Nostalgia",
  community_social: "Community",
  investment_mindset: "Investment",
};

export function getTopAlignedDimensions(
  alignment: Partial<TasteDimensions>,
  limit = 3,
): Array<{ key: keyof TasteDimensions; label: string; score: number }> {
  return (Object.entries(alignment) as [keyof TasteDimensions, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, score]) => ({
      key,
      label: DIMENSION_SHORT_LABELS[key],
      score,
    }));
}

interface ArchetypeInput {
  dimensions: TasteDimensions;
  aestheticTags?: string[];
}

/** Score how far a dimension leans from neutral (0.5) */
function lean(dimensions: TasteDimensions, key: keyof TasteDimensions): number {
  return dimensions[key] - 0.5;
}

function tagSet(tags: string[] | undefined): Set<string> {
  return new Set((tags ?? []).map((t) => t.toLowerCase()));
}

const ARCHETYPE_RULES: Array<{
  name: string;
  score: (d: TasteDimensions, tags: Set<string>) => number;
}> = [
  {
    name: "Grade Purist",
    score: (d, tags) =>
      Math.max(0, d.artistic_craft - 0.55) * 2 +
      Math.max(0, d.rarity_appreciation - 0.55) +
      (tags.has("psa-10") || tags.has("gem-mint") ? 1.2 : 0) +
      (tags.has("high-grade") ? 0.6 : 0),
  },
  {
    name: "Vintage Hunter",
    score: (d, tags) =>
      Math.max(0, 0.55 - d.vintage_modern) * 2.2 +
      Math.max(0, d.nostalgia - 0.55) * 1.5 +
      (tags.has("vintage") ? 1 : 0),
  },
  {
    name: "Modern Stacker",
    score: (d, tags) =>
      Math.max(0, d.vintage_modern - 0.55) * 2 +
      Math.max(0, 0.55 - d.nostalgia) +
      (tags.has("modern") ? 0.8 : 0),
  },
  {
    name: "Value Sniper",
    score: (d, tags) =>
      Math.max(0, d.investment_mindset - 0.55) * 2.2 +
      (tags.has("value-hunter") || tags.has("market-aware") ? 1.2 : 0),
  },
  {
    name: "Grail Chaser",
    score: (d, tags) =>
      Math.max(0, d.rarity_appreciation - 0.58) * 2 +
      Math.max(0, d.narrative_depth - 0.55) +
      (tags.has("grail-hunter") ? 1 : 0),
  },
  {
    name: "Japanese Specialist",
    score: (d, tags) =>
      Math.max(0, d.warm_cool - 0.52) * 1.5 +
      Math.max(0, d.community_social - 0.52) +
      (tags.has("japanese") ? 1.4 : 0),
  },
  {
    name: "Serial Collector",
    score: (d, tags) =>
      Math.max(0, d.narrative_depth - 0.52) +
      Math.max(0, d.community_social - 0.5) +
      (tags.has("consecutive-serials") ? 1.5 : 0),
  },
  {
    name: "Cool Minimalist",
    score: (d) =>
      Math.max(0, 0.52 - d.minimalist_ornate) * 1.8 +
      Math.max(0, d.warm_cool - 0.52) +
      Math.max(0, 0.52 - d.bold_subtle),
  },
  {
    name: "Bold Maximalist",
    score: (d) =>
      Math.max(0, d.minimalist_ornate - 0.55) * 1.8 +
      Math.max(0, d.bold_subtle - 0.55),
  },
  {
    name: "Community Curator",
    score: (d, tags) =>
      Math.max(0, d.community_social - 0.55) * 2 +
      (tags.has("pokemon") || tags.has("charizard") || tags.has("pikachu")
        ? 0.5
        : 0),
  },
];

function labelsFromTopLeans(
  dimensions: TasteDimensions,
): string[] {
  const leans: Array<{ label: string; strength: number }> = [
    {
      label: dimensions.vintage_modern < 0.45 ? "Vintage-leaning" : dimensions.vintage_modern > 0.58 ? "Modern-leaning" : "",
      strength: Math.abs(lean(dimensions, "vintage_modern")),
    },
    {
      label: dimensions.artistic_craft > 0.58 ? "Craft-focused" : "",
      strength: Math.abs(lean(dimensions, "artistic_craft")),
    },
    {
      label: dimensions.investment_mindset > 0.58 ? "Value-focused" : "",
      strength: Math.abs(lean(dimensions, "investment_mindset")),
    },
    {
      label: dimensions.rarity_appreciation > 0.58 ? "Rarity-driven" : "",
      strength: Math.abs(lean(dimensions, "rarity_appreciation")),
    },
    {
      label: dimensions.nostalgia > 0.58 ? "Nostalgia-driven" : "",
      strength: Math.abs(lean(dimensions, "nostalgia")),
    },
    {
      label: dimensions.warm_cool > 0.55 ? "Cool-toned" : dimensions.warm_cool < 0.45 ? "Warm-toned" : "",
      strength: Math.abs(lean(dimensions, "warm_cool")),
    },
  ].filter((l) => l.label && l.strength > 0.06);

  return leans
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((l) => l.label);
}

/**
 * Derive a distinctive archetype from taste dimensions + tags.
 * Avoids defaulting everyone to "Eclectic" when signals are subtle.
 */
export function deriveTasteArchetype(input: ArchetypeInput): string {
  const { dimensions, aestheticTags } = input;
  const tags = tagSet(aestheticTags);

  const ranked = ARCHETYPE_RULES.map((rule) => ({
    name: rule.name,
    score: rule.score(dimensions, tags),
  }))
    .filter((r) => r.score > 0.35)
    .sort((a, b) => b.score - a.score);

  if (ranked.length >= 2) {
    return `${ranked[0].name} · ${ranked[1].name}`;
  }

  if (ranked.length === 1) {
    const secondary = labelsFromTopLeans(dimensions)[0];
    return secondary && secondary !== ranked[0].name
      ? `${ranked[0].name} · ${secondary}`
      : ranked[0].name;
  }

  const fallback = labelsFromTopLeans(dimensions);
  if (fallback.length >= 2) {
    return `${fallback[0]} · ${fallback[1]}`;
  }
  if (fallback.length === 1) {
    return fallback[0];
  }

  return "Balanced Collector";
}