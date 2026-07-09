import { parseSocialFragments } from "@/lib/collector/build-pending-collector";
import type { TasteSourceMode } from "@/lib/taste-quiz/source-mode";
import {
  quizSelectionsToLabels,
  quizSelectionsToSignals,
} from "@/lib/taste-quiz/to-signals";

export interface MergedTasteInputs {
  socialSignals: string[];
  quizLabels: string[];
  quizOptionIds: string[];
}

/** Merge pasted social text with quick-form quiz selections */
export function mergeTasteInputs(
  socialText?: string,
  quizOptionIds?: string[],
): MergedTasteInputs {
  const textSignals = parseSocialFragments(socialText ?? "");
  const quizIds = quizOptionIds ?? [];
  const quizSignals = quizSelectionsToSignals(quizIds);
  const quizLabels = quizSelectionsToLabels(quizIds);

  const socialSignals = [...new Set([...textSignals, ...quizSignals])];

  return {
    socialSignals,
    quizLabels,
    quizOptionIds: quizIds,
  };
}

export function countTasteInputs(
  socialText?: string,
  quizOptionIds?: string[],
  mode: TasteSourceMode = "none",
): { socialFragments: number; quizCount: number; totalSignals: number } {
  const social =
    mode === "social" ? (socialText ?? "") : "";
  const quiz = mode === "quiz" ? (quizOptionIds ?? []) : [];
  const merged = mergeTasteInputs(social, quiz);
  const textOnly = parseSocialFragments(social);
  return {
    socialFragments: textOnly.length,
    quizCount: quiz.length,
    totalSignals: merged.socialSignals.length,
  };
}