"use client";

import {
  useLanguage,
  LANGUAGE_LABELS,
  type SupportedLanguage,
} from "@/lib/mdx/language-context";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  availableLanguages?: SupportedLanguage[];
}

export function LanguageSwitcher({ availableLanguages }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  // If no available languages provided or empty, don't render
  if (!availableLanguages || availableLanguages.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            language === lang
              ? "bg-primary text-white"
              : "bg-surface text-muted hover:bg-surface-elevated hover:text-foreground"
          )}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
