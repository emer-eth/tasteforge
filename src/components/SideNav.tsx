"use client";

import { useEffect, useState } from "react";
import { scrollToSection } from "@/lib/scroll-to-section";

export type SideNavSection =
  | "top"
  | "analyze"
  | "results"
  | "presentation"
  | "marketplace"
  | "assistant";

interface NavItem {
  id: SideNavSection;
  label: string;
  short: string;
  targetId?: string;
  focusSelector?: string;
  accent: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "top",
    label: "Top",
    short: "↑",
    targetId: "top",
    accent: "hover:border-stone-500/40",
  },
  {
    id: "analyze",
    label: "Wallet input",
    short: "⌁",
    targetId: "analyze",
    focusSelector: "#wallet-address-input",
    accent: "border-[#f5b942]/40 bg-[#f5b942]/10 text-[#f5b942] hover:bg-[#f5b942]/20",
  },
  {
    id: "results",
    label: "Results",
    short: "◎",
    targetId: "results",
    accent: "hover:border-teal-500/40 hover:text-teal-300",
  },
  {
    id: "presentation",
    label: "Presentation",
    short: "★",
    targetId: "presentation",
    accent: "hover:border-[#f5b942]/40 hover:text-[#f5b942]",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    short: "▦",
    targetId: "marketplace",
    accent: "hover:border-teal-500/40 hover:text-teal-300",
  },
  {
    id: "assistant",
    label: "Ask AI",
    short: "✦",
    accent: "hover:border-violet-500/40 hover:text-violet-300",
  },
];

interface SideNavProps {
  onOpenAssistant?: () => void;
  hasResults?: boolean;
}

export function SideNav({ onOpenAssistant, hasResults }: SideNavProps) {
  const [active, setActive] = useState<SideNavSection>("top");

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.id !== "presentation" || hasResults,
  );

  useEffect(() => {
    const sectionIds = [
      "top",
      "analyze",
      "results",
      ...(hasResults ? (["presentation"] as const) : []),
      "marketplace",
    ] as const;
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActive(sectionId);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [hasResults]);

  const handleClick = (item: NavItem) => {
    if (item.id === "assistant") {
      onOpenAssistant?.();
      setActive("assistant");
      return;
    }

    if (item.targetId) {
      scrollToSection(item.targetId, {
        focusSelector: item.focusSelector,
      });
      setActive(item.id);
    }
  };

  return (
    <>
      {/* Desktop — fixed right rail */}
      <nav
        className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex xl:right-6"
        aria-label="Page sections"
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            title={item.label}
            className={`group flex flex-row-reverse items-center gap-2 rounded-full border border-white/[0.08] bg-[#0a090d]/90 px-2 py-2 text-xs font-medium text-stone-400 shadow-lg backdrop-blur-md transition-all ${
              active === item.id
                ? item.id === "analyze"
                  ? "border-[#f5b942]/50 bg-[#f5b942]/15 text-[#f5b942] shadow-[0_0_24px_-4px_rgba(245,185,66,0.35)]"
                  : item.id === "presentation"
                    ? "border-[#f5b942]/40 bg-[#f5b942]/10 text-[#f5b942]"
                    : "border-white/20 bg-white/10 text-stone-200"
                : item.accent
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-sm">
              {item.short}
            </span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-right opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:pl-2 group-hover:opacity-100">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile — bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/[0.08] bg-[#0a090d]/95 px-2 py-2 backdrop-blur-xl lg:hidden"
        aria-label="Page sections"
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors ${
              active === item.id
                ? item.id === "analyze"
                  ? "text-[#f5b942]"
                  : "text-stone-200"
                : "text-stone-500"
            }`}
          >
            <span className="text-base leading-none">{item.short}</span>
            <span>{item.id === "analyze" ? "Wallet" : item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </>
  );
}