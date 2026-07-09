import type { TasteDimensions } from "@/lib/types";

export interface ParsedSocialSignals {
  dimensions: Partial<TasteDimensions>;
  aestheticTags: string[];
  emotionalTags: string[];
  subjectAffinities: Record<string, number>;
  weight: number;
}

const DIMENSION_DEFAULTS: TasteDimensions = {
  vintage_modern: 0.5,
  minimalist_ornate: 0.5,
  bold_subtle: 0.5,
  warm_cool: 0.5,
  rarity_appreciation: 0.5,
  narrative_depth: 0.5,
  artistic_craft: 0.5,
  nostalgia: 0.5,
  community_social: 0.5,
  investment_mindset: 0.5,
};

const KEYWORD_RULES: Array<{
  pattern: RegExp;
  dimensions?: Partial<TasteDimensions>;
  tags?: string[];
  emotions?: string[];
  subjects?: Record<string, number>;
}> = [
  {
    pattern: /\b(vintage|retro|old.?school|classic|1999|base set)\b/i,
    dimensions: { vintage_modern: 0.15, nostalgia: 0.85 },
    tags: ["vintage"],
    emotions: ["nostalgia"],
  },
  {
    pattern: /\b(modern|contemporary|new|scarlet|violet|202[0-9])\b/i,
    dimensions: { vintage_modern: 0.85, nostalgia: 0.25 },
    tags: ["modern"],
  },
  {
    pattern: /\b(japanese|japan|jp)\b/i,
    dimensions: { warm_cool: 0.6, community_social: 0.65 },
    tags: ["japanese"],
  },
  {
    pattern: /\b(psa\s*10|gem\s*mint|bgs\s*10|perfect\s*grade)\b/i,
    dimensions: { artistic_craft: 0.9, rarity_appreciation: 0.8 },
    tags: ["gem-mint", "psa-10"],
    emotions: ["pride", "precision"],
  },
  {
    pattern: /\b(psa\s*9|mint\s*9)\b/i,
    dimensions: { artistic_craft: 0.7, rarity_appreciation: 0.6 },
    tags: ["high-grade"],
  },
  {
    pattern: /\b(bargain|deal|undervalued|under\s*fmv|steal|flip)\b/i,
    dimensions: { investment_mindset: 0.85 },
    tags: ["value-hunter"],
    emotions: ["excitement"],
  },
  {
    pattern: /\b(grail|chase|rare|legendary|1\/1)\b/i,
    dimensions: { rarity_appreciation: 0.9, narrative_depth: 0.7 },
    tags: ["grail-hunter"],
  },
  {
    pattern: /\b(minimal|clean|simple)\b/i,
    dimensions: { minimalist_ornate: 0.2 },
    tags: ["minimal"],
  },
  {
    pattern: /\b(ornate|full\s*art|illustration|artistic)\b/i,
    dimensions: { minimalist_ornate: 0.85, artistic_craft: 0.85 },
    tags: ["full-art"],
    emotions: ["awe"],
  },
  {
    pattern: /\b(charizard|リザードン)\b/i,
    subjects: { charizard: 0.95 },
    tags: ["charizard"],
  },
  {
    pattern: /\b(pikachu|ピカチュウ)\b/i,
    subjects: { pikachu: 0.9 },
    tags: ["pikachu"],
  },
  {
    pattern: /\b(pokemon|pokémon)\b/i,
    subjects: { pokemon: 0.85 },
    tags: ["pokemon"],
  },
  {
    pattern: /\b(consecutive|serial|pair|连号)\b/i,
    tags: ["consecutive-serials"],
    dimensions: { narrative_depth: 0.7, community_social: 0.6 },
  },
  {
    pattern: /\b(collect|collection|collector)\b/i,
    dimensions: { community_social: 0.65 },
    emotions: ["collecting"],
  },
  {
    pattern: /\b(invest|roi|fmv|floor)\b/i,
    dimensions: { investment_mindset: 0.8 },
    tags: ["market-aware"],
  },
  {
    pattern: /\b(personal collection|passion collector)\b/i,
    dimensions: { nostalgia: 0.75, community_social: 0.55 },
    tags: ["enthusiast"],
    emotions: ["joy"],
  },
  {
    pattern: /\b(display collector|community)\b/i,
    dimensions: { community_social: 0.8, narrative_depth: 0.6 },
    tags: ["community"],
  },
  {
    pattern: /\b(balanced collector|flexible collector|open minded)\b/i,
    dimensions: { bold_subtle: 0.5, vintage_modern: 0.5 },
    tags: ["eclectic"],
  },
  {
    pattern: /\b(single gem collector)\b/i,
    dimensions: { artistic_craft: 0.8, rarity_appreciation: 0.7 },
    tags: ["gem-focused"],
  },
];

export function parseSocialTasteSignals(
  signals: string[] | undefined,
): ParsedSocialSignals {
  if (!signals?.length) {
    return {
      dimensions: {},
      aestheticTags: [],
      emotionalTags: [],
      subjectAffinities: {},
      weight: 0,
    };
  }

  const text = signals.join(" ").toLowerCase();
  const dimSums = { ...DIMENSION_DEFAULTS };
  const dimCounts: Partial<Record<keyof TasteDimensions, number>> = {};
  const tags = new Set<string>();
  const emotions = new Set<string>();
  const subjects: Record<string, number> = {};
  let matchCount = 0;

  for (const rule of KEYWORD_RULES) {
    if (!rule.pattern.test(text)) continue;
    matchCount++;

    if (rule.dimensions) {
      for (const [key, value] of Object.entries(rule.dimensions) as [
        keyof TasteDimensions,
        number,
      ][]) {
        dimSums[key] = (dimSums[key] ?? 0.5) + value;
        dimCounts[key] = (dimCounts[key] ?? 0) + 1;
      }
    }
    rule.tags?.forEach((t) => tags.add(t));
    rule.emotions?.forEach((e) => emotions.add(e));
    if (rule.subjects) {
      for (const [subj, score] of Object.entries(rule.subjects)) {
        subjects[subj] = Math.max(subjects[subj] ?? 0, score);
      }
    }
  }

  // Free-form tokens as tags (words 4+ chars)
  for (const token of text.split(/[\s,./]+/).filter((w) => w.length >= 4)) {
    if (!/^(that|with|from|love|like|want|only|have)$/.test(token)) {
      tags.add(token);
    }
  }

  const dimensions: Partial<TasteDimensions> = {};
  for (const key of Object.keys(DIMENSION_DEFAULTS) as (keyof TasteDimensions)[]) {
    if (dimCounts[key]) {
      dimensions[key] = dimSums[key] / (dimCounts[key]! + 1);
    }
  }

  const weight = Math.min(1, 0.35 + matchCount * 0.15 + signals.length * 0.05);

  return {
    dimensions,
    aestheticTags: [...tags].slice(0, 10),
    emotionalTags: [...emotions].slice(0, 6),
    subjectAffinities: subjects,
    weight,
  };
}

export function mergeDimensions(
  base: TasteDimensions,
  partial: Partial<TasteDimensions>,
  blend = 0.6,
): TasteDimensions {
  const result = { ...base };
  for (const [key, value] of Object.entries(partial) as [
    keyof TasteDimensions,
    number,
  ][]) {
    result[key] = base[key] * (1 - blend) + value * blend;
  }
  return result;
}