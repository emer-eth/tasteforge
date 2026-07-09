import { getQuizOption } from "@/lib/taste-quiz/config";

/** Convert selected quiz option IDs into taste signal strings */
export function quizSelectionsToSignals(optionIds: string[]): string[] {
  const signals: string[] = [];
  for (const id of optionIds) {
    const option = getQuizOption(id);
    if (option) signals.push(...option.signals);
  }
  return [...new Set(signals)];
}

/** Human-readable labels for profile display */
export function quizSelectionsToLabels(optionIds: string[]): string[] {
  return optionIds
    .map((id) => getQuizOption(id)?.label)
    .filter((label): label is string => Boolean(label));
}