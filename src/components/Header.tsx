"use client";

import { useEffect, useState } from "react";
import { TasteForgeLogoMark } from "@/components/TasteForgeLogo";

const NAV_ITEMS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Marketplace", href: "/#marketplace" },
  { label: "Team", href: "/team" },
  { label: "Docs", href: "https://github.com/blueskylh/renaiss-scanner", external: true },
  { label: "About", href: "/#how-it-works" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-nav sticky top-0 z-50 ${scrolled ? "is-scrolled" : ""}`}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 md:px-12 lg:px-20">
        {/* Logo lockup */}
        <a
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-95"
        >
          <span className="nav-logo transition-transform group-hover:scale-[1.04]">
            <TasteForgeLogoMark size={26} />
          </span>
          <span className="leading-tight">
            <span className="block text-[22px] font-semibold tracking-tight text-[#f5f3ee] transition-colors group-hover:text-[var(--gold)]">
              TasteForge
            </span>
            <span className="block text-[11px] tracking-wide text-[var(--ink-3)]">
              Renaissance Taste Intelligence
            </span>
          </span>
        </a>

        {/* Center nav */}
        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="nav-link"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a href="/#analyze" className="btn-gold btn-gold-sm">
            Analyze wallet <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
