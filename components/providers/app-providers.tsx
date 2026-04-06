"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AiModeProvider } from "@/context/ai-mode-context";
import { AuthProvider } from "@/context/auth-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AiModeProvider>{children}</AiModeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
