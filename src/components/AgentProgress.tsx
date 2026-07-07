export const AGENT_STEPS = [
  { id: "analyze", label: "Analyzing signals" },
  { id: "vector", label: "Building Taste Vector" },
  { id: "score", label: "Scoring catalog" },
  { id: "explain", label: "Writing explanations" },
] as const;

interface AgentProgressProps {
  activeStep: number;
  isRunning: boolean;
}

export function AgentProgress({ activeStep, isRunning }: AgentProgressProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
        Agent Pipeline
      </p>
      <div className="space-y-3">
        {AGENT_STEPS.map((step, index) => {
          const isDone = !isRunning && activeStep >= AGENT_STEPS.length;
          const isActive = isRunning && index === activeStep;
          const isComplete = isDone || (!isRunning && index < activeStep) || (isRunning && index < activeStep);

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isComplete
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isActive
                      ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40"
                      : "bg-zinc-800 text-zinc-600"
                }`}
              >
                {isComplete ? "✓" : index + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-zinc-100"
                    : isComplete
                      ? "text-zinc-400"
                      : "text-zinc-600"
                }`}
              >
                {step.label}
                {isActive && (
                  <span className="ml-2 inline-block animate-pulse text-amber-400">
                    ...
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}