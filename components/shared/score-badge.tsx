import { cn } from "@/lib/utils";

export function ScoreBadge({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const tone = score >= 80 ? "text-emerald-300 border-emerald-400/20 bg-emerald-400/10" : score >= 60 ? "text-amber-300 border-amber-400/20 bg-amber-400/10" : "text-rose-300 border-rose-400/20 bg-rose-400/10";

  return (
    <div className={cn("rounded-2xl border px-4 py-3", tone)}>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold text-white">{score}</span>
        <span className="pb-1 text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}
