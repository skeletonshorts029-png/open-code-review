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
    <div className={cn("min-w-0 rounded-2xl border px-4 py-3", tone)}>
      <div className="break-words text-[11px] uppercase leading-5 tracking-[0.18em] text-slate-400 sm:text-xs">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className="text-2xl font-semibold leading-none text-white sm:text-3xl">{score}</span>
        <span className="pb-0.5 text-xs leading-none text-slate-400">/ 100</span>
      </div>
    </div>
  );
}
