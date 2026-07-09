import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { TasteForgeAnnotation, type TasteForgeState } from "@/lib/agents/state";
import { createChatModel, isLLMAvailable } from "@/lib/llm/client";
import {
  generateTasteVectorDeterministic,
  parseLLMTasteVector,
} from "@/lib/taste-vector/generator";
import { rankByOverall, rankByValue } from "@/lib/taste-vector/scorer";
import type { ScoredCandidate } from "@/lib/types";
import {
  TASTE_VECTOR_SYSTEM_PROMPT,
  SIGNAL_ANALYSIS_PROMPT,
  TASTE_VECTOR_USER_PROMPT,
  BATCH_RECOMMENDATION_EXPLAIN_PROMPT,
  formatPrompt,
} from "@/lib/taste-vector/prompts";
import type { CardRecommendation } from "@/lib/types";

async function analyzeSignals(
  state: TasteForgeState,
): Promise<Partial<TasteForgeState>> {
  if (!isLLMAvailable()) {
    const deterministic = generateTasteVectorDeterministic(state.collectorData);
    return {
      signalAnalysis: deterministic.signalAnalysis,
      processingMode: "deterministic",
    };
  }

  const { profile, collection, interactions, socialSignals } =
    state.collectorData;

  const model = createChatModel({ temperature: 0.4 });
  const response = await model.invoke([
    new SystemMessage(TASTE_VECTOR_SYSTEM_PROMPT),
    new HumanMessage(
      `${SIGNAL_ANALYSIS_PROMPT}\n\n` +
        `Profile: ${JSON.stringify(profile, null, 2)}\n\n` +
        `Social Signals: ${JSON.stringify(socialSignals ?? profile.statedPreferences)}\n\n` +
        `Owned: ${JSON.stringify(collection.map((c) => ({ title: c.title, tags: c.aestheticTags, artist: c.artist })))}\n\n` +
        `Interactions: ${JSON.stringify(interactions)}`,
    ),
  ]);

  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  return { signalAnalysis: content, processingMode: "llm" };
}

async function generateTasteVector(
  state: TasteForgeState,
): Promise<Partial<TasteForgeState>> {
  if (!isLLMAvailable()) {
    return {
      tasteVector: generateTasteVectorDeterministic(state.collectorData),
      processingMode: "deterministic",
    };
  }

  const { profile, collection, interactions, socialSignals } =
    state.collectorData;

  const model = createChatModel({ temperature: 0.2 });
  const userPrompt = formatPrompt(TASTE_VECTOR_USER_PROMPT, {
    profile: JSON.stringify(profile, null, 2),
    socialSignals: JSON.stringify(
      socialSignals ?? profile.statedPreferences ?? [],
      null,
      2,
    ),
    ownedCards: JSON.stringify(
      collection.map((c) => ({
        title: c.title,
        artist: c.artist,
        tags: c.aestheticTags,
        dimensions: c.dimensions,
        subject: c.subject,
      })),
      null,
      2,
    ),
    interactions: JSON.stringify(interactions, null, 2),
    signalAnalysis: state.signalAnalysis,
  });

  const response = await model.invoke([
    new SystemMessage(TASTE_VECTOR_SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const parsed = parseLLMTasteVector(
    content,
    state.collectorId,
    state.signalAnalysis,
  );

  if (parsed) {
    return { tasteVector: parsed, processingMode: "llm" };
  }

  return {
    tasteVector: generateTasteVectorDeterministic(state.collectorData),
    processingMode: "deterministic",
    error: "LLM parse failed — used deterministic fallback",
  };
}

async function scoreCatalog(
  state: TasteForgeState,
): Promise<Partial<TasteForgeState>> {
  if (!state.tasteVector) {
    return { error: "No taste vector generated" };
  }

  const ownedIds = new Set(
    state.collectorData.collection.map((c) => c.id),
  );

  return {
    scoredCandidates: rankByOverall(
      state.catalog,
      state.tasteVector,
      ownedIds,
      5,
    ),
    bestValueCandidates: rankByValue(
      state.catalog,
      state.tasteVector,
      ownedIds,
      5,
    ),
  };
}

function uniqueCandidates(
  overall: ScoredCandidate[],
  value: ScoredCandidate[],
): ScoredCandidate[] {
  const seen = new Set<string>();
  const merged: ScoredCandidate[] = [];
  for (const c of [...overall, ...value]) {
    if (!seen.has(c.card.id)) {
      seen.add(c.card.id);
      merged.push(c);
    }
  }
  return merged;
}

function toRecommendation(
  scored: ScoredCandidate,
  taste: NonNullable<TasteForgeState["tasteVector"]>,
  ownedIds: Set<string>,
  explained?: { explanation: string; whyNow: string },
): CardRecommendation {
  return {
    card: scored.card,
    resonanceScore: scored.resonanceScore,
    valueScore: scored.valueScore,
    overallScore: scored.overallScore,
    dimensionAlignment: scored.alignment,
    matchingTags: scored.matchingTags,
    valueInsight: scored.valueInsight,
    explanation:
      explained?.explanation ??
      buildDeterministicExplanation(
        scored.card.title,
        scored.matchingTags,
        scored.resonanceScore,
        taste,
      ),
    whyNow:
      explained?.whyNow ?? buildWhyNow(scored.card, ownedIds, taste),
  };
}

async function explainRecommendations(
  state: TasteForgeState,
): Promise<Partial<TasteForgeState>> {
  if (!state.tasteVector || state.scoredCandidates.length === 0) {
    return { recommendations: [] };
  }

  const ownedIds = new Set(
    state.collectorData.collection.map((c) => c.id),
  );

  const toExplain = uniqueCandidates(
    state.scoredCandidates,
    state.bestValueCandidates ?? [],
  );

  if (!isLLMAvailable()) {
    return {
      recommendations: toExplain.map((scored) =>
        toRecommendation(scored, state.tasteVector!, ownedIds),
      ),
    };
  }

  const model = createChatModel({ temperature: 0.5 });

  const cardsPayload = toExplain.map((scored) => ({
    cardId: scored.card.id,
    title: scored.card.title,
    artist: scored.card.artist,
    series: scored.card.series,
    tags: scored.card.aestheticTags,
    subject: scored.card.subject,
    rarity: scored.card.rarity,
    floorPrice: scored.card.floorPrice,
    fmv: scored.card.fmv,
    resonanceScore: (scored.resonanceScore * 100).toFixed(1) + "%",
    valueScore: (scored.valueScore * 100).toFixed(1) + "%",
    valueInsight: scored.valueInsight,
    matchingTags: scored.matchingTags,
  }));

  const prompt =
    `${BATCH_RECOMMENDATION_EXPLAIN_PROMPT}\n\n` +
    `Taste Vector: ${JSON.stringify(state.tasteVector, null, 2)}\n\n` +
    `Cards:\n${JSON.stringify(cardsPayload, null, 2)}`;

  try {
    const response = await model.invoke([
      new SystemMessage(TASTE_VECTOR_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      recommendations: Array<{
        cardId: string;
        explanation: string;
        whyNow: string;
      }>;
    };

    const explanationMap = new Map(
      parsed.recommendations.map((r) => [r.cardId, r]),
    );

    return {
      recommendations: toExplain.map((scored) =>
        toRecommendation(
          scored,
          state.tasteVector!,
          ownedIds,
          explanationMap.get(scored.card.id),
        ),
      ),
    };
  } catch {
    return {
      recommendations: toExplain.map((scored) =>
        toRecommendation(scored, state.tasteVector!, ownedIds),
      ),
    };
  }
}

function buildDeterministicExplanation(
  title: string,
  matchingTags: string[],
  resonanceScore: number,
  taste: NonNullable<TasteForgeState["tasteVector"]>,
): string {
  const tagStr =
    matchingTags.length > 0
      ? matchingTags.join(", ")
      : taste.aestheticTags.slice(0, 2).join(", ");

  return (
    `"${title}" aligns with your taste at ${(resonanceScore * 100).toFixed(0)}% resonance — ` +
    `sharing your affinity for ${tagStr}. ` +
    `It mirrors your preference for ${taste.dimensions.minimalist_ornate < 0.4 ? "clean, minimal" : "rich, detailed"} ` +
    `compositions and ${taste.dimensions.warm_cool > 0.5 ? "cool-toned" : "warm-toned"} palettes.`
  );
}

function buildWhyNow(
  card: TasteForgeState["scoredCandidates"][0]["card"],
  ownedIds: Set<string>,
  taste: NonNullable<TasteForgeState["tasteVector"]>,
): string {
  if (card.editionSize < 100) {
    return `Only ${card.editionSize} editions exist — scarcity matches your ${taste.dimensions.rarity_appreciation > 0.5 ? "grail-hunter" : "curator"} instincts.`;
  }
  if (ownedIds.size > 0) {
    return `Complements your ${ownedIds.size} held card${ownedIds.size === 1 ? "" : "s"} — ${card.series} fits your live collection profile.`;
  }
  return `Listed at $${card.floorPrice} on Renaiss (FMV $${card.fmv}) — strong marketplace entry for your taste profile.`;
}

export function buildTasteForgeGraph() {
  const graph = new StateGraph(TasteForgeAnnotation)
    .addNode("analyzeSignals", analyzeSignals)
    .addNode("generateTasteVector", generateTasteVector)
    .addNode("scoreCatalog", scoreCatalog)
    .addNode("explainRecommendations", explainRecommendations)
    .addEdge(START, "analyzeSignals")
    .addEdge("analyzeSignals", "generateTasteVector")
    .addEdge("generateTasteVector", "scoreCatalog")
    .addEdge("scoreCatalog", "explainRecommendations")
    .addEdge("explainRecommendations", END);

  return graph.compile();
}