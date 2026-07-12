/**
 * Lightweight client-side persistence (localStorage).
 *
 * NOTE: This is deliberately local-only. Real cross-device persistence,
 * evolving-over-time profiles, and server-side monitoring are a later phase
 * that requires a backend (DB + auth + workers). Everything here is scoped to
 * the current browser and clearly surfaced as "preview" in the UI.
 */

import type { CollectorIdentity } from "@/lib/intelligence/derive";

const PREFIX = "tasteforge:v2:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

// --- Notification preferences ---------------------------------------------

export interface NotificationPrefs {
  matchThreshold: number; // 0..100
  maxPrice: number | null;
  belowFmvOnly: boolean;
  vintageOnly: boolean;
  japaneseOnly: boolean;
  gradedOnly: boolean;
  wishlistOnly: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
}

export const DEFAULT_PREFS: NotificationPrefs = {
  matchThreshold: 85,
  maxPrice: null,
  belowFmvOnly: false,
  vintageOnly: false,
  japaneseOnly: false,
  gradedOnly: false,
  wishlistOnly: false,
  channels: { inApp: true, email: false, push: false, telegram: false },
};

export const getPrefs = (): NotificationPrefs =>
  read("prefs", DEFAULT_PREFS);
export const setPrefs = (p: NotificationPrefs) => write("prefs", p);

// --- Watchlist toggle ------------------------------------------------------

export const getWatching = (): boolean => read("watching", false);
export const setWatching = (v: boolean) => write("watching", v);

// --- Saved wishlist ids ----------------------------------------------------

export const getSavedWishlist = (): string[] => read<string[]>("wishlist", []);
export function toggleWishlistId(id: string): string[] {
  const cur = getSavedWishlist();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  write("wishlist", next);
  return next;
}

// --- Read notifications ----------------------------------------------------

export const getReadNotifications = (): string[] =>
  read<string[]>("readNotifs", []);
export function markNotificationsRead(ids: string[]): string[] {
  const merged = [...new Set([...getReadNotifications(), ...ids])];
  write("readNotifs", merged);
  return merged;
}

// --- Collector identity history (evolves locally) --------------------------

export const getIdentityHistory = (): CollectorIdentity[] =>
  read<CollectorIdentity[]>("identityHistory", []);

export function pushIdentitySnapshot(
  identity: CollectorIdentity,
  savedAt: string,
): CollectorIdentity[] {
  const hist = getIdentityHistory();
  const last = hist[hist.length - 1];
  // dedupe: skip if archetype + tasteScore unchanged from last snapshot
  if (last && last.archetype === identity.archetype && last.tasteScore === identity.tasteScore) {
    return hist;
  }
  const next = [...hist, { ...identity, savedAt }].slice(-8);
  write("identityHistory", next);
  return next;
}
