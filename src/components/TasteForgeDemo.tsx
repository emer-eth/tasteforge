"use client";

import { useCallback, useState } from "react";
import { CollectorSelector } from "@/components/CollectorSelector";
import { CollectorProfile } from "@/components/CollectorProfile";
import { TasteVectorDisplay } from "@/components/TasteVectorDisplay";
import { RecommendationGrid } from "@/components/RecommendationGrid";
import { AgentProgress, AGENT_STEPS } from "@/components/AgentProgress";
import { MOCK_COLLECTORS } from "@/lib/data/mock-renaiss";
import type { TasteForgeResult } from "@/lib/types";

const STEP_INTERVAL_MS = 600;

export function TasteForgeDemo() {
  const [collectorId, setCollectorId] = useState(MOCK_COLLECTORS[0].profile.id);
  const [result, setResult] = useState<TasteForgeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const collector =
    MOCK_COLLECTORS.find((c) => c.profile.id === collectorId) ??
    MOCK_COLLECTORS[0];

  const runAgent = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setActiveStep(0);

    const stepTimer = setInterval(() => {
      setActiveStep((prev) =>
        prev < AGENT_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, STEP_INTERVAL_MS);

    try {
      const response = await fetch(
        `/api/recommendations?collectorId=${collectorId}`,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }
      const data: TasteForgeResult = await response.json();
      setResult(data);
      setActiveStep(AGENT_STEPS.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent failed");
    } finally {
      clearInterval(stepTimer);
      setIsRunning(false);
    }
  }, [collectorId]);

  const handleCollectorChange = (id: string) => {
    setCollectorId(id);
    setResult(null);
    setError(null);
    setActiveStep(0);
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Select Collector
        </p>
        <CollectorSelector
          collectors={MOCK_COLLECTORS}
          selectedId={collectorId}
          onSelect={handleCollectorChange}
          disabled={isRunning}
        />
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Your taste, decoded.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Run the LangGraph agent to analyze collector signals and surface
            high-resonance Renaiss card recommendations.
          </p>
        </div>
        <button
          type="button"
          onClick={runAgent}
          disabled={isRunning}
          className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running agent..." : "Generate Taste Vector"}
        </button>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {isRunning && (
        <AgentProgress activeStep={activeStep} isRunning={isRunning} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <CollectorProfile data={collector} />
        {result ? (
          <TasteVectorDisplay
            tasteVector={result.tasteVector}
            processingMode={result.processingMode}
          />
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                No Taste Vector yet
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Select a collector and click Generate to run the agent
              </p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <>
          {result.tasteVector.tasteArchetype && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-500/70">
                Taste Archetype
              </p>
              <p className="mt-1 text-lg font-semibold text-amber-200">
                {result.tasteVector.tasteArchetype}
              </p>
            </div>
          )}
          <RecommendationGrid recommendations={result.recommendations} />
        </>
      )}

      <footer className="border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
        TasteForge MVP · Renaiss Hackathon 2026 ·{" "}
        {result?.catalogSize ?? 10} cards in catalog ·{" "}
        <code className="text-zinc-500">/api/recommendations</code>
      </footer>
    </div>
  );
}