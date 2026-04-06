import Link from "next/link";
import { ProblemRecord } from "@/lib/types";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";

export function ProblemCard({ problem }: { problem: ProblemRecord }) {
  return (
    <div className="premium-card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Pill tone="info">{problem.sector}</Pill>
          <h3 className="mt-4 text-xl font-semibold text-white">{problem.title}</h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Score</div>
          <div className="text-lg font-semibold text-white">{problem.buildynexScore}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300">{problem.description}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
        <Pill tone={problem.severity === "High" ? "danger" : problem.severity === "Medium" ? "warning" : "info"}>{problem.severity} Severity</Pill>
        <Pill tone="success">{problem.opportunityTag}</Pill>
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Who faces it</div>
        <div className="mt-2">{problem.affectedUsers}</div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button href={`/dashboard/problem/${problem.id}`} variant="secondary" className="w-full">
          View Analysis
        </Button>
        <Button href={`/dashboard/solution/${problem.id}`} className="w-full">
          Build Solution
        </Button>
      </div>
    </div>
  );
}
