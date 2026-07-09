import type { CardRecommendation } from "@/lib/types";
import { RecommendationCard } from "@/components/RecommendationCard";

interface RecommendationSectionProps {
  title: string;
  subtitle: string;
  recommendations: CardRecommendation[];
  accent?: "gold" | "sky";
}

function RecommendationSection({
  title,
  subtitle,
  recommendations,
  accent = "gold",
}: RecommendationSectionProps) {
  const accentBorder =
    accent === "sky" ? "border-sky-400/50" : "border-[#f5b942]/50";
  const accentText =
    accent === "sky" ? "text-sky-400" : "text-[#f5b942]";

  if (recommendations.length === 0) return null;

  return (
    <section>
      <div
        className={`mb-6 rounded-2xl border-l-[3px] ${accentBorder} bg-black/20 py-4 pl-5 pr-4`}
      >
        <p className={`section-label ${accentText}`}>{title}</p>
        <h2 className="headline mt-2 text-2xl text-stone-50 sm:text-3xl">
          {subtitle}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.card.id}
            recommendation={rec}
            rank={i + 1}
            section={accent === "sky" ? "best-value" : "best-overall"}
          />
        ))}
      </div>
    </section>
  );
}

interface RecommendationGridProps {
  bestOverall: CardRecommendation[];
  bestValue: CardRecommendation[];
  showEmptyHint?: boolean;
}

export function RecommendationGrid({
  bestOverall,
  bestValue,
  showEmptyHint,
}: RecommendationGridProps) {
  if (showEmptyHint) {
    return (
      <div className="panel border-dashed p-8 text-center text-sm text-stone-400">
        No cards match your refine filters — loosen price or tag filters above.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <RecommendationSection
        title="Best Card For You"
        subtitle="Top picks from live Renaiss"
        recommendations={bestOverall}
        accent="gold"
      />
      <RecommendationSection
        title="Best Value For You"
        subtitle="Strong taste fit at efficient FMV"
        recommendations={bestValue}
        accent="sky"
      />
    </div>
  );
}