import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/db/products";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ApiReferenceViewer } from "@/components/api-reference/api-reference-viewer";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `API Reference — ${product.name} — Developer Portal`,
    description: `Complete API reference for ${product.name}. Explore endpoints, request/response schemas, and test API calls interactively.`,
  };
}

export default async function ApiReferencePage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  if (!product.openapiSpecPath) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: "Products", href: "/products" },
            { label: product.name, href: `/products/${slug}` },
            { label: "API Reference" },
          ]}
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-semibold text-foreground">
            No API reference available
          </p>
          <p className="mt-1 text-sm text-muted">
            This product does not have an OpenAPI specification yet.
          </p>
        </div>
      </div>
    );
  }

  // Derive the product key from the spec path (e.g., "/specs/product-a.yaml" -> "product-a")
  const specKey = product.openapiSpecPath
    .replace(/^\/specs\//, "")
    .replace(/\.(yaml|yml|json)$/, "");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "Products", href: "/products" },
          { label: product.name, href: `/products/${slug}` },
          { label: "API Reference" },
        ]}
      />
      <ApiReferenceViewer specUrl={`/api/specs/${specKey}`} />
    </div>
  );
}
