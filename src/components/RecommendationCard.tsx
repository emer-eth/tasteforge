"use client";

import { useState } from "react";
import type { CardRecommendation } from "@/lib/types";
import { CardDisplay } from "@/components/CardDisplay";
import { CardPreviewModal } from "@/components/CardPreviewModal";
import { MatchHighlights } from "@/components/MatchHighlights";
import { WhyThisCard } from "@/components/intelligence/WhyThisCard";

interface RecommendationCardProps {
  recommendation: CardRecommendation;
  rank: number;
  section?: "best-overall" | "best-value";
}

export function RecommendationCard({
  recommendation,
  rank,
  section,
}: RecommendationCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    card,
    resonanceScore,
    valueScore,
    matchingTags,
    explanation,
    valueInsight,
    dimensionAlignment,
  } = recommendation;

  const buyUrl = `https://www.renaiss.xyz/card/${card.tokenId}`;

  return (
    <>
      <article className="panel card-rec overflow-hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="group relative block w-full cursor-zoom-in text-left"
          aria-label={`Preview ${card.title}`}
        >
          <CardDisplay
            card={card}
            resonanceScore={resonanceScore}
            valueScore={valueScore}
            rank={rank}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
            <span className="scale-90 rounded-full border border-white/30 bg-[#171511]/80 px-4 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition-all group-hover:scale-100 group-hover:opacity-100">
              Preview card
            </span>
          </div>
        </button>

        <div className="p-4">
          <MatchHighlights alignment={dimensionAlignment} />

          <p className="mb-2 mt-3 text-xs font-medium text-[var(--sky)]">
            {valueInsight}
          </p>

          <p className="mb-3 text-sm leading-relaxed text-[var(--ink-2)]">
            {explanation}
          </p>

          {matchingTags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {matchingTags.map((tag) => (
                <span key={tag} className="tag-pill tag-pill-gold">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <WhyThisCard recommendation={recommendation} defaultOpen={rank === 1} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="btn-ghost flex-1 !py-2.5 !text-sm"
            >
              Preview
            </button>
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta flex-1 !py-2.5 text-center !text-sm"
            >
              Buy on Renaiss ↗
            </a>
          </div>
        </div>
      </article>

      <CardPreviewModal
        card={card}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        rank={rank}
        section={section}
        resonanceScore={resonanceScore}
        valueScore={valueScore}
        valueInsight={valueInsight}
        explanation={explanation}
      />
    </>
  );
}