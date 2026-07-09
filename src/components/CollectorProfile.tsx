"use client";

import { useState } from "react";
import { xProfileUrl } from "@/lib/collector/x-handle";
import type { CollectorData } from "@/lib/types";

interface CollectorProfileProps {
  data: CollectorData;
}

export function CollectorProfile({ data }: CollectorProfileProps) {
  const { profile, collection, socialSignals, tasteQuizLabels, visionAnalysis } =
    data;
  const [showHoldings, setShowHoldings] = useState(false);

  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="avatar-ring shrink-0">
            <div className="avatar-inner">
              {(profile.displayName[0] ?? "?").toUpperCase()}
            </div>
          </div>
          <div>
          <p className="section-label text-zinc-500">Collector Signals</p>
          <h2 className="headline mt-1 text-xl text-zinc-50">
            {profile.displayName}
          </h2>
          {profile.xHandle && (
            <a
              href={xProfileUrl(profile.xHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-sky-400 transition-colors hover:text-sky-300"
            >
              @{profile.xHandle} ↗
            </a>
          )}
          {profile.walletAddress && (
            <p className="font-mono text-xs text-zinc-500">
              {profile.walletAddress.slice(0, 8)}…{profile.walletAddress.slice(-6)}
            </p>
          )}
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-zinc-500">
          {data.collectorMode && (
            <p
              className={
                data.collectorMode === "holder"
                  ? "text-emerald-500"
                  : data.collectorMode === "social-only"
                    ? "text-amber-500"
                    : ""
              }
            >
              {data.collectorMode === "holder"
                ? "Card holder"
                : data.collectorMode === "social-only"
                  ? "Non-holder"
                  : "Non-holder"}
            </p>
          )}
          <p>
            {socialSignals?.length ?? 0} taste signals
            {tasteQuizLabels?.length
              ? ` · ${tasteQuizLabels.length} quiz picks`
              : ""}
          </p>
          <p>{collection.length} holdings</p>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-300">{profile.bio}</p>

      {visionAnalysis && visionAnalysis.analyzedCards.length > 0 && (
        <div className="panel-violet mb-4 rounded-xl p-3">
          <p className="section-label mb-2 text-violet-300">
            Visual taste (multimodal)
          </p>
          <p className="mb-3 text-xs leading-relaxed text-stone-400">
            {visionAnalysis.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {visionAnalysis.analyzedCards.map((card) => (
              <div
                key={card.tokenId}
                className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-black/30 px-2 py-1.5"
              >
                <img
                  src={card.imageUrl}
                  alt=""
                  className="h-12 w-9 rounded object-cover"
                />
                <span className="max-w-[140px] truncate text-[10px] text-stone-300">
                  {card.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasteQuizLabels && tasteQuizLabels.length > 0 && (
        <div className="panel-violet mb-4 rounded-xl p-3">
          <p className="section-label mb-2 text-violet-300">
            Quick taste profile
          </p>
          <div className="flex flex-wrap gap-2">
            {tasteQuizLabels.map((label) => (
              <span
                key={label}
                className="badge-violet px-2.5 py-1 text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {socialSignals && socialSignals.length > 0 && (
        <div className="panel-gold mb-4 rounded-xl p-3">
          <p className="section-label mb-2 text-[#c9a961]">Taste signals</p>
          <div className="flex flex-wrap gap-2">
            {socialSignals.map((signal) => (
              <span
                key={signal}
                className="badge-gold px-2.5 py-1 text-xs"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.statedPreferences.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {profile.statedPreferences.map((pref) => (
            <span
              key={pref}
              className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
            >
              {pref}
            </span>
          ))}
        </div>
      )}

      {collection.length > 0 && (
        <div className="border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => setShowHoldings((v) => !v)}
            className="flex w-full items-center justify-between text-left section-label text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <span>On-chain holdings ({collection.length})</span>
            <span>{showHoldings ? "−" : "+"}</span>
          </button>

          {showHoldings && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {collection.map((card) => (
                <div
                  key={card.id}
                  className="overflow-hidden rounded-lg border border-zinc-700/50"
                >
                  {card.imageUrl.startsWith("http") ? (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div
                      className="aspect-[3/4] w-full"
                      style={{
                        background: `linear-gradient(145deg, ${card.colorPalette[0]}, ${card.colorPalette[1] ?? card.colorPalette[0]})`,
                      }}
                    />
                  )}
                  <p className="truncate px-1.5 py-1 text-[10px] text-zinc-400">
                    {card.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {collection.length === 0 && !socialSignals?.length && (
        <p className="border-t border-zinc-800 pt-4 text-xs text-zinc-500">
          Add social taste notes above — TasteForge recommends from the full
          Renaiss marketplace, not just current holdings.
        </p>
      )}
    </section>
  );
}