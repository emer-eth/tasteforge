import type { RenaissCard } from "@/lib/types";
import { CardArt } from "@/components/CardArt";

interface CardDisplayProps {
  card: RenaissCard;
  resonanceScore?: number;
  valueScore?: number;
  rank?: number;
  compact?: boolean;
}

export function CardDisplay({
  card,
  resonanceScore,
  valueScore,
  rank,
  compact = false,
}: CardDisplayProps) {
  const fmvDelta =
    card.fmv > 0
      ? ((card.fmv - card.floorPrice) / card.fmv) * 100
      : 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141218]/90 ${compact ? "" : "shadow-xl shadow-black/40 ring-1 ring-white/[0.04]"}`}
    >
      <div className={`relative ${compact ? "aspect-[4/3]" : "aspect-[3/4]"}`}>
        <CardArt card={card} className="h-full w-full" />
        {rank !== undefined && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-[#d8b56b] ring-1 ring-[#d8b56b]/30 backdrop-blur">
            #{rank}
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {resonanceScore !== undefined && (
            <span className="badge-live px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
              {(resonanceScore * 100).toFixed(0)}% resonance
            </span>
          )}
          {valueScore !== undefined && (
            <span className="badge-value px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
              {(valueScore * 100).toFixed(0)}% value
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-3 gap-px border-t border-[var(--border)] bg-[var(--border)]">
          <div className="bg-[#171511] px-3 py-2 text-center">
            <p className="text-[9px] uppercase tracking-wider text-[var(--ink-3)]">Floor</p>
            <p className="text-sm font-semibold text-[#f5f3ee]">${card.floorPrice}</p>
          </div>
          <div className="bg-[#171511] px-3 py-2 text-center">
            <p className="text-[9px] uppercase tracking-wider text-[var(--ink-3)]">FMV</p>
            <p className="text-sm font-semibold text-[#f5f3ee]">${card.fmv}</p>
          </div>
          <div className="bg-[#171511] px-3 py-2 text-center">
            <p className="text-[9px] uppercase tracking-wider text-[var(--ink-3)]">Liq</p>
            <p className="text-sm font-semibold text-[#f5f3ee]">
              {(card.liquidity * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {fmvDelta > 5 && !compact && (
        <div className="border-t border-[var(--border)] bg-[var(--live)]/[0.08] px-3 py-1.5 text-center text-[10px] text-[var(--live)]">
          {fmvDelta.toFixed(0)}% below FMV estimate
        </div>
      )}
    </div>
  );
}