"use client";

import { MoonIcon, SunIcon } from "@/components/shared/icons";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { mounted, resolvedTheme, toggleTheme } = useTheme();

  const isLight = mounted && resolvedTheme === "light";
  const label = isLight ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "secondary-button button-shell theme-toggle-button",
        showLabel ? "min-w-[9.5rem]" : "px-3.5",
        className
      )}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      <span className="button-icon">
        {isLight ? (
          <SunIcon className="h-4 w-4" />
        ) : (
          <MoonIcon className="h-4 w-4" />
        )}
      </span>
      {showLabel ? <span className="button-label">{label}</span> : null}
    </button>
  );
}
