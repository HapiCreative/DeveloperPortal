"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { HeadingNode } from "@/lib/mdx/mdx";

interface TocProps {
  headings: HeadingNode[];
}

export function TableOfContents({ headings }: TocProps) {
  const [activeSlug, setActiveSlug] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Filter to only h2 and h3
  const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3);

  useEffect(() => {
    if (tocHeadings.length === 0) return;

    const slugs = tocHeadings.map((h) => h.slug);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting (visible)
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const slug of slugs) {
      const el = document.getElementById(slug);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tocHeadings]);

  if (tocHeadings.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <h4 className="mb-3 text-sm font-semibold text-foreground">On this page</h4>
      <ul className="space-y-1 text-sm">
        {tocHeadings.map((heading) => (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.slug);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                  setActiveSlug(heading.slug);
                  // Update URL hash without jumping
                  history.replaceState(null, "", `#${heading.slug}`);
                }
              }}
              className={cn(
                "block py-1 transition-colors",
                heading.depth === 3 && "pl-3",
                activeSlug === heading.slug
                  ? "text-primary font-medium"
                  : "text-muted hover:text-foreground"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
