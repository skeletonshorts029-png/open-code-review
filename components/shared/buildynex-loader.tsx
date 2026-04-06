import { cn } from "@/lib/utils";

export function BuildynexLoader({
  title = "Loading Buildynex AI",
  copy = "Preparing your workspace, syncing your profile, and warming up your AI startup engine.",
  className,
  compact = false,
}: {
  title?: string;
  copy?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "premium-card relative overflow-hidden p-8 sm:p-10",
        compact ? "max-w-3xl" : "w-full max-w-4xl",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
      <div className="absolute -right-16 top-8 h-40 w-40 rounded-full bg-sky-400/12 blur-3xl" />
      <div className="absolute -left-12 bottom-4 h-40 w-40 rounded-full bg-fuchsia-500/12 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex flex-col items-center justify-center gap-4 lg:w-56">
          <div className="loader-brand">
            <div className="loader-orbital">
              <div className="loader-orbital-ambient loader-orbital-ambient-one" />
              <div className="loader-orbital-ambient loader-orbital-ambient-two" />
              <div className="loader-orbital-grid loader-orbital-grid-one" />
              <div className="loader-orbital-grid loader-orbital-grid-two" />
              <div className="loader-orbital-grid loader-orbital-grid-three" />
              <div className="loader-orbital-orbit loader-orbital-orbit-one">
                <span className="loader-orbital-arc" />
                <span className="loader-orbital-node" />
              </div>
              <div className="loader-orbital-orbit loader-orbital-orbit-two">
                <span className="loader-orbital-arc" />
                <span className="loader-orbital-node" />
              </div>
              <div className="loader-orbital-orbit loader-orbital-orbit-three">
                <span className="loader-orbital-arc" />
                <span className="loader-orbital-node" />
              </div>
              <div className="loader-orbital-pulse loader-orbital-pulse-one" />
              <div className="loader-orbital-pulse loader-orbital-pulse-two" />
              <div className="loader-logo-mark-wrap">
                <div className="logo-mark loader-logo-mark">
                  <div className="logo-core" />
                  <div className="logo-orbit" />
                  <div className="logo-spark logo-spark-top" />
                  <div className="logo-spark logo-spark-bottom" />
                  <span className="logo-glyph">BN</span>
                </div>
              </div>
            </div>

            <div className="loader-brand-copy">
              <div className="logo-wordmark">BUILDYNEX AI</div>
              <div className="logo-subline">Problem-first startup intelligence</div>
            </div>
          </div>

          <div className="loader-progress-track w-full max-w-[140px]">
            <div className="loader-progress-fill" />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200/70 light-label">
              Buildynex loading
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {copy}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {[70, 55, 40].map((w, i) => (
              <div
                key={i}
                className="shimmer h-2 rounded-full"
                style={{ width: `${w}%`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
