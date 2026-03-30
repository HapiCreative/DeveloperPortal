"use client";

import { LanguageProvider } from "@/lib/mdx/language-context";

/**
 * Client-side wrapper that provides the language context to all doc pages.
 * Separated into its own component so the docs layout can remain a server component.
 */
export function DocsLanguageWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
