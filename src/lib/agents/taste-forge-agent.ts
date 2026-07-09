import { buildTasteForgeGraph } from "@/lib/agents/graph";
import {
  getCachedAnalysis,
  setCachedAnalysis,
} from "@/lib/analysis/cache";
import { buildCollectorFromWallet } from "@/lib/collector/build-from-wallet";
import { fetchWalletHoldings } from "@/lib/chain/wallet-holdings";
import { getRecommendationCatalog } from "@/lib/renaiss/catalog";
import { getConsecutivePairs, scorePairs } from "@/lib/renaiss/pairs";
import { analyzeHoldingsVision } from "@/lib/taste-vector/vision-taste";
import type {
  AnalyzeInput,
  CardRecommendation,
  CollectorData,
  ScoredCandidate,
  TasteForgeResult,
} from "@/lib/types";

export type AnalysisProgressStep =
  | "holdings"
  | "visionTaste"
  | "catalog"
  | "analyzeSignals"
  | "generateTasteVector"
  | "scoreCatalog"
  | "explainRecommendations"
  | "pairs"
  | "cached";

export interface AnalysisProgressEvent {
  step: AnalysisProgressStep;
  stepIndex: number;
  label: string;
}

export const ANALYSIS_PROGRESS_STEPS: AnalysisProgressEvent[] = [
  {
    step: "holdings",
    stepIndex: 0,
    label: "Scanning wallet & Renaiss holdings",
  },
  {
    step: "visionTaste",
    stepIndex: 1,
    label: "Analyzing card artwork (vision)",
  },
  { step: "catalog", stepIndex: 2, label: "Loading live marketplace catalog" },
  { step: "analyzeSignals", stepIndex: 3, label: "Analyzing taste signals" },
  { step: "generateTasteVector", stepIndex: 4, label: "Building taste vector" },
  { step: "scoreCatalog", stepIndex: 5, label: "Scoring live listings" },
  {
    step: "explainRecommendations",
    stepIndex: 6,
    label: "Writing card explanations",
  },
  { step: "pairs", stepIndex: 7, label: "Matching consecutive pairs" },
];

const GRAPH_STEP_INDEX: Record<string, number> = {
  analyzeSignals: 3,
  generateTasteVector: 4,
  scoreCatalog: 5,
  explainRecommendations: 6,
};

let compiledGraph: ReturnType<typeof buildTasteForgeGraph> | null = null;

function getGraph() {
  if (!compiledGraph) {
    compiledGraph = buildTasteForgeGraph();
  }
  return compiledGraph;
}

function mapExplained(
  candidates: ScoredCandidate[],
  explained: CardRecommendation[],
): CardRecommendation[] {
  const map = new Map(explained.map((r) => [r.card.id, r]));
  return candidates
    .map((c) => map.get(c.card.id))
    .filter((r): r is CardRecommendation => Boolean(r));
}

function emitProgress(
  onProgress: AnalysisRunOptions["onProgress"],
  step: AnalysisProgressStep,
) {
  const meta = ANALYSIS_PROGRESS_STEPS.find((s) => s.step === step);
  if (meta) onProgress?.(meta);
}

async function resolveCollectorData(
  input: AnalyzeInput,
): Promise<{ data: CollectorData; walletAddress: string }> {
  if (!input.walletAddress) {
    throw new Error("walletAddress is required for analysis");
  }

  const holdings = await fetchWalletHoldings(
    input.walletAddress,
    input.socialText,
  );
  const data = buildCollectorFromWallet(
    holdings,
    input.socialText,
    input.xHandle,
    input.tasteQuiz,
  );
  return { data, walletAddress: holdings.address };
}

export interface AnalysisRunOptions {
  onProgress?: (event: AnalysisProgressEvent) => void;
  skipCache?: boolean;
}

export async function runTasteForgeAgent(
  input: AnalyzeInput,
  options?: AnalysisRunOptions,
): Promise<TasteForgeResult> {
  if (!options?.skipCache) {
    const cached = getCachedAnalysis(input);
    if (cached) {
      options?.onProgress?.({
        step: "cached",
        stepIndex: 8,
        label: "Loaded cached analysis",
      });
      return cached;
    }
  }

  const analyzedAt = new Date().toISOString();

  emitProgress(options?.onProgress, "holdings");
  const { data: collectorData, walletAddress } =
    await resolveCollectorData(input);

  emitProgress(options?.onProgress, "visionTaste");
  const visionAnalysis = await analyzeHoldingsVision(
    collectorData.collection,
  );
  if (visionAnalysis) {
    collectorData.visionAnalysis = visionAnalysis;
  }

  emitProgress(options?.onProgress, "catalog");
  const { catalog, source: catalogSource } = await getRecommendationCatalog({
    fresh: true,
  });

  const graph = getGraph();
  const initialState = {
    collectorId: collectorData.profile.id,
    collectorData,
    catalog,
    signalAnalysis: "",
    tasteVector: null,
    scoredCandidates: [],
    bestValueCandidates: [],
    recommendations: [],
    processingMode: "deterministic" as const,
    error: null,
  };

  let result = { ...initialState };

  const stream = await graph.stream(initialState, { streamMode: "updates" });
  for await (const chunk of stream) {
    for (const [nodeName, update] of Object.entries(chunk)) {
      if (GRAPH_STEP_INDEX[nodeName] != null) {
        const step = ANALYSIS_PROGRESS_STEPS.find(
          (s) => s.stepIndex === GRAPH_STEP_INDEX[nodeName],
        );
        if (step) options?.onProgress?.(step);
      }
      result = {
        ...result,
        ...(update as Partial<typeof result>),
      };
    }
  }

  if (!result.tasteVector) {
    throw new Error(result.error ?? "Failed to generate taste vector");
  }

  const bestOverall = mapExplained(
    result.scoredCandidates,
    result.recommendations,
  );
  const bestValue = mapExplained(
    result.bestValueCandidates ?? [],
    result.recommendations,
  );

  emitProgress(options?.onProgress, "pairs");
  const { pairs: rawPairs, source: pairSource } = await getConsecutivePairs({
    fresh: true,
  });
  const consecutivePairs =
    pairSource === "live" && rawPairs.length > 0
      ? scorePairs(rawPairs, result.tasteVector)
      : [];

  if (bestOverall.length === 0 && bestValue.length === 0) {
    throw new Error(
      "Analysis completed but no recommendations matched the live catalog. Try adding social taste signals.",
    );
  }

  const payload: TasteForgeResult = {
    tasteVector: result.tasteVector,
    collectorData,
    bestOverall,
    bestValue,
    consecutivePairs,
    recommendations: bestOverall,
    catalogSize: catalog.length,
    processingMode: result.processingMode,
    walletAddress,
    collectorMode: collectorData.collectorMode ?? "non-holder",
    catalogSource,
    pairSource,
    analyzedAt,
  };

  setCachedAnalysis(input, payload);
  return payload;
}