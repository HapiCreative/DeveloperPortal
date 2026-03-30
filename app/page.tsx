import Link from "next/link";
import { Search, Box, BookOpen, Compass, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, changelogs] = await Promise.all([
    prisma.product.findMany({
      where: { status: "GA", visibility: "PUBLIC" },
      orderBy: { sortOrder: "asc" },
      take: 6,
      include: { category: true },
    }),
    prisma.changelog.findMany({
      where: { publishedAt: { not: undefined } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { product: true },
    }),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-50/30 dark:from-primary/10 dark:to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build with{" "}
              <span className="text-primary">DevPortal</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted sm:text-xl">
              Everything you need to integrate, from quickstart guides to full
              API references
            </p>

            {/* Search bar placeholder */}
            <div className="mt-10 flex justify-center">
              <button className="group flex w-full max-w-lg items-center gap-3 rounded-xl border border-border bg-surface-elevated px-5 py-3.5 text-left text-muted shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <Search className="h-5 w-5 shrink-0 text-muted/60 transition-colors group-hover:text-primary" />
                <span className="flex-1 text-sm">
                  Search docs, APIs, and guides...
                </span>
                <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs text-muted sm:inline-flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PillarCard
            href="/products"
            icon={<Box className="h-6 w-6" />}
            title="Explore Products"
            description="Browse our product catalog and find the right APIs and tools for your use case"
          />
          <PillarCard
            href="/docs"
            icon={<BookOpen className="h-6 w-6" />}
            title="Read Documentation"
            description="Detailed API references, SDK docs, and technical specifications"
          />
          <PillarCard
            href="/guides"
            icon={<Compass className="h-6 w-6" />}
            title="Follow Guides"
            description="Step-by-step tutorials to help you build, from quickstart to advanced patterns"
          />
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Popular products
            </h2>
            <Link
              href="/products"
              className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <StatusBadge status={product.status} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                  {product.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  View docs
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Changelog Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What&apos;s new
          </h2>
          <Link
            href="/changelog"
            className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View all changes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 divide-y divide-border">
          {changelogs.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-6">
              <time className="shrink-0 text-sm tabular-nums text-muted sm:w-28">
                {entry.publishedAt
                  ? new Date(entry.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </time>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {entry.product.name}
                  </span>
                  {entry.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
                <p className="mt-1 font-medium text-foreground">
                  {entry.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PillarCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-surface-elevated p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {description}
      </p>
      <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Get started
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    GA: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    BETA: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    COMING_SOON: "bg-surface text-muted",
    DEPRECATED: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  };

  const labels: Record<string, string> = {
    GA: "GA",
    BETA: "Beta",
    COMING_SOON: "Coming Soon",
    DEPRECATED: "Deprecated",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-surface text-muted"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  const styles: Record<string, string> = {
    feature: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    bugfix: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    breaking: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
    security: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[tag] ?? "bg-surface text-muted"}`}
    >
      {tag}
    </span>
  );
}
