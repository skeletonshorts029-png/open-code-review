"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AiMode, getAiModeMeta, normalizeAiMode } from "@/lib/ai/ai-mode";

type AiModeContextValue = {
  mode: AiMode;
  mounted: boolean;
  setMode: (mode: AiMode) => void;
  label: string;
  helper: string;
};

const AI_MODE_STORAGE_KEY = "buildynex:ai-mode";

const AiModeContext = createContext<AiModeContextValue | null>(null);

export function AiModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AiMode>("balanced");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AI_MODE_STORAGE_KEY);
      if (stored) {
        setModeState(normalizeAiMode(stored));
      }
    } catch {
      // Ignore localStorage failures and keep the default mode.
    } finally {
      setMounted(true);
    }
  }, []);

  const value = useMemo<AiModeContextValue>(() => {
    const meta = getAiModeMeta(mode);
    return {
      mode,
      mounted,
      label: meta.label,
      helper: meta.helper,
      setMode: (nextMode: AiMode) => {
        setModeState(nextMode);
        try {
          window.localStorage.setItem(AI_MODE_STORAGE_KEY, nextMode);
        } catch {
          // Ignore localStorage failures and keep the in-memory selection.
        }
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
