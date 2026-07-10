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
    label: "Back to top",
    short: "↑",
    targetId: "top",
    accent: "hover:border-stone-500/40",
  },
  {
    id: "analyze",
    label: "Wallet & analyze",
    short: "⌁",
    targetId: "analyze",
    focusSelector: "#wallet-address-input",
    accent: "border-[#c9a961]/40 bg-[#c9a961]/10 text-[#c9a961] hover:bg-[#c9a961]/20",
  },
  {
    id: "results",
    label: "Taste results",
    short: "◎",
    targetId: "results",
    accent: "hover:border-teal-500/40 hover:text-teal-300",
  },
  {
    id: "presentation",
    label: "Collector identity",
    short: "★",
    targetId: "archetype",
    accent: "hover:border-[#c9a961]/40 hover:text-[#c9a961]",
  },
  {
    id: "marketplace",
    label: "Marketplace grid",
    short: "▦",
    targetId: "marketplace",
    accent: "hover:border-teal-500/40 hover:text-teal-300",
  },
  {
    id: "assistant",
    label: "Ask AI guide",
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
    const observeMap: Array<{ elId: string; navId: SideNavSection }> = [
      { elId: "top", navId: "top" },
      { elId: "analyze", navId: "analyze" },
      { elId: "results", navId: "results" },
      ...(hasResults
        ? [
            { elId: "archetype", navId: "presentation" as const },
            { elId: "presentation", navId: "presentation" as const },
          ]
        : []),
      { elId: "marketplace", navId: "marketplace" },
    ];
    const observers: IntersectionObserver[] = [];

    observeMap.forEach(({ elId, navId }) => {
      const el = document.getElementById(elId);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActive(navId);
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
            aria-label={item.label}
            className={`group flex flex-row-reverse items-center gap-2 rounded-full border border-white/[0.08] bg-[#15120d]/90 px-2 py-2 text-xs font-medium text-stone-400 shadow-lg backdrop-blur-md transition-all ${
              active === item.id
                ? item.id === "analyze"
                  ? "border-[#c9a961]/50 bg-[#c9a961]/15 text-[#c9a961] shadow-[0_0_24px_-4px_rgba(201,169,97,0.35)]"
                  : item.id === "presentation"
                    ? "border-[#c9a961]/40 bg-[#c9a961]/10 text-[#c9a961]"
                    : "border-white/20 bg-white/10 text-stone-200"
                : item.accent
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-sm">
              {item.short}
            </span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-right opacity-0 transition-all duration-200 group-hover:max-w-[140px] group-hover:pl-2 group-hover:opacity-100">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile — bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/[0.08] bg-[#15120d]/95 px-2 py-2 backdrop-blur-xl lg:hidden"
        aria-label="Page sections"
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            title={item.label}
            aria-label={item.label}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors ${
              active === item.id
                ? item.id === "analyze"
                  ? "text-[#c9a961]"
                  : "text-stone-200"
                : "text-stone-500"
            }`}
          >
            <span className="text-base leading-none">{item.short}</span>
            <span>
              {item.id === "analyze"
                ? "Wallet"
                : item.id === "presentation"
                  ? "Identity"
                  : item.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}