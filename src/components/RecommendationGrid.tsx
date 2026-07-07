import type { CardRecommendation } from "@/lib/types";
import { RecommendationCard } from "@/components/RecommendationCard";

interface RecommendationGridProps {
  recommendations: CardRecommendation[];
}

export function RecommendationGrid({ recommendations }: RecommendationGridProps) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          High-Resonance Recommendations
        </p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-50">
          Curated for your taste
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Cards you don&apos;t own yet, ranked by Taste Vector alignment
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.card.id} recommendation={rec} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}