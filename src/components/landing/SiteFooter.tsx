import { TasteForgeLogoMark } from "@/components/TasteForgeLogo";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#how-it-works" },
      { label: "Marketplace", href: "https://www.renaiss.xyz/marketplace" },
      { label: "How it works", href: "#how-it-works" },
      { label: "API", href: "https://www.renaiss.xyz/api/trpc/collectible.list" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#top" },
      { label: "Careers", href: "#top" },
      { label: "Blog", href: "#top" },
      { label: "Contact", href: "#top" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "https://github.com/blueskylh/renaiss-scanner" },
      { label: "Scanner tool", href: "https://renaiss-tool-689931.napa.de5.net/" },
      { label: "Help Center", href: "#top" },
      { label: "Changelog", href: "#top" },
    ],
  },
];

const SOCIALS: Array<{ label: string; href: string; icon: string }> = [
  { label: "Discord", href: "#top", icon: "◈" },
  { label: "X", href: "https://x.com", icon: "𝕏" },
  { label: "Telegram", href: "#top", icon: "✈" },
  { label: "GitHub", href: "https://github.com/blueskylh/renaiss-scanner", icon: "⌥" },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[var(--border)] pt-14 pb-10">
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="nav-logo">
              <TasteForgeLogoMark size={24} />
            </span>
            <div>
              <p className="text-lg font-semibold text-[#f5f3ee]">TasteForge</p>
              <p className="text-[11px] text-[var(--ink-3)]">
                Renaissance Taste Intelligence
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--ink-3)]">
            AI that reads your collection and reveals who you are as a
            collector — built for the Renaiss ecosystem.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="section-label text-[var(--ink-3)]">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-sm text-[var(--ink-2)] transition-colors hover:text-[var(--gold)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
        <p className="text-xs text-[var(--ink-3)]">
          © 2026 TasteForge · Renaiss Hackathon · Built for collectors who want
          taste and value.
        </p>
        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={s.label}
              title={s.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--ink-2)] transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
            >
              <span aria-hidden>{s.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
