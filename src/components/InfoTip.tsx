"use client";

import { useState, type ReactNode } from "react";

/**
 * Plain-language tooltip. Wrap a jargon term to give newcomers an inline
 * definition on hover/focus/tap. The term is shown with a dotted underline.
 */
export function InfoTip({
  term,
  def,
  children,
}: {
  term?: string;
  def: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={term ? `What is ${term}?` : "Definition"}
        className="cursor-help underline decoration-dotted decoration-[var(--ink-3)] underline-offset-2 outline-none"
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl border border-[var(--border-strong)] bg-[#11100d] px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-[var(--ink-2)] shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          {term && (
            <span className="mb-0.5 block font-semibold text-[var(--gold)]">
              {term}
            </span>
          )}
          {def}
        </span>
      )}
    </span>
  );
}
