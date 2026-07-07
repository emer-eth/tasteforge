import type { TasteDimensions, TasteVector } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/taste-vector/dimensions";

interface TasteVectorDisplayProps {
  tasteVector: TasteVector;
  processingMode: "llm" | "deterministic";
}

export function TasteVectorDisplay({
  tasteVector,
  processingMode,
}: TasteVectorDisplayProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Taste Vector
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {(tasteVector.confidence * 100).toFixed(0)}% confidence
          </p>
          {tasteVector.tasteArchetype && (
            <p className="mt-1 text-xs font-medium text-amber-400/80">
              {tasteVector.tasteArchetype}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ${
            processingMode === "llm"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-zinc-700 bg-zinc-800 text-zinc-400"
          }`}
        >
          {processingMode === "llm" ? "LLM-powered" : "Deterministic demo"}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-200">
        {tasteVector.summary}
      </p>

      <p className="mb-3 text-xs italic text-zinc-500">
        {tasteVector.signalAnalysis}
      </p>

      <div className="mb-4 space-y-3">
        {(Object.keys(DIMENSION_LABELS) as (keyof TasteDimensions)[]).map(
          (key) => {
            const [left, right] = DIMENSION_LABELS[key];
            const value = tasteVector.dimensions[key];
            return (
              <div key={key}>
                <div className="mb-1 flex justify-between text-[10px] text-zinc-500">
                  <span>{left}</span>
                  <span>{right}</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500/80 to-rose-500/80"
                    style={{ width: `${value * 100}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/60"
                    style={{ left: `${value * 100}%` }}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Aesthetic Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tasteVector.aestheticTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Palette
          </p>
          <div className="flex gap-1">
            {tasteVector.colorPalette.map((color) => (
              <div
                key={color}
                className="h-6 w-6 rounded-md border border-zinc-700"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}