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

export async function getAllGuides(): Promise<GuideMeta[]> {
  const guidesDir = path.join(CONTENT_DIR, "guides");

  if (!fs.existsSync(guidesDir)) {
    return [];
  }

  const files = fs
    .readdirSync(guidesDir)
    .filter((f) => f.endsWith(".mdx"));

  const guides: GuideMeta[] = files.map((file) => {
    const filePath = path.join(guidesDir, file);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug: file.replace(/\.mdx$/, ""),
      frontmatter: data as GuideFrontmatter,
    };
  });

  return guides.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}
