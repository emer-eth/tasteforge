"use client";

import { useState } from "react";
import type { TasteVector } from "@/lib/types";
import { getTopAlignedDimensions } from "@/lib/taste-vector/dimensions";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";

interface ArchetypeRevealProps {
  tasteVector: TasteVector;
  shareUrl?: string;
  shareSummary?: string;
}

export function ArchetypeReveal({
  tasteVector,
  shareUrl,
  shareSummary,
}: ArchetypeRevealProps) {
  const [copied, setCopied] = useState(false);
  const archetype = tasteVector.tasteArchetype || "Balanced Collector";
  const theme = getArchetypeTheme(archetype);

  // Rank by distance from neutral so both poles surface; show real axis values
  const topDims = getTopAlignedDimensions(
    Object.fromEntries(
      (
        Object.entries(tasteVector.dimensions) as [
          keyof typeof tasteVector.dimensions,
          number,
        ][]
      ).map(([k, v]) => [k, Math.abs(v - 0.5)]),
    ) as Partial<typeof tasteVector.dimensions>,
    3,
  ).map((dim) => ({
    ...dim,
    score: tasteVector.dimensions[dim.key],
  }));

  const shareText = [
    `I'm a ${archetype} on TasteForge.`,
    tasteVector.summary,
    shareUrl,
  ]
    .filter(Boolean)
    .join("\n\n");

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        shareSummary ? `${shareSummary}\n\n${shareUrl ?? ""}`.trim() : shareText,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="archetype"
      className="archetype-reveal animate-in scroll-mt-24"
      aria-label={`Collector identity: ${archetype}`}
      style={{
        borderColor: `rgba(${theme.accentRgb}, 0.35)`,
        boxShadow: `0 0 0 1px rgba(${theme.accentRgb}, 0.12) inset, 0 28px 80px -32px rgba(${theme.accentRgb}, 0.35)`,
      }}
    >
      <div
        className="archetype-reveal-glow"
        style={{
          background: `radial-gradient(circle, ${theme.accentSoft} 0%, transparent 70%)`,
          boxShadow: `0 0 120px rgba(${theme.accentRgb}, 0.35)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1]">
        <p
          className="section-label"
          style={{ color: theme.accent }}
        >
          Your collector identity
        </p>

        <h2
          className="archetype-name mt-4"
          style={{
            backgroundImage: theme.gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 0 28px rgba(${theme.accentRgb}, 0.35))`,
          }}
        >
          {archetype}
        </h2>

        {tasteVector.summary && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">
            {tasteVector.summary}
          </p>
        )}

        {topDims.length > 0 && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {topDims.map((dim) => (
              <span
                key={dim.key}
                className="archetype-pill"
                style={{
                  borderColor: `rgba(${theme.accentRgb}, 0.4)`,
                  background: theme.accentSoft,
                  color: theme.accent,
                }}
              >
                {dim.label}
                <span className="font-mono opacity-80">
                  {(dim.score * 100).toFixed(0)}%
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="btn-cta btn-cta-hero"
            style={{
              background: theme.gradient,
              borderColor: `rgba(${theme.accentRgb}, 0.5)`,
              boxShadow: `0 0 0 1px rgba(${theme.accentRgb}, 0.35), 0 0 32px rgba(${theme.accentRgb}, 0.4), 0 12px 40px rgba(${theme.accentRgb}, 0.25)`,
              color: "#0c0a08",
            }}
          >
            {copied ? "Copied!" : "Share my Collector DNA"}
          </button>
        </div>

        <p className="mt-4 text-[11px] text-stone-600">
          Identity derived from wallet holdings, optional taste signals, and live
          Renaiss catalog — not reconstructed trade history.
        </p>
      </div>
    </section>
  );
}
