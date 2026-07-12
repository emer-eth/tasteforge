"use client";

import { Reveal } from "@/components/motion/Reveal";
import { scrollToSection } from "@/lib/scroll-to-section";

export function FooterCta() {
  return (
    <section id="pricing" className="scroll-mt-28 py-10">
      <Reveal>
        <div className="footer-cta flex flex-col items-start gap-6 px-7 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-12 sm:py-10">
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(216,181,107,0.35), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative flex items-start gap-5">
            <span
              className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--gold)]/40 sm:flex"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, rgba(216,181,107,0.25), transparent 60%), rgba(23,21,17,0.9)",
              }}
              aria-hidden
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8z"
                  stroke="var(--gold)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="headline text-[clamp(1.5rem,3vw,2.25rem)] text-[#f5f3ee]">
                Unlock the full power of AI collector intelligence
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-2)]">
                Deeper analysis, real-time alerts, portfolio tracking, and
                exclusive below-FMV access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              scrollToSection("analyze", {
                focusSelector: "#wallet-address-input",
              })
            }
            className="btn-gold relative shrink-0"
          >
            Start your analysis <span aria-hidden>→</span>
          </button>
        </div>
      </Reveal>
    </section>
  );
}
