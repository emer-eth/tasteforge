import { buildTasteForgeGraph } from "@/lib/agents/graph";
import {
  MOCK_CATALOG,
  MOCK_COLLECTOR,
  getCollectorData,
} from "@/lib/data/mock-renaiss";
import type { TasteForgeResult } from "@/lib/types";

let compiledGraph: ReturnType<typeof buildTasteForgeGraph> | null = null;

function getGraph() {
  if (!compiledGraph) {
    compiledGraph = buildTasteForgeGraph();
  }
  return compiledGraph;
}

export async function runTasteForgeAgent(
  collectorId: string = MOCK_COLLECTOR.profile.id,
): Promise<TasteForgeResult> {
  const collectorData = getCollectorData(collectorId);
  if (!collectorData) {
    throw new Error(`Collector not found: ${collectorId}`);
  }

  const graph = getGraph();
  const result = await graph.invoke({
    collectorId,
    collectorData,
    catalog: MOCK_CATALOG,
    signalAnalysis: "",
    tasteVector: null,
    scoredCandidates: [],
    recommendations: [],
    processingMode: "deterministic",
    error: null,
  });

  if (!result.tasteVector) {
    throw new Error(result.error ?? "Failed to generate taste vector");
  }

  return {
    tasteVector: result.tasteVector,
    recommendations: result.recommendations,
    catalogSize: MOCK_CATALOG.length,
    processingMode: result.processingMode,
  };
}