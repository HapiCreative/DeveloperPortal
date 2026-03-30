import type { Metadata } from "next";
import Link from "next/link";
import { Book } from "lucide-react";
import { getProductSlugsWithDocs } from "@/lib/mdx/mdx";
import { getProductBySlug } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Browse documentation for all products.",
};

export default async function DocsLandingPage() {
  const productSlugs = getProductSlugsWithDocs();

  // Fetch DB info for each product (may be null if not in DB)
  const products = await Promise.all(
    productSlugs.map(async (slug) => {
      const dbProduct = await getProductBySlug(slug);
      return {
        slug,
        name:
          dbProduct?.name ??
          slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: dbProduct?.description ?? null,
        iconUrl: dbProduct?.iconUrl ?? null,
      };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        Documentation
      </h1>
      <p className="text-lg text-muted mb-10">
        Choose a product to browse its documentation.
      </p>

      {products.length === 0 ? (
        <p className="text-muted">No documentation available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/docs/${product.slug}/quickstart`}
              className="group flex items-start gap-4 rounded-lg border border-border p-5 transition-colors hover:border-primary/50 hover:bg-surface"
            >
              {product.iconUrl ? (
                <img
                  src={product.iconUrl}
                  alt=""
                  className="h-10 w-10 rounded-lg"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Book className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-1 text-sm text-muted line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
