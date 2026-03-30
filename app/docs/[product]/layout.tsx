import { getAllDocsForProduct } from "@/lib/mdx/mdx";
import { getProductBySlug } from "@/lib/db/products";
import { notFound } from "next/navigation";
import { DocsSidebar, MobileSidebarDrawer } from "@/components/docs/docs-sidebar";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const [docs, dbProduct] = await Promise.all([
    getAllDocsForProduct(product),
    getProductBySlug(product),
  ]);

  if (docs.length === 0) notFound();

  const productName = dbProduct?.name ?? product.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const iconUrl = dbProduct?.iconUrl ?? null;

  const sidebarProps = { product, productName, iconUrl, docs };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <div className="sticky top-16 z-30 -mx-4 bg-background/80 backdrop-blur-md border-b border-border px-4 py-2 lg:hidden">
        <MobileSidebarDrawer {...sidebarProps} />
      </div>

      <div className="flex gap-8 py-8">
        {/* Left sidebar — desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
            <DocsSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Center content + right TOC are rendered by page.tsx inside children */}
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
