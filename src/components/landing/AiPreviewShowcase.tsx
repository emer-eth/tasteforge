"use client";

import { Reveal } from "@/components/motion/Reveal";
import { useInViewOnce } from "@/components/motion/use-in-view-once";
import {
  DIMENSION_LABELS,
  DIMENSION_SHORT_LABELS,
} from "@/lib/taste-vector/dimensions";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";
import type { TasteDimensions, TasteVector } from "@/lib/types";

interface AiPreviewShowcaseProps {
  tasteVector?: TasteVector | null;
}

const SAMPLE = {
  archetype: "The Master Curator",
  summary:
    "You curate with precision. Quality, rarity, and story matter more than hype.",
  signals: [
    { title: "Vintage Japanese", strength: "High affinity" },
    { title: "High Rarity Preference", strength: "Very high" },
    { title: "PSA Graded Bias", strength: "Strong" },
    { title: "Illustration & Character Focus", strength: "Very high" },
    { title: "Long-term Holding Pattern", strength: "Strong" },
  ],
  strengths: [
    { label: "Rarity", pct: 98 },
    { label: "Era", pct: 95 },
    { label: "Category", pct: 92 },
    { label: "Grading", pct: 90 },
    { label: "Hold Behavior", pct: 88 },
  ],
};

function strengthWord(lean: number): string {
  const a = Math.abs(lean);
  if (a >= 0.32) return "Very high";
  if (a >= 0.22) return "Strong";
  if (a >= 0.12) return "High affinity";
  return "Moderate";
}

function derive(tv: TasteVector) {
  const entries = (
    Object.entries(tv.dimensions) as [keyof TasteDimensions, number][]
  )
    .map(([key, v]) => ({ key, v, lean: v - 0.5 }))
    .sort((a, b) => Math.abs(b.lean) - Math.abs(a.lean));

  const signals = entries.slice(0, 5).map((e) => {
    const [low, high] = DIMENSION_LABELS[e.key];
    return {
      title: `${e.v >= 0.5 ? high : low} · ${DIMENSION_SHORT_LABELS[e.key]}`,
      strength: strengthWord(e.lean),
    };
  });

  const strengths = entries.slice(0, 5).map((e) => ({
    label: DIMENSION_SHORT_LABELS[e.key],
    pct: Math.round(Math.min(99, Math.max(55, (0.55 + Math.abs(e.lean) * 0.9) * 100))),
  }));

  return {
    archetype: tv.tasteArchetype || "Balanced Collector",
    summary: tv.summary || SAMPLE.summary,
    signals,
    strengths,
  };
}

/** Signal bar that fills on scroll-in, with a guaranteed fallback. */
function Bar({ pct, delay }: { pct: number; delay: number }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className="ai-signal-track mt-2">
      <div
        className="ai-signal-fill"
        style={{
          width: inView ? `${pct}%` : "0%",
          transition: `width 1s ease ${delay}s`,
        }}
      />
    </div>
  );
}

export function AiPreviewShowcase({ tasteVector }: AiPreviewShowcaseProps) {
  const isLive = Boolean(tasteVector);
  const data = tasteVector ? derive(tasteVector) : SAMPLE;
  const theme = getArchetypeTheme(isLive ? data.archetype : "Balanced Collector");
  const accent = isLive ? theme.accent : "var(--gold)";
  const accentRgb = isLive ? theme.accentRgb : "216, 181, 107";

  return (
    <section className="py-14 lg:py-20">
      <div className="glass-card rounded-[28px] p-6 sm:p-10 lg:p-12">
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="section-label text-[var(--gold)]">
              {isLive ? "Live analysis" : "Live analysis preview"}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--live)]"
              aria-hidden
            />
          </div>
          <h2 className="headline mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] text-[#f5f3ee]">
            {isLive ? "Your taste, decoded" : "AI is analyzing your taste…"}
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            {isLive
              ? "Derived from your holdings and taste signals"
              : "This is what we detect for a sample collector"}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          {/* Left — detected signals */}
          <Reveal delay={0.05} className="flex flex-col justify-center gap-4">
            {data.signals.map((s, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[#f5f3ee]">
                    {s.title}
                  </span>
                  <span className="shrink-0 text-[11px] uppercase tracking-wide text-[var(--gold)]">
                    {s.strength}
                  </span>
                </div>
                <Bar pct={72 + ((i * 7) % 26)} delay={0.1 * i} />
              </div>
            ))}
          </Reveal>

          {/* Center — archetype orb */}
          <Reveal delay={0.12} className="flex flex-col items-center justify-center text-center">
            <div
              className="archetype-orb"
              style={{
                borderColor: `rgba(${accentRgb}, 0.3)`,
                boxShadow: `0 0 60px rgba(${accentRgb}, 0.2), 0 0 0 1px rgba(255,255,255,0.03) inset`,
              }}
            >
              <div
                className="anim-spin-slow absolute inset-[6%] rounded-full"
                style={{
                  borderTop: `1px solid rgba(${accentRgb}, 0.5)`,
                  borderRight: "1px solid transparent",
                  borderBottom: "1px solid transparent",
                  borderLeft: "1px solid transparent",
                }}
                aria-hidden
              />
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(150deg, rgba(${accentRgb},0.25), rgba(23,21,17,0.9))`,
                  border: `1px solid rgba(${accentRgb}, 0.4)`,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
                    fill={accent}
                    opacity="0.9"
                  />
                </svg>
              </div>
            </div>
            <p className="section-label mt-6 text-[var(--ink-3)]">
              Collector archetype
            </p>
            <h3
              className="headline headline-italic mt-2 text-[clamp(1.5rem,3vw,2.25rem)]"
              style={{ color: accent }}
            >
              {data.archetype}
            </h3>
            <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-[var(--ink-2)]">
              {data.summary}
            </p>
          </Reveal>

          {/* Right — signal strength */}
          <Reveal delay={0.05} className="flex flex-col justify-center gap-4">
            <p className="section-label text-[var(--ink-3)]">
              Taste signal strength
            </p>
            {data.strengths.map((s, i) => (
              <div key={s.label + i}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[#f5f3ee]">{s.label}</span>
                  <span className="font-mono text-xs text-[var(--gold)]">
                    {s.pct}%
                  </span>
                </div>
                <Bar pct={s.pct} delay={0.1 * i} />
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
