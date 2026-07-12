"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MarketplaceListing } from "@/lib/types";

/** Small circular progress ring for the "Collector Match" widget. */
function MatchRing({ pct }: { pct: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

/** Position of a card relative to the focused one. */
function slot(d: number) {
  const abs = Math.abs(d);
  if (abs > 2) {
    return {
      x: d < 0 ? -420 : 420,
      scale: 0.5,
      opacity: 0,
      blur: 6,
      z: 0,
      rotateY: 0,
      pointer: false,
    };
  }
  if (abs === 0)
    return { x: 0, scale: 1, opacity: 1, blur: 0, z: 30, rotateY: 0, pointer: true };
  if (abs === 1)
    return {
      x: d < 0 ? -190 : 190,
      scale: 0.78,
      opacity: 0.55,
      blur: 2,
      z: 20,
      rotateY: d < 0 ? 14 : -14,
      pointer: true,
    };
  return {
    x: d < 0 ? -310 : 310,
    scale: 0.62,
    opacity: 0.3,
    blur: 3.5,
    z: 10,
    rotateY: d < 0 ? 20 : -20,
    pointer: true,
  };
}

export function HeroShowcase() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const interacted = useRef(false);

  useEffect(() => {
    fetch("/api/listings?limit=12")
      .then((r) => r.json())
      .then((d) =>
        setListings(
          (d.listings ?? [])
            .filter((c: MarketplaceListing) => c.imageUrl?.startsWith("http"))
            .slice(0, 10),
        ),
      )
      .catch(() => {});
  }, []);

  // gentle autoplay until the user interacts
  useEffect(() => {
    if (reduce || listings.length < 2) return;
    const id = setInterval(() => {
      if (interacted.current) return;
      setActive((a) => (a + 1) % listings.length);
    }, 3800);
    return () => clearInterval(id);
  }, [reduce, listings.length]);

  const n = listings.length;
  const focus = (i: number) => {
    interacted.current = true;
    setActive(i);
  };
  const step = (dir: number) => {
    interacted.current = true;
    setActive((a) => (a + dir + n) % n);
  };

  return (
    <div className="showcase-stage relative mx-auto flex h-[520px] w-full max-w-[600px] items-center justify-center sm:h-[560px]">
      <div className="relative h-full w-full" style={{ perspective: "1400px" }}>
        {listings.map((card, i) => {
          // shortest signed distance around the ring
          let d = i - active;
          if (n > 1) {
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;
          }
          const s = slot(d);
          const isCenter = d === 0;
          const grade = card.grade ? `${card.grader} ${card.grade}` : "PSA 10";
          return (
            <motion.button
              key={card.tokenId}
              type="button"
              onClick={() => (isCenter ? undefined : focus(i))}
              aria-label={isCenter ? card.name : `Focus ${card.name}`}
              aria-hidden={s.opacity === 0}
              tabIndex={s.pointer && !isCenter ? 0 : -1}
              className="absolute left-1/2 top-1/2 w-[220px] sm:w-[248px]"
              style={{
                marginLeft: "-110px",
                marginTop: "-165px",
                zIndex: s.z,
                cursor: isCenter ? "default" : "pointer",
                pointerEvents: s.pointer ? "auto" : "none",
              }}
              initial={false}
              animate={{
                x: s.x,
                scale: s.scale,
                opacity: s.opacity,
                rotateY: s.rotateY,
                filter: `blur(${s.blur}px)`,
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 200, damping: 28 }
              }
            >
              <div
                className={isCenter ? "showcase-slab overflow-hidden" : "overflow-hidden rounded-2xl border"}
                style={
                  isCenter
                    ? undefined
                    : { borderColor: "rgba(255,255,255,0.08)", background: "#0e0c09" }
                }
              >
                {isCenter && (
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#f5f0e4] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[9px] font-semibold uppercase tracking-wide text-[#1a140c]">
                        {card.setName || "Renaiss"} {card.year ?? ""}
                      </p>
                      <p className="truncate font-mono text-[8px] text-[#6b5a3e]">
                        {card.name}
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-[#1a140c] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#f1d18a]">
                      {grade}
                    </span>
                  </div>
                )}
                <div className="aspect-[3/4] w-full bg-[#0e0c09]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="h-full w-full object-cover"
                    loading={i < 4 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Collector Match widget — top right */}
      <motion.div
        className="float-widget anim-float pointer-events-none absolute right-0 top-4 z-40 flex items-center gap-3 px-4 py-3"
        aria-hidden
      >
        <MatchRing pct={95} />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--ink-3)]">
            Collector Match
          </p>
          <p className="text-2xl font-semibold text-[#f5f3ee]">95%</p>
          <p className="text-[10px] text-[var(--gold)]">Top 1% match</p>
        </div>
      </motion.div>

      {/* Archetypes discovered widget — bottom */}
      <motion.div
        className="float-widget anim-float-delay pointer-events-none absolute bottom-2 right-6 z-40 flex items-center gap-3 px-4 py-3"
        aria-hidden
      >
        <div className="flex -space-x-2">
          {["#d8b56b", "#b49ede", "#3fa98a", "#d4847a"].map((c) => (
            <span
              key={c}
              className="h-7 w-7 rounded-full border-2 border-[#11100d]"
              style={{ background: `linear-gradient(135deg, ${c}, #171511)` }}
            />
          ))}
        </div>
        <div>
          <p className="text-lg font-semibold text-[#f5f3ee]">150+</p>
          <p className="text-[10px] text-[var(--ink-3)]">
            Collector archetypes
            <br />
            discovered
          </p>
        </div>
      </motion.div>

      {/* Nav arrows */}
      {n > 1 && (
        <div className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous card"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[#11100d]/80 text-[var(--ink-2)] backdrop-blur transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {listings.map((c, i) => (
              <button
                key={c.tokenId}
                type="button"
                onClick={() => focus(i)}
                aria-label={`Card ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === active ? 18 : 6,
                  background: i === active ? "var(--gold)" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next card"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[#11100d]/80 text-[var(--ink-2)] backdrop-blur transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
