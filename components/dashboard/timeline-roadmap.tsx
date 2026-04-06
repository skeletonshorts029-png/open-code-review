import { RoadmapStep } from "@/lib/types";
import { Pill } from "@/components/ui/pill";

export function TimelineRoadmap({ steps }: { steps: RoadmapStep[] }) {
  return (
    <div className="space-y-5">
      {steps.map((step, index) => (
        <div
          key={step.phase}
          className={`premium-card panel-rise relative overflow-hidden p-6 ${
            step.status === "Ready"
              ? "border-emerald-400/18 shadow-[0_0_40px_rgba(16,185,129,0.08)]"
              : step.status === "In Progress"
                ? "border-amber-300/18 shadow-[0_0_40px_rgba(251,191,36,0.08)]"
                : "border-sky-300/16 shadow-[0_0_44px_rgba(56,189,248,0.08)]"
          }`}
        >
          <div className="absolute left-7 top-0 h-full w-px bg-gradient-to-b from-white/20 to-transparent" />
          <div
            className={`absolute inset-x-0 top-0 h-24 ${
              step.status === "Ready"
                ? "bg-gradient-to-r from-emerald-400/10 to-transparent"
                : step.status === "In Progress"
                  ? "bg-gradient-to-r from-amber-400/10 to-transparent"
                  : "bg-gradient-to-r from-sky-400/10 to-transparent"
            }`}
          />
          <div className="relative flex gap-5">
            <div
              className={`z-10 mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold text-white ${
                step.status === "Ready"
                  ? "border-emerald-300/25 bg-emerald-400/14 shadow-[0_0_18px_rgba(16,185,129,0.22)]"
                  : step.status === "In Progress"
                    ? "border-amber-300/25 bg-amber-400/14 shadow-[0_0_18px_rgba(251,191,36,0.22)]"
                    : "border-sky-300/25 bg-sky-400/14 shadow-[0_0_18px_rgba(56,189,248,0.2)]"
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-semibold text-white">{step.phase}</h3>
                <Pill tone={step.status === "Ready" ? "success" : step.status === "In Progress" ? "warning" : "info"}>{step.status}</Pill>
                {step.completedByUser ? <Pill tone="success">Completed by you</Pill> : null}
                <span className="text-sm text-slate-500">{step.duration}</span>
                {step.timeSpentHours ? <span className="text-sm text-slate-500">{step.timeSpentHours}h logged</span> : null}
              </div>
              <p className="mt-3 text-sm text-slate-400">{step.ownerLens}</p>
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Focus</div>
                  <div className="mt-3 text-sm leading-6 text-slate-200">
                    {step.focus || "Lock the next highest-leverage move before expanding scope."}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Success signal</div>
                  <div className="mt-3 text-sm leading-6 text-slate-200">
                    {step.successMetric || "Define one measurable proof point for this phase."}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Risk watch</div>
                  <div className="mt-3 text-sm leading-6 text-slate-200">
                    {step.keyRisk || "Watch for weak signal quality and avoid premature scaling."}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {step.outputs.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] px-4 py-4 text-sm leading-6 text-slate-300">
                    <div className="mb-2 inline-flex rounded-full bg-sky-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">
                      Deliverable
                    </div>
                    <div>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
