import type { TasteDimensions } from "@/lib/types";
import { getTopAlignedDimensions } from "@/lib/taste-vector/dimensions";

interface MatchHighlightsProps {
  alignment: Partial<TasteDimensions>;
}

export function MatchHighlights({ alignment }: MatchHighlightsProps) {
  const top = getTopAlignedDimensions(alignment, 3);

  return (
    <div className="flex flex-wrap gap-1.5">
      {top.map(({ label, score }) => (
        <span
          key={label}
          className="badge-live inline-flex items-center gap-1 px-2 py-0.5 text-[10px]"
        >
          <span className="font-medium">{label}</span>
          <span className="text-emerald-400/70">{(score * 100).toFixed(0)}%</span>
        </span>
      ))}
    </div>
  );
}