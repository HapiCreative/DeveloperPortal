import { getProducts, getProductCategories, getProductCount } from "@/lib/db/products";
import { CatalogFilters } from "@/components/product-catalog/catalog-filters";
import { ProductCard } from "@/components/product-catalog/product-card";
import type { ProductStatus } from "@/lib/generated/prisma/client";
import { Box } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Products",
  description: "Browse our product catalog and find the right APIs and tools for your use case",
};

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["GA", "BETA", "COMING_SOON", "DEPRECATED"]);

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const categories = toArray(params.category);
  const types = toArray(params.type);
  const statuses = toArray(params.status).filter((s) =>
    VALID_STATUSES.has(s),
  ) as ProductStatus[];
  const search = typeof params.search === "string" ? params.search : undefined;

  const [products, allCategories, totalCount] = await Promise.all([
    getProducts({ search, categories, interactionTypes: types, statuses }),
    getProductCategories(),
    getProductCount(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Product Catalog
        </h1>
        <p className="mt-2 text-muted">
          Browse our APIs, SDKs, and tools to find the right integration for
          your use case
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-10">
        {/* Sidebar / Filter area */}
        <aside className="w-full shrink-0 lg:w-56">
          <CatalogFilters categories={allCategories} />
        </aside>

        {/* Main content */}
        <div className="mt-6 flex-1 lg:mt-0">
          {/* Result count */}
          <p className="mb-4 text-sm text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {products.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            products
          </p>

          {products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  description={product.description}
                  status={product.status}
                  iconUrl={product.iconUrl}
                  interactionTypes={product.interactionTypes}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <Box className="h-10 w-10 text-muted/40" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No products match your filters
              </h3>
              <p className="mt-1 text-sm text-muted">
                Try adjusting your search or filter criteria
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
