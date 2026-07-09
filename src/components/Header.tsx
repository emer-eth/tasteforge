"use client";

import { TasteForgeLogo } from "@/components/TasteForgeLogo";
import { scrollToSection } from "@/lib/scroll-to-section";

export function Header() {
  return (
    <header className="header-glass sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <a href="#top" className="group transition-opacity hover:opacity-95">
          <TasteForgeLogo
            titleClassName="transition-colors group-hover:text-[#c9a961]"
          />
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              scrollToSection("analyze", {
                focusSelector: "#wallet-address-input",
              })
            }
            className="btn-cta hidden !px-4 !py-2 !text-xs sm:inline-flex"
          >
            Analyze wallet
          </button>
          <a
            href="https://renaiss-tool-689931.napa.de5.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="badge-violet hidden px-3 py-1.5 text-xs transition-all hover:scale-[1.02] hover:opacity-90 md:inline"
          >
            Scanner ↗
          </a>
          <a
            href="https://www.renaiss.xyz/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="badge-live px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02] hover:opacity-90"
          >
            Renaiss ↗
          </a>
        </div>
      </div>
    </header>
  );
}