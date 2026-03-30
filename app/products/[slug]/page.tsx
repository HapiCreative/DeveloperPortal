import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  Globe,
  Code2,
  Terminal,
  Webhook,
  Zap,
  Layers,
  Blocks,
  Tag,
} from "lucide-react";
import { getProductBySlug } from "@/lib/db/products";
import { StatusBadge } from "@/components/ui/status-badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductTabs } from "@/components/product-detail/product-tabs";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} — Developer Portal`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
    },
  };
}

const INTERACTION_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  API: Globe,
  SDK: Code2,
  CLI: Terminal,
  Webhook: Webhook,
};

const USE_CASE_PLACEHOLDERS = [
  {
    icon: Zap,
    title: "Automate workflows",
    description:
      "Integrate into your CI/CD pipeline to automate repetitive tasks and reduce manual intervention.",
  },
  {
    icon: Layers,
    title: "Build custom dashboards",
    description:
      "Pull real-time data into your own monitoring dashboards for full visibility and control.",
  },
  {
    icon: Blocks,
    title: "Extend your platform",
    description:
      "Embed this product's capabilities directly into your application to deliver more value to your users.",
  },
];

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const activeTab = typeof sp.tab === "string" ? sp.tab : null;
  const showOverview = !activeTab;

  const initials = product.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "Products", href: "/products" },
          { label: product.category.name, href: `/products?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:gap-10">
        {/* Main content area */}
        <div className="min-w-0 flex-1">
          {/* ── Product Header ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            {/* Icon */}
            {product.iconUrl ? (
              <Image
                src={product.iconUrl}
                alt={`${product.name} icon`}
                width={64}
                height={64}
                className="shrink-0 rounded-xl"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {initials}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {product.name}
                </h1>
                <StatusBadge status={product.status} />
                {product.currentVersion && (
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                    {product.currentVersion}
                  </span>
                )}
              </div>

              <p className="mt-2 text-base text-muted leading-relaxed">
                {product.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/docs/${slug}/quickstart`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Interaction type pills */}
                {product.interactionTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.interactionTypes.map((type) => {
                      const Icon = INTERACTION_TYPE_ICONS[type];
                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted"
                        >
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                          {type}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Tabbed Navigation ── */}
          <div className="mt-8">
            <Suspense>
              <ProductTabs slug={slug} interactionTypes={product.interactionTypes} />
            </Suspense>
          </div>

          {/* ── Tab Content ── */}
          {showOverview && (
            <div className="mt-8 space-y-10">
              {/* Full description / overview */}
              <section>
                <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                <p className="mt-2 leading-relaxed text-muted">{product.description}</p>
              </section>

              {/* Use Case Examples */}
              <section>
                <h2 className="text-lg font-semibold text-foreground">What you can build</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {USE_CASE_PLACEHOLDERS.map((uc) => (
                    <div
                      key={uc.title}
                      className="rounded-xl border border-border bg-surface-elevated p-5 transition-colors hover:border-primary/30"
                    >
                      <uc.icon className="h-8 w-8 text-primary" />
                      <h3 className="mt-3 font-semibold text-foreground">{uc.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{uc.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Placeholder content for other tabs */}
          {activeTab && activeTab !== "overview" && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-lg font-semibold text-foreground">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} documentation
              </p>
              <p className="mt-1 text-sm text-muted">
                This section is coming soon.
              </p>
            </div>
          )}
        </div>

        {/* ── Metadata Sidebar (desktop) ── */}
        <aside className="order-first mb-6 w-full shrink-0 lg:order-last lg:mb-0 lg:w-64">
          <div className="rounded-xl border border-border bg-surface-elevated p-5 lg:sticky lg:top-20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Product info
            </h3>

            <dl className="mt-4 space-y-4 text-sm">
              {/* Version */}
              {product.currentVersion && (
                <div>
                  <dt className="font-medium text-foreground">Version</dt>
                  <dd className="mt-0.5 text-muted">{product.currentVersion}</dd>
                </div>
              )}

              {/* Status */}
              <div>
                <dt className="font-medium text-foreground">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={product.status} />
                </dd>
              </div>

              {/* Category */}
              <div>
                <dt className="font-medium text-foreground">Category</dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/products?category=${product.category.slug}`}
                    className="text-primary hover:underline"
                  >
                    {product.category.name}
                  </Link>
                </dd>
              </div>

              {/* Interaction types */}
              {product.interactionTypes.length > 0 && (
                <div>
                  <dt className="font-medium text-foreground">Interaction types</dt>
                  <dd className="mt-1.5 flex flex-col gap-1.5">
                    {product.interactionTypes.map((type) => {
                      const Icon = INTERACTION_TYPE_ICONS[type];
                      return (
                        <span key={type} className="inline-flex items-center gap-2 text-muted">
                          {Icon && <Icon className="h-4 w-4" />}
                          {type}
                        </span>
                      );
                    })}
                  </dd>
                </div>
              )}
            </dl>

            {/* Links */}
            <div className="mt-5 border-t border-border pt-4">
              <Link
                href={`/changelog/${slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Tag className="h-3.5 w-3.5" />
                View changelog
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
