"use client";

import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";

const METRICS = [
  { value: 12432, suffix: "+", label: "Wallets analyzed", decimals: 0 },
  { value: 18, prefix: "$", suffix: "M+", label: "Listings scored", decimals: 0 },
  { value: 150, suffix: "+", label: "Collector archetypes", decimals: 0 },
  { value: 98.7, suffix: "%", label: "Accuracy rate", decimals: 1 },
];

const AVATAR_COLORS = ["#d8b56b", "#b49ede", "#3fa98a", "#d4847a"];

export function MetricsRow() {
  return (
    <section className="py-4">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08}>
            <div className="metric-card">
              <p className="metric-num">
                <CountUp
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  decimals={m.decimals}
                />
              </p>
              <p className="mt-2 text-sm text-[var(--ink-2)]">{m.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {AVATAR_COLORS.map((c) => (
              <span
                key={c}
                className="h-7 w-7 rounded-full border-2 border-[#090806]"
                style={{ background: `linear-gradient(135deg, ${c}, #171511)` }}
                aria-hidden
              />
            ))}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#090806] bg-[#171511] text-[10px] font-medium text-[var(--gold)]">
              +42
            </span>
          </div>
          <p className="text-sm text-[var(--ink-3)]">
            Backed by the collector community
          </p>
        </div>
      </Reveal>
    </section>
  );
}
