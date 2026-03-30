"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VersionInfo {
  version: string;
  label?: string;
  deprecated?: boolean;
}

interface VersionSelectorProps {
  product: string;
  currentVersion: string;
  versions: VersionInfo[];
}

export function VersionSelector({
  product,
  currentVersion,
  versions,
}: VersionSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = versions.find((v) => v.version === currentVersion);
  const isDeprecated = current?.deprecated ?? false;
  const latestVersion = versions.find((v) => !v.deprecated)?.version;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleVersionChange(version: string) {
    setOpen(false);
    // Replace the version segment in the URL
    // Pattern: /docs/{product}/v{X}/... → /docs/{product}/v{Y}/...
    // Or if no version in URL: /docs/{product}/... → /docs/{product}/v{Y}/...
    const versionPattern = new RegExp(`(/docs/${product})(/v[^/]+)?(/.*)?`);
    const match = pathname.match(versionPattern);
    if (match) {
      const base = match[1];
      const rest = match[3] || "";
      const newPath = `${base}/${version}${rest}`;
      router.push(newPath);
    }
  }

  // Don't render if there's only one version
  if (versions.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            "border-border bg-background text-foreground hover:bg-surface"
          )}
        >
          {current?.label ?? currentVersion}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-background py-1 shadow-lg">
            {versions.map((v) => (
              <button
                key={v.version}
                onClick={() => handleVersionChange(v.version)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  v.version === currentVersion
                    ? "bg-primary/5 text-primary font-medium"
                    : "text-foreground hover:bg-surface",
                  v.deprecated && "text-muted"
                )}
              >
                {v.label ?? v.version}
                {v.deprecated && (
                  <span className="ml-auto text-xs text-warning">deprecated</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Deprecation warning banner */}
      {isDeprecated && latestVersion && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            You&apos;re viewing docs for an older version.{" "}
            <button
              onClick={() => handleVersionChange(latestVersion)}
              className="font-medium underline underline-offset-2 hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              See the latest version
            </button>
            .
          </span>
        </div>
      )}
    </div>
  );
}
