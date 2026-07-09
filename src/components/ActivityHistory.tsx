import type { CollectorActivityEvent, CollectorMode } from "@/lib/types";

const EVENT_STYLES: Record<
  CollectorActivityEvent["type"],
  { label: string; color: string }
> = {
  acquired: { label: "Acquired", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  holding: { label: "Holding", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  listed: { label: "Listed", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  sold: { label: "Sold", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  transferred_in: { label: "Transfer In", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  transferred_out: { label: "Transfer Out", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30" },
  bid: { label: "Bid", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
};

interface ActivityHistoryProps {
  events: CollectorActivityEvent[];
  collectorMode?: CollectorMode;
}

export function ActivityHistory({ events, collectorMode }: ActivityHistoryProps) {
  return (
    <section className="panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="section-label text-zinc-500">Trade & Hold History</p>
          <p className="mt-1 text-sm text-zinc-400">
            Acquisitions, listings, sales, and transfers
          </p>
        </div>
        {collectorMode && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              collectorMode === "holder"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : collectorMode === "social-only"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-zinc-600 bg-zinc-800 text-zinc-400"
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
        <div className="rounded-xl border border-dashed border-zinc-800 py-10 text-center">
          <p className="text-sm text-zinc-400">No Renaiss trade history yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Non-holders still get full recommendations from social taste signals
            — no cards required.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => {
            const style = EVENT_STYLES[event.type];
            return (
              <li
                key={event.id}
                className="flex gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3"
              >
                {event.imageUrl?.startsWith("http") || event.imageUrl?.startsWith("/") ? (
                  <img
                    src={event.imageUrl}
                    alt={event.cardTitle}
                    className="h-14 w-10 shrink-0 rounded-lg border border-zinc-700 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-[8px] text-zinc-500">
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
                    <time className="text-[10px] text-zinc-500">
                      {new Date(event.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-zinc-200">
                    {event.cardTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{event.note}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-zinc-400">
                    {event.price != null && (
                      <span className="text-emerald-400/90">
                        ${event.price.toFixed(0)}
                      </span>
                    )}
                    {event.fmv != null && <span>FMV ${event.fmv.toFixed(0)}</span>}
                    {event.counterparty && (
                      <span>→ {event.counterparty}</span>
                    )}
                  </div>
                </div>

                <a
                  href={`https://www.renaiss.xyz/card/${event.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 self-center text-[10px] text-zinc-500 hover:text-amber-400"
                >
                  View ↗
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}