"use client";

import { useMemo, useState } from "react";
import type { CollectorActivityEvent, CollectorMode } from "@/lib/types";

const EVENT_STYLES: Record<
  CollectorActivityEvent["type"],
  { label: string; color: string }
> = {
  acquired: {
    label: "Acquired",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  holding: {
    label: "Holding",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  },
  listed: {
    label: "Listed",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  sold: {
    label: "Sold",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  transferred_in: {
    label: "Transfer In",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  transferred_out: {
    label: "Transfer Out",
    color: "text-[var(--ink-2)] bg-zinc-500/10 border-zinc-500/30",
  },
  bid: {
    label: "Bid",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
};

const TOP = 5;

interface ActivityHistoryProps {
  events: CollectorActivityEvent[];
  collectorMode?: CollectorMode;
}

function formatObservedTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Snapshot";
  }
}

function EventRow({ event }: { event: CollectorActivityEvent }) {
  const style = EVENT_STYLES[event.type];
  return (
    <li className="flex gap-3 rounded-xl border border-[var(--border)]/80 bg-[#171511]/40 p-3">
      {event.imageUrl?.startsWith("http") || event.imageUrl?.startsWith("/") ? (
        <img
          src={event.imageUrl}
          alt={event.cardTitle}
          className="h-14 w-10 shrink-0 rounded-lg border border-[var(--border)] object-cover"
        />
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white/[0.06] text-[8px] text-[var(--ink-3)]">
          Card
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${style.color}`}
          >
            {style.label}
          </span>
          <time
            className="text-[10px] text-[var(--ink-3)]"
            title="Observation time of this scan — not an on-chain trade date"
          >
            As of {formatObservedTime(event.timestamp)}
          </time>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-[#f5f3ee]">
          {event.cardTitle}
        </p>
        <p className="mt-0.5 text-xs text-[var(--ink-3)]">{event.note}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-[var(--ink-2)]">
          {event.price != null && (
            <span className="text-emerald-400/90">Ask ${event.price.toFixed(0)}</span>
          )}
          {event.fmv != null && <span>FMV ${event.fmv.toFixed(0)}</span>}
          {event.counterparty && <span>→ {event.counterparty}</span>}
        </div>
      </div>

      <a
        href={`https://www.renaiss.xyz/card/${event.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 self-center text-[10px] text-[var(--ink-3)] hover:text-[#d8b56b]"
      >
        View ↗
      </a>
    </li>
  );
}

function EventGroup({
  title,
  events,
}: {
  title: string;
  events: CollectorActivityEvent[];
}) {
  const [showAll, setShowAll] = useState(false);
  if (events.length === 0) return null;
  const shown = showAll ? events : events.slice(0, TOP);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="section-label text-[var(--ink-3)]">
          {title}{" "}
          <span className="text-[var(--ink-3)]">({events.length})</span>
        </p>
        {events.length > TOP && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[11px] text-[#d8b56b] transition-colors hover:text-[#e8cf8e]"
          >
            {showAll ? "Show less" : `View all ${events.length} →`}
          </button>
        )}
      </div>
      <ol className="space-y-3">
        {shown.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ol>
      {!showAll && events.length > TOP && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-2 w-full rounded-xl border border-white/[0.06] bg-black/20 py-2 text-xs text-[var(--ink-2)] transition-colors hover:border-[#d8b56b]/30 hover:text-[#f5f3ee]"
        >
          View {events.length - TOP} more
        </button>
      )}
    </div>
  );
}

export function ActivityHistory({
  events,
  collectorMode,
}: ActivityHistoryProps) {
  const { listed, notListed, total } = useMemo(() => {
    // A listed card also has a "holding" event — collapse to unique cards so a
    // listed card appears only under "Listed", never duplicated under "Not listed".
    const listedTokens = new Set(
      events.filter((e) => e.type === "listed").map((e) => e.tokenId),
    );
    const l = events
      .filter((e) => e.type === "listed")
      .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    const n = events
      .filter((e) => e.type === "holding" && !listedTokens.has(e.tokenId))
      .sort((a, b) => (b.fmv ?? 0) - (a.fmv ?? 0));
    return { listed: l, notListed: n, total: l.length + n.length };
  }, [events]);

  return (
    <section className="panel p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="section-label text-[var(--ink-3)]">Holdings snapshot</p>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            Current Renaiss ownership + live listings — not reconstructed trade
            history
          </p>
          {total > 0 && (
            <p className="mt-1 text-[11px] text-[var(--ink-3)]">
              {total} card{total === 1 ? "" : "s"}
              {listed.length > 0 ? ` · ${listed.length} listed` : ""} · observed
              at scan time
            </p>
          )}
        </div>
        {collectorMode && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              collectorMode === "holder"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : collectorMode === "social-only"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-stone-600 bg-white/[0.06] text-[var(--ink-2)]"
            }`}
          >
            {collectorMode === "holder"
              ? "Card holder"
              : collectorMode === "social-only"
                ? "Non-holder · social taste"
                : "Non-holder"}
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
          <p className="text-sm text-[var(--ink-2)]">
            No Renaiss holdings found for this wallet
          </p>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            Non-holders still get full recommendations from social taste or the
            quick form — no cards required.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <EventGroup title="Listed on Renaiss" events={listed} />
          <EventGroup title="Not listed" events={notListed} />
        </div>
      )}
    </section>
  );
}
