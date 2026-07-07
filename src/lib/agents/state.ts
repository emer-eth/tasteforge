import { Annotation } from "@langchain/langgraph";
import type { AgentState } from "@/lib/types";

export const TasteForgeAnnotation = Annotation.Root({
  collectorId: Annotation<string>,
  collectorData: Annotation<AgentState["collectorData"]>,
  catalog: Annotation<AgentState["catalog"]>,
  signalAnalysis: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  tasteVector: Annotation<AgentState["tasteVector"]>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  scoredCandidates: Annotation<AgentState["scoredCandidates"]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  recommendations: Annotation<AgentState["recommendations"]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  processingMode: Annotation<AgentState["processingMode"]>({
    reducer: (_, next) => next,
    default: () => "deterministic" as const,
  }),
  error: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
});

export type TasteForgeState = typeof TasteForgeAnnotation.State;