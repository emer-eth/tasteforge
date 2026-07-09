export type TasteSourceMode = "none" | "social" | "quiz";

export const TASTE_SOURCE_OPTIONS: Array<{
  id: TasteSourceMode;
  label: string;
  description: string;
}> = [
  {
    id: "none",
    label: "Wallet only",
    description: "Holdings + vision — no extra taste input",
  },
  {
    id: "social",
    label: "X & social",
    description: "Handle, fetched bio, or pasted tweets",
  },
  {
    id: "quiz",
    label: "Quick form",
    description: "Tick-box taste profile for quiet posters",
  },
];

export function inferTasteSourceFromParams(input: {
  socialText?: string;
  xHandle?: string;
  tasteQuiz?: string[];
  tasteSource?: string | null;
}): TasteSourceMode {
  const explicit = input.tasteSource?.trim().toLowerCase();
  if (explicit === "social" || explicit === "quiz" || explicit === "none") {
    return explicit;
  }
  if (input.tasteQuiz?.length) return "quiz";
  if (input.socialText?.trim() || input.xHandle?.trim()) return "social";
  return "none";
}

export function resolveAnalyzeTasteInput(
  mode: TasteSourceMode,
  socialText?: string,
  xHandle?: string,
  tasteQuiz?: string[],
): {
  socialText?: string;
  xHandle?: string;
  tasteQuiz?: string[];
} {
  if (mode === "social") {
    return {
      socialText: socialText?.trim() || undefined,
      xHandle: xHandle?.trim() || undefined,
    };
  }
  if (mode === "quiz") {
    return {
      tasteQuiz: tasteQuiz?.length ? tasteQuiz : undefined,
    };
  }
  return {};
}