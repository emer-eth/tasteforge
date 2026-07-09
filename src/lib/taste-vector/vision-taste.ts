import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createChatModel, isLLMAvailable } from "@/lib/llm/client";
import type {
  RenaissCard,
  TasteDimensions,
  VisionTasteAnalysis,
} from "@/lib/types";

export type { VisionTasteAnalysis };

const VISION_MODEL =
  process.env.BLINK_VISION_MODEL ??
  process.env.BLINK_MODEL ??
  "google/gemini-2.5-flash";

const VISION_SYSTEM = `You are TasteForge's visual taste analyst for premium collectible cards (Pokémon, sports, etc.).
Analyze card artwork pixels — not just titles. Return ONLY valid JSON, no markdown.`;

const VISION_USER_PREFIX = `Analyze these held collectible card images as ONE collector's visual taste profile.

Return JSON:
{
  "summary": "1-2 sentences on shared visual taste across these cards",
  "dimensions": {
    "vintage_modern": 0-1,
    "minimalist_ornate": 0-1,
    "bold_subtle": 0-1,
    "warm_cool": 0-1,
    "rarity_appreciation": 0-1,
    "narrative_depth": 0-1,
    "artistic_craft": 0-1,
    "nostalgia": 0-1,
    "community_social": 0-1,
    "investment_mindset": 0-1
  },
  "aestheticTags": ["tag1", "tag2"],
  "emotionalTags": ["emotion1"],
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "confidence": 0-1
}

Cards in this batch:
`;

export function selectCardsForVision(
  collection: RenaissCard[],
  max = 3,
): RenaissCard[] {
  const withImages = collection.filter(
    (c) => c.imageUrl?.startsWith("http"),
  );
  if (withImages.length === 0) return [];

  const picked: RenaissCard[] = [];
  const seenSeries = new Set<string>();

  for (const card of withImages) {
    if (picked.length >= max) break;
    if (!seenSeries.has(card.series) || picked.length < max) {
      picked.push(card);
      seenSeries.add(card.series);
    }
  }

  while (picked.length < max && picked.length < withImages.length) {
    const next = withImages.find((c) => !picked.includes(c));
    if (!next) break;
    picked.push(next);
  }

  return picked.slice(0, max);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function parseVisionJson(
  raw: string,
  cards: RenaissCard[],
): VisionTasteAnalysis | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      summary?: string;
      dimensions?: Partial<TasteDimensions>;
      aestheticTags?: string[];
      emotionalTags?: string[];
      colorPalette?: string[];
      confidence?: number;
    };

    const dims = parsed.dimensions ?? {};
    const normalizedDims: Partial<TasteDimensions> = {};
    for (const [key, val] of Object.entries(dims)) {
      if (typeof val === "number") {
        normalizedDims[key as keyof TasteDimensions] = clamp01(val);
      }
    }

    const weight = clamp01(parsed.confidence ?? 0.75);

    return {
      analyzedCards: cards.map((c) => ({
        title: c.title,
        tokenId: c.tokenId,
        imageUrl: c.imageUrl,
      })),
      summary: parsed.summary ?? "Visual taste derived from held card artwork.",
      dimensions: normalizedDims,
      aestheticTags: (parsed.aestheticTags ?? []).slice(0, 10),
      emotionalTags: (parsed.emotionalTags ?? []).slice(0, 6),
      colorPalette: (parsed.colorPalette ?? []).slice(0, 6),
      weight,
    };
  } catch {
    return null;
  }
}

export async function analyzeHoldingsVision(
  collection: RenaissCard[],
): Promise<VisionTasteAnalysis | null> {
  if (!isLLMAvailable()) return null;

  const cards = selectCardsForVision(collection);
  if (cards.length === 0) return null;

  const cardList = cards
    .map((c, i) => `${i + 1}. ${c.title} (${c.series})`)
    .join("\n");

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    { type: "text", text: `${VISION_USER_PREFIX}${cardList}` },
    ...cards.map((c) => ({
      type: "image_url" as const,
      image_url: { url: c.imageUrl },
    })),
  ];

  try {
    const model = createChatModel({
      temperature: 0.2,
      model: VISION_MODEL,
    });

    const response = await model.invoke([
      new SystemMessage(VISION_SYSTEM),
      new HumanMessage({ content }),
    ]);

    const text =
      typeof response.content === "string"
        ? response.content
        : Array.isArray(response.content)
          ? response.content
              .map((part) =>
                typeof part === "string"
                  ? part
                  : "text" in part
                    ? String(part.text)
                    : "",
              )
              .join("")
          : JSON.stringify(response.content);

    return parseVisionJson(text, cards);
  } catch {
    return null;
  }
}