import type { RenaissCard } from "@/lib/types";

const CARD_PATTERNS: Record<string, string> = {
  "rn-001": "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)",
  "rn-002": "repeating-linear-gradient(45deg, rgba(201,162,39,0.1) 0px, rgba(201,162,39,0.1) 2px, transparent 2px, transparent 8px)",
  "rn-003": "linear-gradient(90deg, rgba(0,255,255,0.2) 1px, transparent 1px), linear-gradient(rgba(255,0,255,0.2) 1px, transparent 1px)",
  "rn-004": "radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.08) 0%, transparent 60%)",
  "rn-005": "linear-gradient(0deg, rgba(126,184,218,0.3) 0%, transparent 40%)",
  "rn-006": "repeating-linear-gradient(0deg, rgba(255,107,107,0.15) 0px, transparent 4px, transparent 8px)",
  "rn-007": "radial-gradient(circle at 70% 30%, rgba(212,163,115,0.25) 0%, transparent 40%)",
  "rn-008": "radial-gradient(circle at 50% 50%, rgba(224,170,255,0.2) 0%, transparent 50%)",
  "rn-009": "linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%)",
  "rn-010": "linear-gradient(110deg, rgba(255,215,0,0.15) 0%, rgba(0,61,165,0.15) 50%, rgba(255,215,0,0.15) 100%)",
};

interface CardArtProps {
  card: RenaissCard;
  className?: string;
}

export function CardArt({ card, className = "" }: CardArtProps) {
  const pattern = CARD_PATTERNS[card.id] ?? "";
  const bg = `linear-gradient(145deg, ${card.colorPalette[0]} 0%, ${card.colorPalette[1] ?? card.colorPalette[0]} 45%, ${card.colorPalette[2] ?? "#111"} 100%)`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ background: bg }} />
      {pattern && (
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: pattern, backgroundSize: pattern.includes("1px") ? "20px 20px" : undefined }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute left-3 top-3 rounded border border-white/20 bg-black/30 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white/70 backdrop-blur-sm">
        Renaiss
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
          {card.series} · {card.rarity}
        </p>
        <h3 className="mt-0.5 text-lg font-semibold leading-tight text-white">
          {card.title}
        </h3>
        <p className="text-xs text-white/60">{card.artist}</p>
      </div>
    </div>
  );
}