"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** entrance delay in seconds */
  delay?: number;
  /** vertical offset before reveal */
  y?: number;
  className?: string;
}

/**
 * Fade + rise into view. Uses an IntersectionObserver with a guaranteed
 * fallback timer, so content can never get permanently stuck invisible if
 * the observer misfires. Respects reduced-motion (shows immediately).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const reveal = () => setShown(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);

    // Safety net: never leave content hidden if the observer never fires.
    const fallback = window.setTimeout(reveal, 1400);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [reduce]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
