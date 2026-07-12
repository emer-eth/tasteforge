import type { TasteDimensions, TasteVector } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/taste-vector/dimensions";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";

interface TasteVectorDisplayProps {
  tasteVector: TasteVector;
  processingMode: "llm" | "deterministic";
}

export function TasteVectorDisplay({
  tasteVector,
  processingMode,
}: TasteVectorDisplayProps) {
  const theme = getArchetypeTheme(tasteVector.tasteArchetype);

  return (
    <section
      className="panel p-6"
      style={{
        borderColor: `rgba(${theme.accentRgb}, 0.28)`,
        background: `linear-gradient(145deg, ${theme.accentSoft} 0%, rgba(30, 25, 18, 0.92) 45%)`,
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="section-label text-[var(--ink-3)]">10-D Taste Vector</p>
          <p className="mt-1 font-mono text-sm text-[var(--ink-2)]">
            {(tasteVector.confidence * 100).toFixed(0)}% confidence
          </p>
          {tasteVector.tasteArchetype && (
            <p
              className="headline mt-1 text-lg"
              style={{
                backgroundImage: theme.gradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {tasteVector.tasteArchetype}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {tasteVector.visionEnriched && (
            <span className="badge-violet px-2.5 py-1 text-xs">
              Vision + taste
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
              processingMode === "llm" ? "badge-live" : "badge-gold"
            }`}
          >
            {processingMode === "llm" ? "LLM analysis" : "Live analysis"}
          </span>
        </div>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-[var(--ink-2)]">
        {tasteVector.summary}
      </p>

      {tasteVector.signalAnalysis &&
        !tasteVector.signalAnalysis.trim().startsWith("{") && (
          <p className="mb-4 text-xs italic text-[var(--ink-3)]">
            {tasteVector.signalAnalysis}
          </p>
        )}

      <div className="mb-4 space-y-2.5">
        {(Object.keys(DIMENSION_LABELS) as (keyof TasteDimensions)[]).map(
          (key) => {
            const [left, right] = DIMENSION_LABELS[key];
            const value = tasteVector.dimensions[key];
            const lean = Math.abs(value - 0.5);
            const isDominant = lean >= 0.12;
            const glowStrength = 0.15 + lean * 0.7;

            return (
              <div
                key={key}
                className={`dim-tier ${isDominant ? "is-dominant" : ""}`}
                style={
                  isDominant
                    ? {
                        borderColor: `rgba(${theme.accentRgb}, 0.35)`,
                        boxShadow: `0 0 20px rgba(${theme.accentRgb}, ${glowStrength * 0.35})`,
                      }
                    : undefined
                }
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-3)]">
                    {left}
                    <span className="mx-1.5 text-[var(--ink-3)]">←→</span>
                    {right}
                  </span>
                  <span
                    className="font-mono text-[11px] font-semibold tabular-nums"
                    style={{ color: isDominant ? theme.accent : "#a8a29e" }}
                  >
                    {(value * 100).toFixed(0)}
                  </span>
                </div>
                <div className="dim-track relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all"
                    style={{
                      width: `${Math.max(4, value * 100)}%`,
                      background: theme.gradient,
                      boxShadow: isDominant
                        ? `0 0 12px rgba(${theme.accentRgb}, ${glowStrength})`
                        : `0 0 6px rgba(${theme.accentRgb}, 0.25)`,
                      opacity: 0.55 + lean * 0.9,
                    }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/70"
                    style={{ left: `calc(${value * 100}% - 1px)` }}
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
            <p className="section-label mb-1.5 text-[var(--ink-3)]">Emotional Layer</p>
            <div className="flex flex-wrap gap-1.5">
              {tasteVector.emotionalTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2 py-0.5 text-xs"
                  style={{
                    borderColor: `rgba(${theme.accentRgb}, 0.3)`,
                    background: theme.accentSoft,
                    color: theme.accent,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="section-label mb-1.5 text-[var(--ink-3)]">Aesthetic Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tasteVector.aestheticTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-2 py-0.5 text-xs"
                style={{
                  borderColor: `rgba(${theme.accentRgb}, 0.28)`,
                  background: `rgba(${theme.accentRgb}, 0.1)`,
                  color: theme.accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {tasteVector.colorPalette?.length > 0 && (
          <div>
            <p className="section-label mb-1.5 text-[var(--ink-3)]">Palette</p>
            <div className="flex gap-1">
              {tasteVector.colorPalette.map((color) => (
                <div
                  key={color}
                  className="h-6 w-6 rounded-md border border-[var(--border)]"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
