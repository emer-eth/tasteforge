"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketplaceListing, TasteForgeResult } from "@/lib/types";
import {
  deriveNotifications,
  deriveWishlist,
  type NotificationItem,
} from "@/lib/intelligence/derive";
import {
  DEFAULT_PREFS,
  getPrefs,
  getReadNotifications,
  getSavedWishlist,
  getWatching,
  markNotificationsRead,
  setPrefs,
  setWatching,
  toggleWishlistId,
  type NotificationPrefs,
} from "@/lib/store/local-store";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all ${
        on
          ? "border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--gold-hover)]"
          : "border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--gold)]/30"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${on ? "bg-[var(--gold)]" : "bg-[var(--ink-3)]"}`}
        aria-hidden
      />
      {label}
    </button>
  );
}

const KIND_ICON: Record<NotificationItem["kind"], string> = {
  match: "◆",
  belowFmv: "▼",
  wishlist: "★",
  milestone: "✦",
};

export function CollectorConsole({ result }: { result: TasteForgeResult }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [prefs, setPrefsState] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [watching, setWatchingState] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [read, setRead] = useState<string[]>([]);

  useEffect(() => {
    setPrefsState(getPrefs());
    setWatchingState(getWatching());
    setSaved(getSavedWishlist());
    setRead(getReadNotifications());
  }, []);

  useEffect(() => {
    fetch("/api/listings?limit=48")
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .catch(() => {});
  }, []);

  const wishlist = useMemo(() => deriveWishlist(result), [result]);
  const notifications = useMemo(
    () => deriveNotifications(result, listings, prefs),
    [result, listings, prefs],
  );
  const unread = notifications.filter((n) => !read.includes(n.id)).length;

  const updatePref = (patch: Partial<NotificationPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefsState(next);
    setPrefs(next);
  };
  const toggleWatch = () => {
    const v = !watching;
    setWatchingState(v);
    setWatching(v);
  };

  const groups: NotificationItem["group"][] = ["Today", "This week"];

  return (
    <section id="curator" className="scroll-mt-28 space-y-6 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label text-[var(--gold)]">Your AI curator</p>
          <h2 className="headline mt-2 text-[clamp(1.5rem,3vw,2.25rem)] text-[#f5f3ee]">
            Working on your behalf
          </h2>
        </div>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] text-[var(--ink-3)]">
          Preview · live delivery ships with accounts
        </span>
      </div>

      {/* Watch banner */}
      <div className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[var(--gold)]" aria-hidden>
            ◉
          </span>
          <div>
            <p className="font-medium text-[#f5f3ee]">Watch My Market</p>
            <p className="text-sm text-[var(--ink-2)]">
              Continuously scan new Renaiss listings against your taste and alert
              you to matches — no manual searching.
            </p>
          </div>
        </div>
        <Toggle
          on={watching}
          onClick={toggleWatch}
          label={watching ? "Watching" : "Enable"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Notification Center */}
        <div className="glass-card rounded-[20px] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="section-label text-[var(--gold)]">Notifications</p>
              {unread > 0 && (
                <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--gold)]">
                  {unread} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setRead(markNotificationsRead(notifications.map((n) => n.id)))}
                className="text-xs text-[var(--ink-3)] transition-colors hover:text-[var(--gold)]"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-4 space-y-5">
            {notifications.length === 0 && (
              <p className="text-sm text-[var(--ink-3)]">
                No alerts match your current preferences. Loosen the match
                threshold or filters to see more.
              </p>
            )}
            {groups.map((g) => {
              const items = notifications.filter((n) => n.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-[var(--ink-3)]">
                    {g}
                  </p>
                  <ul className="space-y-2">
                    {items.map((n) => {
                      const isRead = read.includes(n.id);
                      const body = (
                        <div
                          className={`flex items-start gap-3 rounded-xl border border-[var(--border)] px-3 py-3 transition-colors ${
                            isRead ? "opacity-60" : "bg-white/[0.02]"
                          }`}
                        >
                          <span className="mt-0.5 text-sm text-[var(--gold)]" aria-hidden>
                            {KIND_ICON[n.kind]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="truncate text-sm font-medium text-[#f5f3ee]">
                                {n.title}
                              </p>
                              {n.meta && (
                                <span className="shrink-0 text-[11px] font-medium text-[var(--gold)]">
                                  {n.meta}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ink-2)]">
                              {n.detail}
                            </p>
                          </div>
                        </div>
                      );
                      return (
                        <li key={n.id}>
                          {n.tokenId ? (
                            <a
                              href={`https://www.renaiss.xyz/card/${n.tokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {body}
                            </a>
                          ) : (
                            body
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card rounded-[20px] p-6">
          <p className="section-label text-[var(--gold)]">Alert preferences</p>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label htmlFor="match-threshold" className="text-sm text-[var(--ink-2)]">
                Min match score
              </label>
              <span className="font-mono text-xs text-[var(--gold)]">
                {prefs.matchThreshold}%
              </span>
            </div>
            <input
              id="match-threshold"
              type="range"
              min={40}
              max={99}
              value={prefs.matchThreshold}
              onChange={(e) => updatePref({ matchThreshold: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--gold)]"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="max-price" className="text-sm text-[var(--ink-2)]">
              Max price (USD)
            </label>
            <input
              id="max-price"
              type="number"
              min={0}
              placeholder="Any"
              value={prefs.maxPrice ?? ""}
              onChange={(e) =>
                updatePref({
                  maxPrice: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="input-brand mt-1.5 w-full px-3 py-2 text-sm"
            />
          </div>

          <p className="mt-5 text-[11px] uppercase tracking-wider text-[var(--ink-3)]">
            Filters
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Toggle on={prefs.belowFmvOnly} onClick={() => updatePref({ belowFmvOnly: !prefs.belowFmvOnly })} label="Below FMV only" />
            <Toggle on={prefs.gradedOnly} onClick={() => updatePref({ gradedOnly: !prefs.gradedOnly })} label="Graded only" />
            <Toggle on={prefs.vintageOnly} onClick={() => updatePref({ vintageOnly: !prefs.vintageOnly })} label="Vintage only" />
            <Toggle on={prefs.wishlistOnly} onClick={() => updatePref({ wishlistOnly: !prefs.wishlistOnly })} label="Wishlist only" />
          </div>

          <p className="mt-5 text-[11px] uppercase tracking-wider text-[var(--ink-3)]">
            Channels
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["inApp", "email", "push", "telegram"] as const).map((c) => (
              <Toggle
                key={c}
                on={prefs.channels[c]}
                onClick={() =>
                  updatePref({ channels: { ...prefs.channels, [c]: !prefs.channels[c] } })
                }
                label={c === "inApp" ? "In-app" : c.charAt(0).toUpperCase() + c.slice(1)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Wishlist */}
      <div className="glass-card rounded-[20px] p-6">
        <p className="section-label text-[var(--gold)]">AI Wishlist · recommended next</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((w) => {
            const isSaved = saved.includes(w.id);
            return (
              <div
                key={w.id}
                className="flex gap-3 rounded-xl border border-[var(--border)] p-3"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#0e0c09]">
                  {w.imageUrl?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.imageUrl} alt={w.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-[#f5f3ee]">
                    {w.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-[var(--ink-2)]">
                    {w.reason}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--gold)]">
                      {w.matchPct}% · {money(w.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSaved(toggleWishlistId(w.id))}
                      className={`rounded-full border px-2 py-0.5 text-[10px] transition-all ${
                        isSaved
                          ? "border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--gold-hover)]"
                          : "border-[var(--border)] text-[var(--ink-3)] hover:border-[var(--gold)]/30"
                      }`}
                    >
                      {isSaved ? "Saved ★" : "Notify me"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
