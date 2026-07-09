"use client";

import { useMemo } from "react";
import { TASTE_QUIZ_QUESTIONS } from "@/lib/taste-quiz/config";

interface TasteQuickFormProps {
  selectedOptionIds: string[];
  onChange: (optionIds: string[]) => void;
  disabled?: boolean;
}

export function TasteQuickForm({
  selectedOptionIds,
  onChange,
  disabled,
}: TasteQuickFormProps) {
  const selectedSet = useMemo(
    () => new Set(selectedOptionIds),
    [selectedOptionIds],
  );

  const toggleOption = (
    questionId: string,
    optionId: string,
    multi?: boolean,
    maxSelect?: number,
  ) => {
    if (disabled) return;

    const question = TASTE_QUIZ_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    const questionOptionIds = question.options.map((o) => o.id);
    const otherSelections = selectedOptionIds.filter(
      (id) => !questionOptionIds.includes(id),
    );

    if (multi) {
      const currentForQuestion = selectedOptionIds.filter((id) =>
        questionOptionIds.includes(id),
      );
      const isSelected = currentForQuestion.includes(optionId);

      if (isSelected) {
        onChange([
          ...otherSelections,
          ...currentForQuestion.filter((id) => id !== optionId),
        ]);
        return;
      }

      const nextForQuestion = [...currentForQuestion, optionId];
      if (maxSelect && nextForQuestion.length > maxSelect) {
        nextForQuestion.shift();
      }
      onChange([...otherSelections, ...nextForQuestion]);
      return;
    }

    onChange(
      selectedSet.has(optionId)
        ? otherSelections
        : [...otherSelections, optionId],
    );
  };

  const answeredCount = TASTE_QUIZ_QUESTIONS.filter((q) =>
    q.options.some((o) => selectedSet.has(o.id)),
  ).length;

  return (
    <div className="panel-violet mt-4 rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="section-label text-violet-300">
            Quick taste profile
          </p>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Don&apos;t post much on X? Tick a few boxes — TasteForge pairs your
            answers with wallet history for analysis.
          </p>
        </div>
        {answeredCount > 0 && (
          <span className="badge-violet px-2.5 py-1 text-[10px]">
            {answeredCount} answered
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {TASTE_QUIZ_QUESTIONS.map((question) => (
          <div key={question.id}>
            <div className="mb-2 flex flex-wrap items-baseline gap-2">
              <p className="text-xs font-medium text-stone-300">
                {question.label}
              </p>
              {question.hint && (
                <span className="text-[10px] text-stone-600">
                  {question.hint}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => {
                const isSelected = selectedSet.has(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      toggleOption(
                        question.id,
                        option.id,
                        question.multi,
                        question.maxSelect,
                      )
                    }
                    className={`quiz-chip rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    {isSelected && (
                      <span className="mr-1 text-violet-300" aria-hidden>
                        ✓
                      </span>
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedOptionIds.length > 0 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([])}
          className="mt-4 text-[10px] text-stone-500 transition-colors hover:text-stone-300 disabled:opacity-50"
        >
          Clear quick profile
        </button>
      )}
    </div>
  );
}