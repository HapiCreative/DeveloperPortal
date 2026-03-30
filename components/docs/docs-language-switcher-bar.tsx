"use client";

import { LanguageSwitcher } from "@/components/docs/language-switcher";
import { SUPPORTED_LANGUAGES } from "@/lib/mdx/language-context";

/**
 * Thin client wrapper that renders the LanguageSwitcher with all supported languages.
 * Placed in the docs layout sticky bar so the selection persists across pages.
 */
export function DocsLanguageSwitcherBar() {
  return <LanguageSwitcher availableLanguages={[...SUPPORTED_LANGUAGES]} />;
}
