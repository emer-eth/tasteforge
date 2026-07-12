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
            <p className="mt-1 text-sm text-[#f5f3ee]">{statusLabel}</p>
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
              "linear-gradient(90deg, var(--live), var(--gold), var(--violet))",
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
                    ? "bg-[rgba(63,169,138,0.2)] text-[#7fd4b8] ring-1 ring-[rgba(63,169,138,0.35)]"
                    : isActive
                      ? "bg-[#d8b56b]/20 text-[#d8b56b] ring-2 ring-[#d8b56b]/45"
                      : "bg-white/5 text-[var(--ink-3)]"
                }`}
              >
                {isComplete ? "✓" : step.stepIndex + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-[#f5f3ee]"
                    : isComplete
                      ? "text-[var(--ink-2)]"
                      : "text-[var(--ink-3)]"
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