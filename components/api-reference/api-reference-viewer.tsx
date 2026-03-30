"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ApiReferenceViewerProps {
  specUrl?: string;
  specContent?: string;
}

export function ApiReferenceViewer({
  specUrl,
  specContent,
}: ApiReferenceViewerProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="scalar-wrapper">
      <ApiReferenceReact
        configuration={{
          url: specUrl,
          content: specContent,
          layout: "modern",
          theme: "none",
          forceDarkModeState:
            resolvedTheme === "dark" ? "dark" : "light",
          hideDarkModeToggle: true,
          showSidebar: true,
          hideTestRequestButton: false,
          defaultOpenAllTags: true,
          _integration: "nextjs",
          withDefaultFonts: false,
          customCss: `
            .scalar-api-reference {
              --scalar-font: 'Inter', ui-sans-serif, system-ui, sans-serif;
              --scalar-font-code: 'JetBrains Mono', ui-monospace, monospace;
              --scalar-radius: 8px;
              --scalar-radius-lg: 12px;
            }
            .light-mode .scalar-api-reference {
              --scalar-background-1: var(--background, #ffffff);
              --scalar-background-2: var(--surface, #f9fafb);
              --scalar-background-3: var(--surface-elevated, #ffffff);
              --scalar-border-color: var(--border, #e5e7eb);
              --scalar-color-1: var(--foreground, #111827);
              --scalar-color-2: var(--muted, #6b7280);
              --scalar-color-3: #9ca3af;
              --scalar-color-accent: var(--color-primary-600, #2563eb);
            }
            .dark-mode .scalar-api-reference {
              --scalar-background-1: var(--background, #0b0f1a);
              --scalar-background-2: var(--surface, #111827);
              --scalar-background-3: var(--surface-elevated, #1e293b);
              --scalar-border-color: var(--border, #1e293b);
              --scalar-color-1: var(--foreground, #f1f5f9);
              --scalar-color-2: var(--muted, #94a3b8);
              --scalar-color-3: #64748b;
              --scalar-color-accent: var(--color-primary-500, #3b82f6);
            }
          `,
        }}
      />
    </div>
  );
}
