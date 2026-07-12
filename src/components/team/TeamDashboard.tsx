"use client";

import type { TeamSummary } from "@/lib/intelligence/team";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";
import { TasteDnaRadar } from "@/components/intelligence/TasteDnaRadar";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function TeamDashboard({ summary }: { summary: TeamSummary }) {
  const dominant = summary.archetypeMix[0]?.archetype ?? "Balanced Collector";
  const theme = getArchetypeTheme(dominant);
  const maxMix = Math.max(1, ...summary.archetypeMix.map((a) => a.count));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Members", value: String(summary.memberCount) },
          { label: "Avg Taste Score", value: String(summary.avgTasteScore) },
          { label: "Combined value", value: money(summary.totalPortfolio) },
          { label: "Archetypes", value: String(summary.archetypeMix.length) },
        ].map((s) => (
          <div key={s.label} className="metric-card !min-h-[110px] !p-5">
            <p className="metric-num text-[1.9rem]" style={{ color: theme.accent }}>
              {s.value}
            </p>
            <p className="mt-1.5 text-xs text-[var(--ink-2)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Archetype mix + blended DNA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-[24px] p-6 sm:p-8">
          <p className="section-label text-[var(--gold)]">Team archetype mix</p>
          <div className="mt-5 space-y-3">
            {summary.archetypeMix.map((a) => {
              const t = getArchetypeTheme(a.archetype);
              return (
                <div key={a.archetype} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-[#f5f3ee]">
                    {a.archetype}
                  </span>
                  <div className="ai-signal-track flex-1">
                    <div
                      className="ai-signal-fill"
                      style={{
                        width: `${(a.count / maxMix) * 100}%`,
                        background: t.accent,
                        boxShadow: `0 0 10px ${t.accent}66`,
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-xs text-[var(--ink-2)]">
                    {a.count} · {a.pct}%
                  </span>
                </div>
              );
            })}
          </div>
          {summary.mostAligned && (
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <p className="text-sm text-[var(--ink-2)]">
                Most-aligned pair:{" "}
                <span className="font-mono text-[var(--gold)]">
                  {summary.mostAligned.a}
                </span>{" "}
                &amp;{" "}
                <span className="font-mono text-[var(--gold)]">
                  {summary.mostAligned.b}
                </span>{" "}
                <span className="text-[var(--ink-3)]">
                  ({Math.round(summary.mostAligned.score * 100)}% taste overlap)
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="glass-card flex flex-col rounded-[24px] p-6 sm:p-8">
          <p className="section-label text-[var(--gold)]">Blended team taste DNA</p>
          <div className="flex flex-1 items-center justify-center py-2">
            <TasteDnaRadar
              axes={summary.blendedDna}
              accent={theme.accent}
              accentRgb={theme.accentRgb}
            />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card rounded-[24px] p-6 sm:p-8">
        <p className="section-label text-[var(--gold)]">Team leaderboard</p>
        <div className="mt-4 divide-y divide-[var(--border)]">
          {summary.leaderboard.map((m, i) => {
            const t = getArchetypeTheme(m.identity.archetype);
            return (
              <div key={m.wallet} className="flex items-center gap-4 py-3">
                <span className="w-6 shrink-0 text-center font-mono text-sm text-[var(--ink-3)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: t.accent }}>
                    {m.identity.archetype}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--ink-3)]">
                    {m.label} · {m.holdings} cards · {money(m.portfolioValue)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="metric-num text-[1.4rem]">{m.identity.tasteScore}</p>
                  <p className="text-[10px] text-[var(--ink-3)]">{m.identity.rank}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gaps */}
      {summary.gaps.length > 0 && (
        <div className="glass-card rounded-[24px] p-6 sm:p-8">
          <p className="section-label text-[var(--gold)]">Collective gaps &amp; open lanes</p>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            Where the team could diversify or specialize together.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.gaps.map((g) => (
              <div key={g.label} className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-sm font-medium text-[#f5f3ee]">{g.label}</p>
                <p className="mt-1 text-xs text-[var(--ink-2)]">{g.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
