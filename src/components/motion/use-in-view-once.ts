"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element scrolls into view, with a guaranteed fallback
 * timer so dependent animations can never get permanently stuck if the
 * IntersectionObserver misfires.
 */
export function useInViewOnce<T extends HTMLElement>(fallbackMs = 1400) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => setInView(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    const fallback = window.setTimeout(show, fallbackMs);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [fallbackMs]);

  return { ref, inView };
}
