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
    <section className="panel panel-teal p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-label text-zinc-500">Taste Vector</p>
          <p className="mt-1 text-sm text-zinc-400">
            {(tasteVector.confidence * 100).toFixed(0)}% confidence
          </p>
          {tasteVector.tasteArchetype && (
            <p className="headline mt-1 text-lg text-gradient-brand">
              {tasteVector.tasteArchetype}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ${
            processingMode === "llm"
              ? "badge-live px-2.5 py-1"
              : "badge-gold px-2.5 py-1"
          }`}
        >
          {processingMode === "llm" ? "LLM analysis" : "Live analysis"}
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
                <div className="dim-track relative overflow-hidden">
                  <div
                    className="dim-fill absolute inset-y-0 left-0"
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
        {tasteVector.emotionalTags?.length > 0 && (
          <div>
            <p className="section-label mb-1.5 text-zinc-500">Emotional Layer</p>
            <div className="flex flex-wrap gap-1.5">
              {tasteVector.emotionalTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="section-label mb-1.5 text-zinc-500">Aesthetic Tags</p>
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
          <p className="section-label mb-1.5 text-zinc-500">Palette</p>
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