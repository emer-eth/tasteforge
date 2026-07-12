import type { DailyBrief as Brief } from "@/lib/intelligence/derive";

function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export function DailyBrief({ brief }: { brief: Brief }) {
  const rows = [
    { label: "New listings scanned", value: String(brief.newListings) },
    { label: "Perfect matches", value: String(brief.perfectMatches) },
    { label: "Below FMV", value: String(brief.belowFmv) },
    { label: "Wishlist available", value: String(brief.wishlistAvailable) },
  ];

  const sentimentColor =
    brief.sentiment === "Bullish"
      ? "var(--live)"
      : brief.sentiment === "Cautious"
        ? "var(--coral)"
        : "var(--gold)";

  return (
    <div className="glass-card rounded-[24px] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="section-label text-[var(--gold)]">Today&apos;s Collector Brief</p>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            color: sentimentColor,
            border: `1px solid ${sentimentColor}40`,
            background: `${sentimentColor}14`,
          }}
        >
          {brief.sentiment}
        </span>
      </div>

      <div className="mt-5 divide-y divide-[var(--border)]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3">
            <span className="text-sm text-[var(--ink-2)]">{r.label}</span>
            <span className="metric-num text-[1.5rem]">{r.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-[var(--ink-2)]">Portfolio value</span>
          <span className="text-lg font-semibold text-[#f5f3ee]">
            {money(brief.portfolioValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
