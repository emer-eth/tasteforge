import { parseSocialFragments } from "@/lib/collector/build-pending-collector";
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
): { socialFragments: number; quizCount: number; totalSignals: number } {
  const merged = mergeTasteInputs(socialText, quizOptionIds);
  const textOnly = parseSocialFragments(socialText ?? "");
  return {
    socialFragments: textOnly.length,
    quizCount: quizOptionIds?.length ?? 0,
    totalSignals: merged.socialSignals.length,
  };
}