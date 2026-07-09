"use client";

import { useEffect } from "react";
import type { RenaissCard } from "@/lib/types";

interface CardPreviewModalProps {
  card: RenaissCard;
  open: boolean;
  onClose: () => void;
  rank?: number;
  section?: "best-overall" | "best-value";
  resonanceScore?: number;
  valueScore?: number;
  valueInsight?: string;
  explanation?: string;
}

export function CardPreviewModal({
  card,
  open,
  onClose,
  rank,
  section,
  resonanceScore,
  valueScore,
  valueInsight,
  explanation,
}: CardPreviewModalProps) {
  const buyUrl = `https://www.renaiss.xyz/card/${card.tokenId}`;
  const hasLiveImage = card.imageUrl.startsWith("http");
  const fmvDelta =
    card.fmv > 0 ? ((card.fmv - card.floorPrice) / card.fmv) * 100 : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${card.title}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close preview"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex min-h-[280px] flex-1 items-center justify-center bg-zinc-900 p-4 sm:min-h-0 sm:max-w-[45%]">
          {hasLiveImage ? (
            <img
              src={card.imageUrl}
              alt={card.title}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : (
            <div
              className="flex aspect-[3/4] w-full max-w-xs items-end rounded-xl p-4"
              style={{
                background: `linear-gradient(145deg, ${card.colorPalette[0]}, ${card.colorPalette[1] ?? card.colorPalette[0]})`,
              }}
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">
                  {card.series}
                </p>
                <p className="text-lg font-semibold text-white">{card.title}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-label text-amber-500/80">Your recommendation</p>
            {rank != null && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                #{rank}
              </span>
            )}
            {section && (
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
                {section === "best-value" ? "Best Value" : "Best Overall"}
              </span>
            )}
          </div>
          <h3 className="headline mt-1 text-2xl text-zinc-50">{card.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {card.artist} · {card.series}
          </p>
          {card.description && (
            <p className="mt-2 text-xs text-zinc-500">{card.description}</p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-center">
              <p className="text-[9px] uppercase text-zinc-500">Ask</p>
              <p className="text-sm font-bold text-emerald-400">
                ${card.floorPrice.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-center">
              <p className="text-[9px] uppercase text-zinc-500">FMV</p>
              <p className="text-sm font-bold text-zinc-200">
                ${card.fmv.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-center">
              <p className="text-[9px] uppercase text-zinc-500">Match</p>
              <p className="text-sm font-bold text-amber-400">
                {resonanceScore != null
                  ? `${(resonanceScore * 100).toFixed(0)}%`
                  : "—"}
              </p>
            </div>
          </div>

          {fmvDelta > 3 && (
            <p className="mt-3 text-xs font-medium text-sky-400">
              {fmvDelta.toFixed(0)}% below FMV — potential value entry
            </p>
          )}

          {valueInsight && (
            <p className="mt-3 text-xs text-sky-400/90">{valueInsight}</p>
          )}

          {explanation && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {explanation}
            </p>
          )}

          {valueScore != null && (
            <p className="mt-2 text-[10px] text-zinc-500">
              Value score: {(valueScore * 100).toFixed(0)}% · Liquidity{" "}
              {(card.liquidity * 100).toFixed(0)}%
            </p>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta text-center"
            >
              Buy on Renaiss ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}