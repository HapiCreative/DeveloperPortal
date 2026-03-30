import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import { getDocBySlug, getAllDocsForProduct } from "@/lib/mdx/mdx";
import { getProductBySlug } from "@/lib/db/products";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TableOfContents } from "@/components/docs/toc";
import { FeedbackWidget } from "@/components/docs/feedback-widget";
import { MdxContent } from "@/components/docs/mdx-content";

const GITHUB_EDIT_BASE = "https://github.com/your-org/developer-portal/edit/main/content/docs";

const sectionLabels: Record<string, string> = {
  quickstart: "Getting Started",
  "sdk-reference": "SDK Reference",
  "cli-reference": "CLI Reference",
  webhooks: "Webhooks",
};

type Props = {
  params: Promise<{ product: string; slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product, slug } = await params;
  const docSlug = slug.join("/");

  try {
    const doc = await getDocBySlug(product, docSlug);
    const title = doc.frontmatter.title;
    const description = doc.frontmatter.description;

    return {
      title,
      description,
      alternates: {
        canonical: `/docs/${product}/${docSlug}`,
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function DocPage({ params }: Props) {
  const { product, slug } = await params;
  const docSlug = slug.join("/");

  let doc;
  try {
    doc = await getDocBySlug(product, docSlug);
  } catch {
    notFound();
  }

  const allDocs = await getAllDocsForProduct(product);
  const dbProduct = await getProductBySlug(product);

  const productName =
    dbProduct?.name ??
    product.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Find prev/next docs by order
  const currentIndex = allDocs.findIndex((d) => d.slug === docSlug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  // Breadcrumbs
  const breadcrumbItems = [
    { label: "Docs", href: "/docs" },
    { label: productName, href: `/docs/${product}/${allDocs[0]?.slug ?? "quickstart"}` },
    ...(sectionLabels[doc.frontmatter.section]
      ? [{ label: sectionLabels[doc.frontmatter.section] }]
      : []),
    { label: doc.frontmatter.title },
  ];

  const editUrl = `${GITHUB_EDIT_BASE}/${product}/${docSlug}.mdx`;

  const mdxSource = await serialize(doc.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        [rehypePrettyCode, { theme: "github-dark-dimmed" }],
      ],
    },
  });

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <article className="min-w-0 flex-1">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Title area */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {doc.frontmatter.title}
        </h1>
        {doc.frontmatter.description && (
          <p className="text-lg text-muted mb-8">
            {doc.frontmatter.description}
          </p>
        )}

        {/* MDX content */}
        <div className="prose-custom">
          <MdxContent source={mdxSource} />
        </div>

        {/* Updated date & edit link */}
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm text-muted">
          {doc.frontmatter.updatedAt && (
            <span>
              Last updated:{" "}
              {new Date(doc.frontmatter.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit this page
          </a>
        </div>

        {/* Feedback widget */}
        <FeedbackWidget />

        {/* Prev / Next navigation */}
        <nav className="mt-8 flex items-stretch gap-4 border-t border-border pt-8">
          {prevDoc ? (
            <Link
              href={`/docs/${product}/${prevDoc.slug}`}
              className="flex flex-1 items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0">
                <div className="text-xs text-muted">Previous</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {prevDoc.frontmatter.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextDoc ? (
            <Link
              href={`/docs/${product}/${nextDoc.slug}`}
              className="flex flex-1 items-center justify-end gap-2 rounded-lg border border-border p-4 text-right transition-colors hover:border-primary/50 hover:bg-surface"
            >
              <div className="min-w-0">
                <div className="text-xs text-muted">Next</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {nextDoc.frontmatter.title}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </article>

      {/* Right sidebar — Table of Contents (desktop only) */}
      <aside className="hidden xl:block w-52 shrink-0">
        <div className="sticky top-24">
          <TableOfContents headings={doc.headings} />
        </div>
      </aside>
    </div>
  );
}
