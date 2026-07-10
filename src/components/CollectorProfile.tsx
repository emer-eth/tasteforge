"use client";

import { useEffect, useMemo, useState } from "react";
import { xProfileUrl } from "@/lib/collector/x-handle";
import {
  computePortfolioStats,
  formatUsd,
  recentSnapshotActivity,
  sortHoldingsForDisplay,
} from "@/lib/collector/portfolio-stats";
import type { CollectorData, RenaissCard } from "@/lib/types";

interface CollectorProfileProps {
  data: CollectorData;
}

function HoldingRow({ card }: { card: RenaissCard }) {
  const listed = Boolean(card.isListed && card.askPrice != null);
  const qty = card.editionSize > 0 ? card.editionSize : 1;

  return (
    <a
      href={`https://www.renaiss.xyz/card/${card.tokenId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-2.5 py-2 transition-colors hover:border-[#c9a961]/35 hover:bg-black/40"
    >
      {card.imageUrl.startsWith("http") ? (
        <img
          src={card.imageUrl}
          alt=""
          className="h-14 w-10 shrink-0 rounded-md border border-white/10 object-cover"
        />
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-stone-900 text-[8px] text-stone-600">
          Card
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-stone-200">
          {card.title}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-stone-500">
          {card.description || card.series}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {listed ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
              Listed
            </span>
          ) : (
            <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-sky-300">
              Holding
            </span>
          )}
          <span className="font-mono text-[10px] text-stone-500">×{qty}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        {listed && card.askPrice != null && (
          <p className="font-mono text-xs font-semibold text-emerald-400">
            {formatUsd(card.askPrice)}
          </p>
        )}
        <p
          className={`font-mono text-[10px] ${listed ? "text-stone-500" : "text-stone-300"}`}
        >
          {listed ? `FMV ${formatUsd(card.fmv)}` : formatUsd(card.fmv)}
        </p>
        {!listed && (
          <p className="text-[9px] uppercase tracking-wide text-stone-600">
            est. FMV
          </p>
        )}
      </div>
    </a>
  );
}

export function CollectorProfile({ data }: CollectorProfileProps) {
  const { profile, collection, socialSignals, tasteQuizLabels, visionAnalysis } =
    data;
  const hasHoldings = collection.length > 0;
  const [showHoldings, setShowHoldings] = useState(true);

  // Auto-expand when holdings arrive after analyze
  useEffect(() => {
    if (collection.length > 0) setShowHoldings(true);
  }, [collection.length]);

  const stats = useMemo(
    () => computePortfolioStats(collection),
    [collection],
  );
  const sortedHoldings = useMemo(
    () => sortHoldingsForDisplay(collection),
    [collection],
  );
  const recentActivity = useMemo(
    () => recentSnapshotActivity(data.activityHistory, 6),
    [data.activityHistory],
  );

  return (
    <section className="panel flex min-h-[320px] flex-col p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="avatar-ring shrink-0">
            <div className="avatar-inner">
              {(profile.displayName[0] ?? "?").toUpperCase()}
            </div>
          </div>
          <div>
            <p className="section-label text-stone-500">Collector Signals</p>
            <h2 className="headline mt-1 text-xl text-stone-50">
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
              <p className="font-mono text-xs text-stone-500">
                {profile.walletAddress.slice(0, 8)}…
                {profile.walletAddress.slice(-6)}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-stone-500">
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

      <p className="mb-4 text-sm leading-relaxed text-stone-300">{profile.bio}</p>

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
              <span key={label} className="badge-violet px-2.5 py-1 text-xs">
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
              <span key={signal} className="badge-gold px-2.5 py-1 text-xs">
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
              className="rounded-full bg-stone-800 px-2.5 py-1 text-xs text-stone-300"
            >
              {pref}
            </span>
          ))}
        </div>
      )}

      {/* On-chain holdings — portfolio value, cards, recent listing activity */}
      {hasHoldings ? (
        <div className="mt-auto border-t border-stone-800 pt-4">
          <button
            type="button"
            onClick={() => setShowHoldings((v) => !v)}
            className="section-label flex w-full items-center justify-between text-left text-stone-500 transition-colors hover:text-stone-300"
          >
            <span>On-chain holdings ({stats.cardCount})</span>
            <span className="text-base">{showHoldings ? "−" : "+"}</span>
          </button>

          {showHoldings && (
            <div className="mt-3 space-y-4">
              {/* Portfolio totals */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="stat-tile !p-3">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">
                    Est. portfolio
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold text-[#e8cf8e]">
                    {formatUsd(stats.totalFmv)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-stone-600">Sum of FMV</p>
                </div>
                <div className="stat-tile !p-3">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">
                    Live asks
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold text-emerald-400">
                    {stats.listedCount > 0
                      ? formatUsd(stats.totalListedAsk)
                      : "—"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-stone-600">
                    {stats.listedCount} listed
                  </p>
                </div>
                <div className="stat-tile !p-3">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">
                    Cards held
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold text-stone-100">
                    {stats.cardCount}
                  </p>
                  <p className="mt-0.5 text-[9px] text-stone-600">
                    ×1 each (unique NFTs)
                  </p>
                </div>
                <div className="stat-tile !p-3">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">
                    Mark value
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold text-stone-100">
                    {formatUsd(stats.totalMark)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-stone-600">
                    Ask if listed, else FMV
                  </p>
                </div>
              </div>

              {/* Card list with amounts + values */}
              <div>
                <p className="section-label mb-2 text-stone-500">
                  Holdings · qty &amp; value
                </p>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1 sm:max-h-80">
                  {sortedHoldings.map((card) => (
                    <HoldingRow key={card.id} card={card} />
                  ))}
                </div>
              </div>

              {/* Recent marketplace activity (honest snapshot) */}
              {recentActivity.length > 0 && (
                <div>
                  <p className="section-label mb-2 text-stone-500">
                    Recent marketplace activity
                  </p>
                  <p className="mb-2 text-[10px] text-stone-600">
                    Live listings &amp; holdings from Renaiss scan — not full
                    chain transfer history
                  </p>
                  <ul className="space-y-1.5">
                    {recentActivity.map((event) => (
                      <li
                        key={event.id}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-black/20 px-2.5 py-2"
                      >
                        {event.imageUrl?.startsWith("http") ? (
                          <img
                            src={event.imageUrl}
                            alt=""
                            className="h-9 w-7 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-9 w-7 shrink-0 rounded bg-stone-800" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                                event.type === "listed"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                  : "border-sky-500/25 bg-sky-500/10 text-sky-300"
                              }`}
                            >
                              {event.type === "listed" ? "Listed" : "Holding"}
                            </span>
                            <span className="truncate text-[11px] text-stone-300">
                              {event.cardTitle}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-stone-600">
                            {event.note}
                          </p>
                        </div>
                        <div className="shrink-0 text-right font-mono text-[10px] text-stone-400">
                          {event.price != null && (
                            <p className="text-emerald-400">
                              {formatUsd(event.price)}
                            </p>
                          )}
                          {event.fmv != null && event.price == null && (
                            <p>{formatUsd(event.fmv)}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        !socialSignals?.length && (
          <p className="mt-auto border-t border-stone-800 pt-4 text-xs text-stone-500">
            Add social taste notes above — TasteForge recommends from the full
            Renaiss marketplace, not just current holdings.
          </p>
        )
      )}
    </section>
  );
}
