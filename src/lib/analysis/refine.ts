import type { CardRecommendation } from "@/lib/types";

export interface RecommendationFilters {
  maxPrice: number | null;
  vintageOnly: boolean;
  psa10Only: boolean;
  bargainsOnly: boolean;
}

export const DEFAULT_FILTERS: RecommendationFilters = {
  maxPrice: null,
  vintageOnly: false,
  psa10Only: false,
  bargainsOnly: false,
};

function matchesFilters(
  rec: CardRecommendation,
  filters: RecommendationFilters,
): boolean {
  const card = rec.card;

  if (filters.maxPrice != null && card.floorPrice > filters.maxPrice) {
    return false;
  }

  if (filters.vintageOnly && card.era !== "vintage") {
    return false;
  }

  if (filters.psa10Only) {
    const tags = card.aestheticTags.join(" ").toLowerCase();
    const title = card.title.toLowerCase();
    if (!tags.includes("psa-10") && !title.includes("psa 10")) {
      return false;
    }
  }

  if (filters.bargainsOnly && card.fmv > 0 && card.floorPrice >= card.fmv) {
    return false;
  }

  return true;
}

export function refineRecommendations(
  recommendations: CardRecommendation[],
  filters: RecommendationFilters,
): CardRecommendation[] {
  const active =
    filters.maxPrice != null ||
    filters.vintageOnly ||
    filters.psa10Only ||
    filters.bargainsOnly;

  if (!active) return recommendations;
  return recommendations.filter((rec) => matchesFilters(rec, filters));
}