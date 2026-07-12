"use client";

import { motion } from "framer-motion";
import { HeroShowcase } from "@/components/landing/HeroShowcase";
import { scrollToSection } from "@/lib/scroll-to-section";

const AVATAR_COLORS = ["#d8b56b", "#b49ede", "#3fa98a", "#d4847a"];

export function HeroSection({
  onSeeExample,
}: {
  onSeeExample?: () => void;
}) {
  const goAnalyze = () =>
    scrollToSection("analyze", { focusSelector: "#wallet-address-input" });

  return (
    <section
      id="top"
      className="grid grid-cols-1 items-center gap-12 pt-14 pb-8 lg:grid-cols-[45fr_55fr] lg:gap-8 lg:pt-20"
    >
      {/* Left column */}
      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className="hero-badge w-fit">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
            aria-hidden
          />
          AI Collector Intelligence
        </span>

        <h1 className="headline text-[clamp(3rem,6.5vw,4.75rem)] text-[#f5f3ee]">
          Your wallet.
          <br />
          <span className="text-[var(--gold)]">Your taste.</span>
          <br />
          Our intelligence.
        </h1>

        <p className="max-w-[520px] text-[1.0625rem] leading-[1.7] text-[var(--ink-2)]">
          TasteForge analyzes your on-chain collectibles and taste signals to
          reveal your collector identity — then surfaces the best opportunities
          you might be missing.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={goAnalyze} className="btn-gold">
            Analyze my wallet <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("discover")}
            className="btn-glass"
          >
            New here? Discover your taste <span aria-hidden>→</span>
          </button>
        </div>

        {onSeeExample && (
          <button
            type="button"
            onClick={onSeeExample}
            className="w-fit text-sm text-[var(--ink-2)] underline decoration-[var(--ink-3)] decoration-dotted underline-offset-4 transition-colors hover:text-[var(--gold)]"
          >
            ▸ or watch a live example — no input needed
          </button>
        )}

        <div className="flex items-center gap-3 pt-1">
          <div className="flex -space-x-2.5">
            {AVATAR_COLORS.map((c) => (
              <span
                key={c}
                className="h-8 w-8 rounded-full border-2 border-[#090806]"
                style={{ background: `linear-gradient(135deg, ${c}, #171511)` }}
                aria-hidden
              />
            ))}
          </div>
          <p className="text-sm text-[var(--ink-2)]">
            Trusted by{" "}
            <span className="font-medium text-[#f5f3ee]">12,000+</span> collectors
            worldwide
          </p>
        </div>
      </motion.div>

      {/* Right column — cinematic showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <HeroShowcase />
      </motion.div>
    </section>
  );
}
