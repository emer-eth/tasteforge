"use client";

import { useState } from "react";
import type { CardRecommendation } from "@/lib/types";
import { deriveWhyReasons } from "@/lib/intelligence/derive";

export function WhyThisCard({
  recommendation,
  defaultOpen = false,
}: {
  recommendation: CardRecommendation;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { reasons, confidence } = deriveWhyReasons(recommendation);
  if (reasons.length === 0) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-[var(--border)] bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold text-[var(--gold)]">
          Why this card?
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--live)]/30 bg-[var(--live)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--live)]">
            AI {confidence}%
          </span>
          <span
            className={`text-[var(--ink-3)] transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ⌄
          </span>
        </span>
      </button>
      {open && (
        <ul className="space-y-1.5 px-3 pb-3">
          {reasons.map((r, i) => (
            <li
              key={i}
              className="flex gap-2 text-xs leading-relaxed text-[var(--ink-2)]"
            >
              <span className="mt-0.5 shrink-0 text-[var(--live)]" aria-hidden>
                ✓
              </span>
              {r.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
