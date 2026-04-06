"use client";

import { useEffect, useState } from "react";
import { GoalProgressPoint } from "@/lib/types";

function DoneBadge() {
  return (
    <span className="text-sm font-bold text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]">
      ✓
    </span>
  );
}

export function GoalsProgressChart({ points }: { points: GoalProgressPoint[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const safePoints: GoalProgressPoint[] = points.length
    ? points
    : [
        { label: "Research", progress: 17, done: false },
        { label: "Validation", progress: 33, done: false },
        { label: "MVP", progress: 50, done: false },
        { label: "Branding", progress: 67, done: false },
        { label: "Launch", progress: 83, done: false },
        { label: "Growth", progress: 100, done: false },
      ];

  const completedCount = safePoints.filter((point) => point.done).length;

  return (
    <div className="goals-chart premium-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500 light-label">
            Goals graph
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white dark:text-white light-heading">
            Phase completion over time
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Completed
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-600" />
            Pending
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
            {completedCount}/{safePoints.length} phases done
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-white/[0.07] bg-slate-950/50 p-5">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8">
            {[25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-dashed border-white/[0.06]"
                style={{ bottom: `${tick}%` }}
              />
            ))}
          </div>

          <div className="flex h-60 items-end justify-between gap-3">
            {safePoints.map((point, index) => {
              const delayMs = index * 80;

              return (
                <div
                  key={point.label}
                  className="flex min-w-[92px] flex-1 flex-col items-center gap-3"
                >
                  <div
                    className="flex h-6 items-center justify-center text-xs font-semibold transition-all duration-500"
                    style={{
                      color: point.done ? "#34d399" : "rgba(148,163,184,0.88)",
                      opacity: mounted ? 1 : 0,
                      transitionDelay: `${delayMs}ms`,
                    }}
                  >
                    {point.done ? <DoneBadge /> : `${point.progress}%`}
                  </div>

                  <div className="flex w-full flex-1 items-end rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.03] p-1">
                    <div
                      className="w-full rounded-lg transition-all ease-out"
                      style={{
                        height: mounted ? `${point.progress}%` : "2%",
                        transitionDuration: "700ms",
                        transitionDelay: `${delayMs}ms`,
                        background: point.done
                          ? "linear-gradient(to top, #10b981, #38bdf8, #a78bfa)"
                          : "linear-gradient(to top, rgba(71,85,105,0.78), rgba(100,116,139,0.46))",
                        boxShadow: point.done
                          ? "0 0 20px rgba(52,211,153,0.3), 0 0 40px rgba(56,189,248,0.15)"
                          : "none",
                      }}
                    />
                  </div>

                  <div
                    className="w-full text-center text-[11px] leading-tight font-medium text-slate-300"
                    title={point.label}
                  >
                    {point.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
