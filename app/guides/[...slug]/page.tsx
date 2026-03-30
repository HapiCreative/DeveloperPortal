import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Pencil } from "lucide-react";

import {
  getGuideBySlug,
  getRelatedGuides,
  type GuideFrontmatter,
} from "@/lib/mdx/mdx";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TableOfContents } from "@/components/docs/toc";
import { FeedbackWidget } from "@/components/docs/feedback-widget";
import { MdxContent } from "@/components/docs/mdx-content";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

const GITHUB_EDIT_BASE =
  "https://github.com/your-org/developer-portal/edit/main/content/guides";

const categoryLabels: Record<string, string> = {
  "getting-started": "Getting Started",
  "core-concepts": "Core Concepts",
  "common-use-cases": "Common Use Cases",
  "advanced-patterns": "Advanced Patterns",
};

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guideSlug = slug.join("/");

  try {
    const guide = await getGuideBySlug(guideSlug);
    const fm = guide.frontmatter;

    return {
      title: fm.title,
      description: fm.description,
      alternates: { canonical: `/guides/${guideSlug}` },
      other: {
        "script:ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: fm.title,
          description: fm.description,
          totalTime: `PT${fm.estimatedMinutes}M`,
        }),
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

function RelatedGuideCard({
  guide,
}: {
  guide: { slug: string; frontmatter: GuideFrontmatter };
}) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex flex-col rounded-lg border border-border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {guide.frontmatter.title}
      </h4>
      <p className="mt-1 text-xs text-muted line-clamp-2 flex-1">
        {guide.frontmatter.description}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <DifficultyBadge difficulty={guide.frontmatter.difficulty} />
        <span className="text-xs text-muted flex items-center gap-1">
          <Clock className="h-3 w-3" />~{guide.frontmatter.estimatedMinutes} min
        </span>
      </div>
    </Link>
  );
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guideSlug = slug.join("/");

  let guide;
  try {
    guide = await getGuideBySlug(guideSlug);
  } catch {
    notFound();
  }

  const fm = guide.frontmatter;

  const relatedGuides = await getRelatedGuides(
    guideSlug,
    fm.products,
    fm.category
  );

  const breadcrumbItems = [
    { label: "Guides", href: "/guides" },
    { label: categoryLabels[fm.category] || fm.category },
    { label: fm.title },
  ];

  const editUrl = `${GITHUB_EDIT_BASE}/${guideSlug}.mdx`;

  const mdxSource = await serialize(guide.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: { dark: "github-dark-dimmed", light: "github-light" },
            defaultColor: "light",
          },
        ],
      ],
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex gap-8">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Guide header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              {fm.title}
            </h1>
            {fm.description && (
              <p className="text-lg text-muted mb-4">{fm.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <DifficultyBadge difficulty={fm.difficulty} />
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Clock className="h-4 w-4" />~{fm.estimatedMinutes} min
              </span>
              {fm.products.map((product) => (
                <Link
                  key={product}
                  href={`/products/${product}`}
                  className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {product}
                </Link>
              ))}
              {fm.updatedAt && (
                <span className="text-xs text-muted">
                  Updated{" "}
                  {new Date(fm.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </header>

          {/* MDX content */}
          <div className="prose-custom">
            <MdxContent source={mdxSource} />
          </div>

          {/* Updated date & edit link */}
          <div className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm text-muted">
            {fm.updatedAt && (
              <span>
                Last updated:{" "}
                {new Date(fm.updatedAt).toLocaleDateString("en-US", {
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

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Related guides
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides.map((g) => (
                  <RelatedGuideCard key={g.slug} guide={g} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Right sidebar — Table of Contents */}
        <aside className="hidden xl:block w-52 shrink-0">
          <div className="sticky top-24">
            <TableOfContents headings={guide.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
