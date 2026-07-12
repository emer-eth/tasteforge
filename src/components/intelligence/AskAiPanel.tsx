"use client";

export function AskAiPanel({
  questions,
  onAsk,
}: {
  questions: string[];
  /** empty string = open the assistant without a seeded question */
  onAsk: (question: string) => void;
}) {
  return (
    <section id="ask-ai" className="glass-card scroll-mt-28 rounded-[20px] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label text-[var(--gold)]">Ask your AI curator</p>
          <h3 className="headline mt-2 text-[clamp(1.25rem,2.4vw,1.75rem)] text-[#f5f3ee]">
            Questions about your scan?
          </h3>
          <p className="mt-1 max-w-xl text-sm text-[var(--ink-2)]">
            Ask anything about your taste, your holdings, or the best cards to buy
            next — answered with your live scan results.
          </p>
        </div>
        <span className="text-2xl" aria-hidden>
          ✦
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-[var(--border)] px-3.5 py-2 text-left text-sm text-[var(--ink-2)] transition-all hover:border-[var(--gold)]/40 hover:text-[#f5f3ee]"
          >
            {q}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onAsk("")}
          className="btn-gold btn-gold-sm"
        >
          Ask your own <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  );
}
