"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

function IconWallet() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="13.5" r="1.4" fill="currentColor" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function IconIdentity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 16c.6-1.8 2-2.6 3-2.6s2.4.8 3 2.6M14 9.5h4M14 12.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconGem() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 4h12l3 5-9 11L3 9l3-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 9h18M9 4l-3 5 6 11 6-11-3-5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

const STEPS: Array<{ n: string; icon: ReactNode; title: string; body: string }> = [
  {
    n: "01",
    icon: <IconWallet />,
    title: "Paste a Wallet",
    body: "Paste any BNB wallet address — read-only. No connection, no keys, we never touch your assets.",
  },
  {
    n: "02",
    icon: <IconSpark />,
    title: "AI Analysis",
    body: "We analyze your collectibles, transactions, and taste signals across ten dimensions.",
  },
  {
    n: "03",
    icon: <IconIdentity />,
    title: "Reveal Identity",
    body: "Get your collector archetype and a taste vector that describes who you are.",
  },
  {
    n: "04",
    icon: <IconGem />,
    title: "Discover Opportunities",
    body: "See personalized picks and Best Value deals from the live Renaiss marketplace.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 py-16 lg:py-24">
      <Reveal className="text-center">
        <p className="section-label text-[var(--gold)]">How TasteForge works</p>
        <h2 className="headline mt-4 text-[clamp(2rem,4vw,3rem)] text-[#f5f3ee]">
          AI that understands collectors
        </h2>
      </Reveal>

      <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {/* connector line behind icons (desktop) */}
        <div
          className="step-connector absolute left-[12.5%] right-[12.5%] top-7 hidden lg:block"
          aria-hidden
        />
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12} className="relative text-center">
            <div className="mb-5 flex justify-center">
              <span className="step-icon is-lit relative z-[1]">{s.icon}</span>
            </div>
            <p className="font-mono text-xs text-[var(--gold)]">{s.n}</p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#f5f3ee]">
              {s.title}
            </h3>
            <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-[var(--ink-2)]">
              {s.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
