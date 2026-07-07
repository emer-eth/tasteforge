import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { TasteForgeAnnotation, type TasteForgeState } from "@/lib/agents/state";
import { createChatModel, isLLMAvailable } from "@/lib/llm/client";
import {
  generateTasteVectorDeterministic,
  parseLLMTasteVector,
} from "@/lib/taste-vector/generator";
import { rankRecommendations } from "@/lib/taste-vector/scorer";
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

  const { profile, collection, interactions } = state.collectorData;

  const model = createChatModel({ temperature: 0.4 });
  const response = await model.invoke([
    new SystemMessage(TASTE_VECTOR_SYSTEM_PROMPT),
    new HumanMessage(
      `${SIGNAL_ANALYSIS_PROMPT}\n\n` +
        `Profile: ${JSON.stringify(profile, null, 2)}\n\n` +
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

  const { profile, collection, interactions } = state.collectorData;

  const model = createChatModel({ temperature: 0.2 });
  const userPrompt = formatPrompt(TASTE_VECTOR_USER_PROMPT, {
    profile: JSON.stringify(profile, null, 2),
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

  const scored = rankRecommendations(
    state.catalog,
    state.tasteVector,
    ownedIds,
    5,
  );

  return { scoredCandidates: scored };
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

  if (!isLLMAvailable()) {
    const recommendations: CardRecommendation[] = state.scoredCandidates.map(
      (scored) => ({
        card: scored.card,
        resonanceScore: scored.score,
        dimensionAlignment: scored.alignment,
        matchingTags: scored.matchingTags,
        explanation: buildDeterministicExplanation(
          scored.card.title,
          scored.matchingTags,
          scored.score,
          state.tasteVector!,
        ),
        whyNow: buildWhyNow(scored.card, ownedIds, state.tasteVector!),
      }),
    );
    return { recommendations };
  }

  const model = createChatModel({ temperature: 0.5 });

  const cardsPayload = state.scoredCandidates.map((scored) => ({
    cardId: scored.card.id,
    title: scored.card.title,
    artist: scored.card.artist,
    series: scored.card.series,
    tags: scored.card.aestheticTags,
    subject: scored.card.subject,
    rarity: scored.card.rarity,
    resonanceScore: (scored.score * 100).toFixed(1) + "%",
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

    const recommendations: CardRecommendation[] = state.scoredCandidates.map(
      (scored) => {
        const explained = explanationMap.get(scored.card.id);
        return {
          card: scored.card,
          resonanceScore: scored.score,
          dimensionAlignment: scored.alignment,
          matchingTags: scored.matchingTags,
          explanation:
            explained?.explanation ??
            buildDeterministicExplanation(
              scored.card.title,
              scored.matchingTags,
              scored.score,
              state.tasteVector!,
            ),
          whyNow:
            explained?.whyNow ??
            buildWhyNow(scored.card, ownedIds, state.tasteVector!),
        };
      },
    );

    return { recommendations };
  } catch {
    const recommendations: CardRecommendation[] = state.scoredCandidates.map(
      (scored) => ({
        card: scored.card,
        resonanceScore: scored.score,
        dimensionAlignment: scored.alignment,
        matchingTags: scored.matchingTags,
        explanation: buildDeterministicExplanation(
          scored.card.title,
          scored.matchingTags,
          scored.score,
          state.tasteVector!,
        ),
        whyNow: buildWhyNow(scored.card, ownedIds, state.tasteVector!),
      }),
    );
    return { recommendations };
  }
}

function buildDeterministicExplanation(
  title: string,
  matchingTags: string[],
  score: number,
  taste: NonNullable<TasteForgeState["tasteVector"]>,
): string {
  const tagStr =
    matchingTags.length > 0
      ? matchingTags.join(", ")
      : taste.aestheticTags.slice(0, 2).join(", ");

  return (
    `"${title}" aligns with your taste at ${(score * 100).toFixed(0)}% resonance — ` +
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
  const sameArtistOwned = [...ownedIds].some((id) => id.startsWith("rn-"));
  if (card.editionSize < 100) {
    return `Only ${card.editionSize} editions exist — scarcity matches your ${taste.dimensions.rarity_appreciation > 0.5 ? "grail-hunter" : "curator"} instincts.`;
  }
  if (sameArtistOwned) {
    return `Completes a series thread in your collection — acquiring now builds a coherent artist narrative.`;
  }
  return `Floor at $${card.floorPrice} with rising interest in ${card.series} — a strong entry before the series matures.`;
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