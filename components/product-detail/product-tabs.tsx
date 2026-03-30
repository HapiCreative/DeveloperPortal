"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  href: string;
}

const INTERACTION_TYPE_TABS: Record<string, { label: string; suffix: string }> = {
  API: { label: "API Reference", suffix: "/api-reference" },
  SDK: { label: "SDKs & Libraries", suffix: "?tab=sdks" },
  CLI: { label: "CLI Tools", suffix: "?tab=cli" },
  Webhook: { label: "Webhooks", suffix: "?tab=webhooks" },
};

export function ProductTabs({
  slug,
  interactionTypes,
}: {
  slug: string;
  interactionTypes: string[];
}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  const tabs: Tab[] = [
    { id: "overview", label: "Overview", href: `/products/${slug}` },
    ...interactionTypes
      .map((type) => {
        const config = INTERACTION_TYPE_TABS[type];
        if (!config) return null;
        if (type === "API") {
          return { id: "api", label: config.label, href: `/products/${slug}${config.suffix}` };
        }
        return { id: type.toLowerCase(), label: config.label, href: `/products/${slug}${config.suffix}` };
      })
      .filter((t): t is Tab => t !== null),
  ];

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Product sections">
        {tabs.map((tab) => {
          const isActive =
            tab.id === "overview"
              ? activeTab === "overview" && !searchParams.has("tab")
              : activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              className={cn(
                "shrink-0 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:border-border hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
