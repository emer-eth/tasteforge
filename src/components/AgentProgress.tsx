import { ANALYSIS_PROGRESS_STEPS } from "@/lib/agents/taste-forge-agent";

interface AgentProgressProps {
  activeStep: number;
  isRunning: boolean;
  statusLabel?: string;
}

export function AgentProgress({
  activeStep,
  isRunning,
  statusLabel,
}: AgentProgressProps) {
  const totalSteps = ANALYSIS_PROGRESS_STEPS.length;
  const progressPct = Math.min(
    100,
    Math.round(((activeStep + (isRunning ? 0.35 : 1)) / totalSteps) * 100),
  );

  return (
    <div className="panel panel-violet animate-in overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label text-violet-300/80">Agent Pipeline</p>
          {statusLabel && (
            <p className="mt-1 text-sm text-stone-200">{statusLabel}</p>
          )}
        </div>
        <span className="badge-violet px-3 py-1 text-xs font-medium">
          {progressPct}%
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            background:
              "linear-gradient(90deg, var(--teal), var(--gold), var(--coral))",
          }}
        />
      </div>

      <div className="mt-5 space-y-1">
        {ANALYSIS_PROGRESS_STEPS.map((step) => {
          const isActive = isRunning && activeStep === step.stepIndex;
          const isComplete =
            !isRunning && activeStep >= totalSteps
              ? true
              : step.stepIndex < activeStep;

          return (
            <div
              key={step.step}
              className={`progress-step flex items-center gap-3 py-1.5 ${
                isComplete ? "is-complete" : ""
              } ${isActive ? "is-active" : ""}`}
            >
              <div
                className={`progress-dot flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isComplete
                    ? "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/35"
                    : isActive
                      ? "bg-[#f5b942]/20 text-[#f5b942] ring-2 ring-[#f5b942]/45"
                      : "bg-white/5 text-stone-600"
                }`}
              >
                {isComplete ? "✓" : step.stepIndex + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-stone-100"
                    : isComplete
                      ? "text-stone-400"
                      : "text-stone-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ANALYSIS_PROGRESS_STEPS as AGENT_STEPS };