import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface DocFrontmatter {
  title: string;
  description: string;
  product: string;
  section: "quickstart" | "sdk-reference" | "cli-reference" | "webhooks";
  order: number;
  updatedAt: string;
}

export interface GuideFrontmatter {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  products: string[];
  category:
    | "getting-started"
    | "core-concepts"
    | "common-use-cases"
    | "advanced-patterns";
  order: number;
  updatedAt: string;
}

export interface HeadingNode {
  depth: number;
  text: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

/**
 * Extract headings from raw MDX content for table of contents.
 * Parses ATX-style headings (## Heading) from the markdown source.
 */
export function extractHeadings(content: string): HeadingNode[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: HeadingNode[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].replace(/\{#[\w-]+\}/, "").trim();
    headings.push({ depth, text, slug: slugify(text) });
  }

  return headings;
}

export interface DocResult {
  content: string;
  frontmatter: DocFrontmatter;
  headings: HeadingNode[];
}

export async function getDocBySlug(
  product: string,
  slug: string
): Promise<DocResult> {
  const filePath = path.join(CONTENT_DIR, "docs", product, `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(fileContents);

  return {
    content,
    frontmatter: data as DocFrontmatter,
    headings: extractHeadings(content),
  };
}

export interface DocMeta {
  slug: string;
  frontmatter: DocFrontmatter;
}

export async function getAllDocsForProduct(
  product: string
): Promise<DocMeta[]> {
  const docsDir = path.join(CONTENT_DIR, "docs", product);

  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith(".mdx"));

  const docs: DocMeta[] = files.map((file) => {
    const filePath = path.join(docsDir, file);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug: file.replace(/\.mdx$/, ""),
      frontmatter: data as DocFrontmatter,
    };
  });

  return docs.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export interface GuideResult {
  content: string;
  frontmatter: GuideFrontmatter;
  headings: HeadingNode[];
}

export async function getGuideBySlug(slug: string): Promise<GuideResult> {
  const filePath = path.join(CONTENT_DIR, "guides", `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(fileContents);

  return {
    content,
    frontmatter: data as GuideFrontmatter,
    headings: extractHeadings(content),
  };
}

export interface GuideMeta {
  slug: string;
  frontmatter: GuideFrontmatter;
}

/**
 * Recursively collects all .mdx files under a directory,
 * returning paths relative to the base directory (without extension).
 */
function collectMdxFiles(dir: string, base: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMdxFiles(fullPath, base));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const relative = path.relative(base, fullPath);
      results.push(relative.replace(/\.mdx$/, ""));
    }
  }

  return results;
}

export async function getAllGuides(): Promise<GuideMeta[]> {
  const guidesDir = path.join(CONTENT_DIR, "guides");

  if (!fs.existsSync(guidesDir)) {
    return [];
  }

  const slugs = collectMdxFiles(guidesDir, guidesDir);

  const guides: GuideMeta[] = slugs.map((slug) => {
    const filePath = path.join(guidesDir, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug,
      frontmatter: data as GuideFrontmatter,
    };
  });

  return guides.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

/**
 * Find up to `limit` related guides based on shared products or category.
 */
export async function getRelatedGuides(
  currentSlug: string,
  products: string[],
  category: string,
  limit = 3
): Promise<GuideMeta[]> {
  const allGuides = await getAllGuides();

  const scored = allGuides
    .filter((g) => g.slug !== currentSlug)
    .map((g) => {
      let score = 0;
      // Shared products
      const sharedProducts = g.frontmatter.products.filter((p) =>
        products.includes(p)
      );
      score += sharedProducts.length * 2;
      // Same category
      if (g.frontmatter.category === category) score += 1;
      return { guide: g, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.guide);
}

/**
 * Returns slugs of all products that have at least one MDX doc file.
 */
export function getProductSlugsWithDocs(): string[] {
  const docsDir = path.join(CONTENT_DIR, "docs");
  if (!fs.existsSync(docsDir)) return [];

  return fs
    .readdirSync(docsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      const files = fs.readdirSync(path.join(docsDir, name));
      return files.some((f) => f.endsWith(".mdx"));
    });
}
