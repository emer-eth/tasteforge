export function scrollToSection(
  id: string,
  options?: { focusSelector?: string },
) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "start" });

  if (options?.focusSelector) {
    window.setTimeout(() => {
      const focusEl = document.querySelector<HTMLElement>(
        options.focusSelector!,
      );
      focusEl?.focus({ preventScroll: true });
    }, 450);
  }
}