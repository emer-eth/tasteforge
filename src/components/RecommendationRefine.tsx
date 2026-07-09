"use client";

import {
  DEFAULT_FILTERS,
  type RecommendationFilters,
} from "@/lib/analysis/refine";

interface RecommendationRefineProps {
  filters: RecommendationFilters;
  onChange: (filters: RecommendationFilters) => void;
  maxCatalogPrice: number;
}

export function RecommendationRefine({
  filters,
  onChange,
  maxCatalogPrice,
}: RecommendationRefineProps) {
  const active =
    filters.maxPrice != null ||
    filters.vintageOnly ||
    filters.psa10Only ||
    filters.bargainsOnly;

  return (
    <div className="panel panel-violet flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-end">
      <p className="section-label w-full text-violet-300/70">Refine picks</p>
      <div className="min-w-[180px] flex-1">
        <label className="text-xs font-medium text-stone-500">
          Max price (${filters.maxPrice ?? maxCatalogPrice})
        </label>
        <input
          type="range"
          min={50}
          max={Math.max(maxCatalogPrice, 500)}
          step={25}
          value={filters.maxPrice ?? maxCatalogPrice}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: Number(e.target.value),
            })
          }
          className="mt-2 w-full accent-[#f5b942]"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input
          type="checkbox"
          checked={filters.vintageOnly}
          onChange={(e) =>
            onChange({ ...filters, vintageOnly: e.target.checked })
          }
          className="rounded border-stone-600"
        />
        Vintage only
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input
          type="checkbox"
          checked={filters.psa10Only}
          onChange={(e) =>
            onChange({ ...filters, psa10Only: e.target.checked })
          }
          className="rounded border-stone-600"
        />
        PSA 10
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input
          type="checkbox"
          checked={filters.bargainsOnly}
          onChange={(e) =>
            onChange({ ...filters, bargainsOnly: e.target.checked })
          }
          className="rounded border-stone-600"
        />
        Below FMV
      </label>

      {active && (
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
          className="text-xs text-stone-500 underline hover:text-stone-300"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}