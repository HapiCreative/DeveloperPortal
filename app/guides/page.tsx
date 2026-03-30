import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { getAllGuides } from "@/lib/mdx/mdx";
import { getProducts } from "@/lib/db/products";
import { GuidesListing } from "@/components/guides/guides-listing";

export const metadata: Metadata = {
  title: "Guides & Tutorials",
  description:
    "Step-by-step tutorials to help you build, from quickstart to advanced patterns.",
};

export default async function GuidesPage() {
  const [guides, products] = await Promise.all([
    getAllGuides(),
    getProducts().catch(() => []),
  ]);

  const productList = products.map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <BookOpen className="h-4 w-4" />
          {guides.length} guides
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Guides & Tutorials
        </h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">
          Step-by-step tutorials to help you build, from quickstart to advanced
          patterns.
        </p>
      </div>

      <Suspense fallback={null}>
        <GuidesListing guides={guides} products={productList} />
      </Suspense>
    </div>
  );
}
