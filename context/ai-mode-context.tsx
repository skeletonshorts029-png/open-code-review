"use client";

import { createContext, useContext, useMemo } from "react";
import { AiMode, getAiModeMeta, normalizeAiMode } from "@/lib/ai/ai-mode";

type AiModeContextValue = {
  mode: AiMode;
  mounted: boolean;
  setMode: (mode: AiMode) => void;
  label: string;
  helper: string;
};

const AiModeContext = createContext<AiModeContextValue | null>(null);

export function AiModeProvider({ children }: { children: React.ReactNode }) {
  const mode: AiMode = normalizeAiMode("balanced");
  const mounted = true;

  const value = useMemo<AiModeContextValue>(() => {
    const meta = getAiModeMeta(mode);
    return {
      mode,
      mounted,
      label: meta.label,
      helper: meta.helper,
      setMode: () => {
        // Buildynex now keeps a single optimized AI profile.
      },
    };
  }, [mode, mounted]);

  return <AiModeContext.Provider value={value}>{children}</AiModeContext.Provider>;
}

export function useAiMode() {
  const context = useContext(AiModeContext);
  if (!context) {
    throw new Error("useAiMode must be used inside AiModeProvider.");
  }
  return context;
}
