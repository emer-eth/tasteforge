import type { CollectorIdentity } from "@/lib/intelligence/derive";
import { getArchetypeTheme } from "@/lib/taste-vector/archetype-theme";
import { InfoTip } from "@/components/InfoTip";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="section-label text-[var(--ink-3)]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#f5f3ee]">{value}</p>
    </div>
  );
}

export function CollectorIdentityCard({
  identity,
}: {
  identity: CollectorIdentity;
}) {
  const theme = getArchetypeTheme(identity.archetype);

  return (
    <div className="glass-card rounded-[24px] p-6 sm:p-8">
      <p className="section-label text-[var(--gold)]">Collector Identity</p>

      <h3
        className="headline headline-italic mt-3 text-[clamp(1.75rem,3vw,2.5rem)]"
        style={{
          backgroundImage: theme.gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 20px rgba(${theme.accentRgb}, 0.3))`,
        }}
      >
        {identity.archetype}
      </h3>

      {/* headline scores */}
      <div className="mt-5 flex flex-wrap gap-6">
        <div>
          <p className="metric-num" style={{ color: theme.accent }}>
            {identity.tasteScore}
            <span className="text-lg text-[var(--ink-3)]">/100</span>
          </p>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            <InfoTip
              term="Taste Score"
              def="How sharply and consistently your taste points in a direction (0–100). Higher = a more defined collector signature."
            >
              Taste Score
            </InfoTip>
          </p>
        </div>
        <div>
          <p className="metric-num" style={{ color: theme.accent }}>
            {identity.confidence}%
          </p>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            <InfoTip
              term="Confidence"
              def="How sure the model is about this read, based on how much taste signal it had to work with."
            >
              Confidence
            </InfoTip>
          </p>
        </div>
        <div>
          <p className="metric-num" style={{ color: theme.accent }}>
            {identity.rank}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            <InfoTip
              term="Collector Rank"
              def="Where your taste conviction places you versus other collectors — a rough percentile, not a leaderboard."
            >
              Collector Rank
            </InfoTip>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="section-label text-[var(--ink-3)]">Primary Interests</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {identity.primaryInterests.map((t) => (
            <span
              key={t}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                background: theme.accentSoft,
                color: theme.accent,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-5">
        <Stat label="Investment Style" value={identity.investmentStyle} />
        <Stat label="Diversity" value={identity.diversity} />
        <Stat label="Holdings" value={`${identity.holdingsCount} cards`} />
      </div>
    </div>
  );
}
