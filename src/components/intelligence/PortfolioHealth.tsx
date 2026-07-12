"use client";

import type { PortfolioHealth as Health } from "@/lib/intelligence/derive";
import { useInViewOnce } from "@/components/motion/use-in-view-once";

function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/** Gold magnitude meter that fills on scroll-in (with fallback). */
function Meter({ label, value }: { label: string; value: number }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[var(--ink-2)]">{label}</span>
        <span className="font-mono text-xs text-[var(--gold)]">{value}%</span>
      </div>
      <div className="ai-signal-track mt-2">
        <div
          className="ai-signal-fill"
          style={{
            width: inView ? `${value}%` : "0%",
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

export function PortfolioHealth({ health }: { health: Health }) {
  const riskColor =
    health.risk === "Low"
      ? "var(--live)"
      : health.risk === "Elevated"
        ? "var(--coral)"
        : "var(--gold)";

  const maxAlloc = Math.max(1, ...health.allocation.map((a) => a.pct));

  if (health.holdingsCount === 0) {
    return (
      <section className="glass-card rounded-[24px] p-6 sm:p-8">
        <p className="section-label text-[var(--gold)]">Portfolio Health</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-2)]">
          No on-chain Renaiss holdings for this wallet yet — so there&apos;s no
          portfolio to score. Your recommendations above are driven purely by
          your taste signals. Portfolio health, diversification, and allocation
          appear once you hold cards.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-[24px] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label text-[var(--gold)]">Portfolio Health</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="metric-num text-[2.75rem]">{health.score}</span>
            <span className="mb-1.5 text-sm text-[var(--ink-3)]">/ 100</span>
            <span
              className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                color: riskColor,
                border: `1px solid ${riskColor}40`,
                background: `${riskColor}14`,
              }}
            >
              {health.risk} risk
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-[#f5f3ee]">
            {money(health.portfolioValue)}
          </p>
          <p className="text-xs text-[var(--ink-3)]">
            {health.holdingsCount} holdings · {health.recentAdds} recent adds
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* meters */}
        <div className="flex flex-col justify-center gap-4">
          <Meter label="Diversification" value={health.diversification} />
          <Meter label="Liquidity" value={health.liquidity} />
          <Meter label="Long-term potential" value={health.longTermPotential} />
        </div>

        {/* allocation */}
        <div>
          <p className="section-label text-[var(--ink-3)]">Category allocation</p>
          <div className="mt-3 space-y-3">
            {health.allocation.length === 0 && (
              <p className="text-sm text-[var(--ink-3)]">No holdings to allocate.</p>
            )}
            {health.allocation.map((a, i) => (
              <div key={a.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-[#f5f3ee]">
                  {a.label}
                </span>
                <div className="ai-signal-track flex-1">
                  <div
                    className="ai-signal-fill"
                    style={{
                      width: `${(a.pct / maxAlloc) * 100}%`,
                      opacity: 1 - i * 0.14,
                    }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-xs text-[var(--ink-2)]">
                  {a.pct}% · {a.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
