export function BuildynexScoreCard({
  score,
  explanation,
}: {
  score: number;
  explanation: string;
}) {
  return (
    <div className="premium-card relative min-w-0 overflow-hidden p-6">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.32em] text-sky-200/70">Buildynex Score</p>
      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2">
        <span className="text-5xl font-semibold leading-none text-white sm:text-6xl">{score}</span>
        <span className="pb-1 text-sm leading-none text-slate-400">out of 100</span>
      </div>
      <p className="mt-5 break-words text-sm leading-7 text-slate-300">{explanation}</p>
    </div>
  );
}
