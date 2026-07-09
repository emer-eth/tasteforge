export interface TasteQuizOption {
  id: string;
  label: string;
  /** Keywords merged into social taste signals for scoring */
  signals: string[];
}

export interface TasteQuizQuestion {
  id: string;
  label: string;
  hint?: string;
  /** Allow multiple selections (default single-select) */
  multi?: boolean;
  maxSelect?: number;
  options: TasteQuizOption[];
}

export const TASTE_QUIZ_QUESTIONS: TasteQuizQuestion[] = [
  {
    id: "era",
    label: "Which era speaks to you?",
    options: [
      { id: "era-vintage", label: "Vintage & retro", signals: ["vintage", "retro", "classic", "nostalgia"] },
      { id: "era-modern", label: "Modern & new", signals: ["modern", "contemporary", "scarlet violet"] },
      { id: "era-both", label: "Both eras", signals: ["vintage and modern collector"] },
    ],
  },
  {
    id: "drive",
    label: "What drives your buys?",
    hint: "Pick up to 2",
    multi: true,
    maxSelect: 2,
    options: [
      { id: "drive-grade", label: "Perfect grades", signals: ["psa 10", "gem mint", "perfect grade"] },
      { id: "drive-art", label: "Art & illustration", signals: ["full art", "illustration", "artistic", "ornate"] },
      { id: "drive-value", label: "Smart deals", signals: ["bargain", "under fmv", "value hunter"] },
      { id: "drive-grail", label: "Grails & chase", signals: ["grail", "chase", "rare", "legendary"] },
    ],
  },
  {
    id: "style",
    label: "Visual style you prefer?",
    options: [
      { id: "style-bold", label: "Bold & dramatic", signals: ["bold", "full art", "ornate"] },
      { id: "style-minimal", label: "Clean & minimal", signals: ["minimal", "clean", "simple"] },
      { id: "style-balanced", label: "No strong preference", signals: ["balanced collector"] },
    ],
  },
  {
    id: "personality",
    label: "Collector personality?",
    options: [
      { id: "personality-investor", label: "Market-minded", signals: ["investment mindset", "fmv", "floor", "roi"] },
      { id: "personality-enthusiast", label: "Passion collector", signals: ["personal collection", "nostalgia", "collector"] },
      { id: "personality-social", label: "Community & display", signals: ["community", "social", "display collector"] },
    ],
  },
  {
    id: "characters",
    label: "Character favorites?",
    hint: "Optional — pick any",
    multi: true,
    options: [
      { id: "char-charizard", label: "Charizard", signals: ["charizard"] },
      { id: "char-pikachu", label: "Pikachu", signals: ["pikachu"] },
      { id: "char-legends", label: "Legendaries", signals: ["legendary pokemon", "grail"] },
      { id: "char-open", label: "Open to anything", signals: ["open minded collector"] },
    ],
  },
  {
    id: "serials",
    label: "Serial number strategy?",
    options: [
      { id: "serial-pairs", label: "Consecutive pairs", signals: ["consecutive", "serial pair"] },
      { id: "serial-singles", label: "Single gems", signals: ["single gem collector", "psa 10"] },
      { id: "serial-flex", label: "Flexible", signals: ["flexible collector"] },
    ],
  },
];

const OPTION_MAP = new Map<string, TasteQuizOption>();
for (const question of TASTE_QUIZ_QUESTIONS) {
  for (const option of question.options) {
    OPTION_MAP.set(option.id, option);
  }
}

export function getQuizOption(id: string): TasteQuizOption | undefined {
  return OPTION_MAP.get(id);
}

export function getQuizQuestionForOption(
  optionId: string,
): TasteQuizQuestion | undefined {
  return TASTE_QUIZ_QUESTIONS.find((q) =>
    q.options.some((o) => o.id === optionId),
  );
}