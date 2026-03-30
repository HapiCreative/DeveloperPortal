"use client";

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from "react";

export const SUPPORTED_LANGUAGES = [
  "python",
  "node",
  "java",
  "go",
  "ruby",
  "php",
  "csharp",
  "curl",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  python: "Python",
  node: "Node.js",
  java: "Java",
  go: "Go",
  ruby: "Ruby",
  php: "PHP",
  csharp: "C#",
  curl: "cURL",
};

const STORAGE_KEY = "devportal-language";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "python";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }
  return "python";
}

// Listeners for useSyncExternalStore
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const storedLanguage = useSyncExternalStore(
    subscribe,
    readStoredLanguage,
    () => "python" as SupportedLanguage
  );

  const [language, setLanguageState] = useState(storedLanguage);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    listeners.forEach((cb) => cb());
  }, []);

  // Keep in sync if external store changes (e.g. another tab)
  const effectiveLanguage = storedLanguage !== language ? storedLanguage : language;

  return (
    <LanguageContext.Provider value={{ language: effectiveLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
