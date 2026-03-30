"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const themes = ["light", "dark", "system"] as const;

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const currentIndex = themes.indexOf(theme as (typeof themes)[number]);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  const Icon = icons[(theme as keyof typeof icons) ?? "system"] ?? Monitor;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground transition-colors"
      aria-label={`Switch to ${nextTheme} theme`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
