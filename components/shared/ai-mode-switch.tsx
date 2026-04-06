"use client";

import { aiModeOptions } from "@/lib/ai/ai-mode";
import { cn } from "@/lib/utils";
import { useAiMode } from "@/context/ai-mode-context";

export function AiModeSwitch({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { mode, setMode, label, helper } = useAiMode();

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-[0_8px_30px_rgba(15,23,42,0.18)]",
          className
        )}
      >
        <div className="grid grid-cols-3 gap-1">
          {aiModeOptions.map((option) => {
            const active = option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-gradient-to-r from-sky-400/30 to-fuchsia-400/30 text-white shadow-[0_0_18px_rgba(56,189,248,0.2)]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_40px_rgba(2,6,23,0.2)]",
        className
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI mode</div>
      <div className="mt-2 text-sm text-slate-300">{label}</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {aiModeOptions.map((option) => {
          const active = option.id === mode;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-center text-xs font-semibold transition",
                active
                  ? "border-sky-300/35 bg-gradient-to-r from-sky-400/18 to-fuchsia-400/18 text-white shadow-[0_0_24px_rgba(56,189,248,0.16)]"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-400">{helper}</p>
    </div>
  );
}
