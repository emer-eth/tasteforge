import type { CardRecommendation } from "@/lib/types";
import { CardArt } from "@/components/CardArt";
import { MatchHighlights } from "@/components/MatchHighlights";

interface RecommendationCardProps {
  recommendation: CardRecommendation;
  rank: number;
}

export function RecommendationCard({
  recommendation,
  rank,
}: RecommendationCardProps) {
  const { card, resonanceScore, matchingTags, explanation, whyNow, dimensionAlignment } =
    recommendation;

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-600">
      <div className="relative aspect-[3/4]">
        <CardArt card={card} className="h-full w-full" />
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/80 text-sm font-bold text-amber-400 backdrop-blur">
          #{rank}
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-zinc-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur">
          {(resonanceScore * 100).toFixed(0)}% match
        </div>
      </div>

      <div className="p-4">
        <MatchHighlights alignment={dimensionAlignment} />

        <p className="mb-3 mt-3 text-sm leading-relaxed text-zinc-300">
          {explanation}
        </p>

        {matchingTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {matchingTags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-3 border-t border-zinc-800 pt-3">
          <p className="text-xs leading-relaxed text-amber-400/90">{whyNow}</p>
          <span className="shrink-0 text-xs font-medium text-zinc-400">
            ${card.floorPrice}
          </span>
        </div>
      </div>
    </article>
  );
}