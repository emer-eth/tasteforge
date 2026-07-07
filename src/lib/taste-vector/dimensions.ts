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

export function deriveTasteArchetype(dimensions: TasteDimensions): string {
  const traits: string[] = [];

  if (dimensions.minimalist_ornate < 0.35) traits.push("Minimalist");
  else if (dimensions.minimalist_ornate > 0.65) traits.push("Ornate");

  if (dimensions.warm_cool > 0.6) traits.push("Cool-toned");
  else if (dimensions.warm_cool < 0.4) traits.push("Warm-toned");

  if (dimensions.rarity_appreciation > 0.65) traits.push("Grail Hunter");
  if (dimensions.nostalgia > 0.7) traits.push("Nostalgic");
  if (dimensions.community_social > 0.65) traits.push("Culture-driven");
  if (dimensions.artistic_craft > 0.7) traits.push("Craft-first");
  if (dimensions.vintage_modern < 0.3) traits.push("Vintage");
  else if (dimensions.vintage_modern > 0.7) traits.push("Contemporary");

  if (traits.length === 0) traits.push("Eclectic");
  return traits.slice(0, 3).join(" · ");
}