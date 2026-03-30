"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import type { GuideMeta } from "@/lib/mdx/mdx";

interface Product {
  slug: string;
  name: string;
}

const categoryConfig = {
  "getting-started": {
    label: "Getting Started",
    description: "Guides for first-time users getting up and running",
  },
  "core-concepts": {
    label: "Core Concepts",
    description: "Fundamental patterns and practices for building with our APIs",
  },
  "common-use-cases": {
    label: "Common Use Cases",
    description: "Real-world scenarios and practical implementations",
  },
  "advanced-patterns": {
    label: "Advanced Patterns",
    description: "Complex multi-product integrations and architecture patterns",
  },
} as const;

const categoryOrder = [
  "getting-started",
  "core-concepts",
  "common-use-cases",
  "advanced-patterns",
] as const;

const difficultyOptions = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

function GuideCard({ guide }: { guide: GuideMeta }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-background p-5 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {guide.frontmatter.title}
      </h3>
      <p className="mt-1.5 text-sm text-muted line-clamp-2 flex-1">
        {guide.frontmatter.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={guide.frontmatter.difficulty} />
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" />
          ~{guide.frontmatter.estimatedMinutes} min
        </span>
        {guide.frontmatter.products.map((product) => (
          <span
            key={product}
            className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs text-muted"
          >
            {product}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function GuidesListing({
  guides,
  products,
}: {
  guides: GuideMeta[];
  products: Product[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeDifficulty = searchParams.get("difficulty") || "all";
  const activeProduct = searchParams.get("product") || "all";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const filtered = guides.filter((g) => {
    if (
      activeDifficulty !== "all" &&
      g.frontmatter.difficulty !== activeDifficulty
    )
      return false;
    if (
      activeProduct !== "all" &&
      !g.frontmatter.products.includes(activeProduct)
    )
      return false;
    return true;
  });

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      ...categoryConfig[cat],
      guides: filtered.filter((g) => g.frontmatter.category === cat),
    }))
    .filter((g) => g.guides.length > 0);

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-10 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <span className="text-sm font-medium text-foreground">Filter:</span>

        {/* Difficulty filter */}
        <div className="flex gap-1">
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter("difficulty", opt.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                activeDifficulty === opt.value
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-foreground border border-border"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Product filter */}
        <div className="relative">
          <select
            value={activeProduct}
            onChange={(e) => updateFilter("product", e.target.value)}
            className="appearance-none rounded-full border border-border bg-background px-3 py-1.5 pr-7 text-xs font-medium text-muted transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Category sections */}
      {grouped.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-muted">No guides match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-semibold text-foreground">
                {section.label}
              </h2>
              <p className="mt-1 text-sm text-muted">{section.description}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.guides.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
