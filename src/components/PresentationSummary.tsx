"use client";

import { useState } from "react";
import type { TasteForgeResult } from "@/lib/types";
import { buildShareUrl } from "@/lib/url/share-params";

interface PresentationSummaryProps {
  result: TasteForgeResult;
  socialText?: string;
  xHandle?: string;
}

function shortWallet(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function PresentationSummary({
  result,
  socialText,
  xHandle,
}: PresentationSummaryProps) {
  const [copied, setCopied] = useState(false);

  const topOverall = result.bestOverall[0];
  const topValue = result.bestValue[0];
  const topPair = result.consecutivePairs[0];

  const summaryText = [
    `TasteForge · ${result.tasteVector.tasteArchetype || "Collector"}`,
    `Wallet ${shortWallet(result.walletAddress ?? "")} · ${result.collectorMode}`,
    topOverall
      ? `Best Overall: ${topOverall.card.title} ($${topOverall.card.floorPrice})`
      : null,
    topValue
      ? `Best Value: ${topValue.card.title} ($${topValue.card.floorPrice})`
      : null,
    topPair ? `Pair: ${topPair.serialRange} · ${topPair.card1.name}` : null,
    `${result.catalogSize} live cards scored · ${result.processingMode} analysis`,
  ]
    .filter(Boolean)
    .join("\n");

  const shareUrl = buildShareUrl({
    walletAddress: result.walletAddress,
    socialText,
    xHandle,
    autoAnalyze: true,
  });

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(`${summaryText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="presentation"
      className="panel-gold scroll-mt-24 rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label text-[#c9a961]">Presentation snapshot</p>
          <h2 className="headline mt-2 text-2xl text-stone-50">
            Demo-ready summary
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Screenshot-friendly card for judges — copy or share a pre-filled link.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copySummary}
            className="btn-cta !px-4 !py-2 !text-xs"
          >
            {copied ? "Copied!" : "Copy summary"}
          </button>
          {shareUrl && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* ignore */
                }
              }}
              className="btn-ghost !text-xs"
            >
              Copy share link
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-tile">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Wallet
          </p>
          <p className="mt-1 font-mono text-sm text-stone-200">
            {shortWallet(result.walletAddress ?? "")}
          </p>
          <p className="mt-1 text-xs capitalize text-teal-300/90">
            {result.collectorMode.replace("-", " ")}
          </p>
        </div>

        <div className="stat-tile">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Archetype
          </p>
          <p className="headline mt-1 text-lg text-gradient-brand">
            {result.tasteVector.tasteArchetype || "Analyzing…"}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {result.processingMode === "llm" ? "LLM analysis" : "Live analysis"}
          </p>
        </div>

        <div className="stat-tile border-[#c9a961]/20 bg-[#c9a961]/5">
          <p className="text-[10px] uppercase tracking-wider text-[#c9a961]/80">
            Best Overall
          </p>
          {topOverall && (
            <img
              src={topOverall.card.imageUrl}
              alt=""
              className="mt-2 h-20 w-14 rounded-lg border border-white/10 object-cover shadow-lg"
            />
          )}
          <p className="mt-2 text-sm font-medium text-stone-100">
            {topOverall?.card.title ?? "—"}
          </p>
          {topOverall && (
            <p className="mt-1 text-xs text-stone-400">
              ${topOverall.card.floorPrice} ·{" "}
              {(topOverall.resonanceScore * 100).toFixed(0)}% match
            </p>
          )}
        </div>

        <div className="stat-tile border-sky-500/20 bg-sky-500/5">
          <p className="text-[10px] uppercase tracking-wider text-sky-400/80">
            Best Value
          </p>
          {topValue && (
            <img
              src={topValue.card.imageUrl}
              alt=""
              className="mt-2 h-20 w-14 rounded-lg border border-white/10 object-cover shadow-lg"
            />
          )}
          <p className="mt-2 text-sm font-medium text-stone-100">
            {topValue?.card.title ?? "—"}
          </p>
          {topValue && (
            <p className="mt-1 text-xs text-stone-400">
              ${topValue.card.floorPrice} · {topValue.valueInsight}
            </p>
          )}
        </div>
      </div>

      {topPair && (
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-stone-300">
          <span className="font-medium text-violet-300">Top pair:</span>{" "}
          {topPair.serialRange} · {topPair.card1.name} + {topPair.card2.name} ·
          ${topPair.totalCost.toLocaleString()} total
        </div>
      )}

      {topOverall?.explanation && (
        <p className="mt-4 text-sm leading-relaxed text-stone-400">
          <span className="font-medium text-stone-300">Why #1:</span>{" "}
          {topOverall.explanation}
        </p>
      )}
    </section>
  );
}