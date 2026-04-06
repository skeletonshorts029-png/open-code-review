import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stepMap = {
  solution: {
    title: "Startup Plan",
    copy: "AI turns the selected problem into a role-aware startup strategy.",
    hrefLabel: "View Startup Plan",
  },
  roadmap: {
    title: "Roadmap",
    copy: "Generate the phased execution path for this exact problem.",
    hrefLabel: "View Roadmap",
  },
  branding: {
    title: "Brand Studio",
    copy: "See names, logo direction, positioning, and brand identity.",
    hrefLabel: "Open Brand Studio",
  },
} as const;

type WorkflowStep = keyof typeof stepMap;

export function WorkflowSteps({
  workspaceId,
  currentStep,
}: {
  workspaceId: string;
  currentStep: WorkflowStep;
}) {
  const steps: Array<{ key: WorkflowStep; href: string }> = [
    { key: "solution", href: `/dashboard/solution/${workspaceId}` },
    { key: "roadmap", href: `/dashboard/roadmap/${workspaceId}` },
    { key: "branding", href: `/dashboard/branding/${workspaceId}` },
  ];

  return (
    <div className="mb-8 grid gap-4 xl:grid-cols-3">
      {steps.map((step, index) => {
        const active = step.key === currentStep;
        const done = steps.findIndex((item) => item.key === currentStep) > index;
        const meta = stepMap[step.key];

        return (
          <div
            key={step.key}
            className={cn(
              "relative overflow-hidden rounded-[28px] border p-5 transition duration-300",
              active
                ? "border-sky-300/40 bg-gradient-to-br from-sky-400/16 via-fuchsia-400/12 to-white/[0.08] shadow-[0_0_0_1px_rgba(125,211,252,0.18),0_0_60px_rgba(56,189,248,0.18)]"
                : done
                  ? "border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_40px_rgba(16,185,129,0.08)]"
                  : "border-white/10 bg-white/[0.04]"
            )}
          >
            {active ? <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" /> : null}
            <div className="relative">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl border text-sm font-semibold",
                    active
                      ? "border-sky-300/40 bg-sky-300/18 text-white"
                      : done
                        ? "border-emerald-400/20 bg-emerald-400/15 text-emerald-200"
                        : "border-white/10 bg-white/[0.05] text-slate-300"
                  )}
                >
                  0{index + 1}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{meta.title}</div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {active ? "Current step" : done ? "Completed" : "Next up"}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{meta.copy}</p>
              <div className="mt-5">
                <Button
                  href={step.href}
                  variant={active ? "primary" : "secondary"}
                  className="w-full"
                  showArrow={!active}
                >
                  {active ? `${meta.title} active` : meta.hrefLabel}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
