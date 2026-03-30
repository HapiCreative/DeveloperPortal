"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowLeft, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocMeta } from "@/lib/mdx/mdx";

const sectionLabels: Record<string, string> = {
  quickstart: "Getting Started",
  "sdk-reference": "SDK Reference",
  "cli-reference": "CLI Reference",
  webhooks: "Webhooks",
};

const sectionOrder = ["quickstart", "sdk-reference", "cli-reference", "webhooks"];

interface DocsSidebarProps {
  product: string;
  productName: string;
  iconUrl?: string | null;
  docs: DocMeta[];
}

function groupBySection(docs: DocMeta[]) {
  const groups: Record<string, DocMeta[]> = {};
  for (const doc of docs) {
    const section = doc.frontmatter.section;
    if (!groups[section]) groups[section] = [];
    groups[section].push(doc);
  }
  return groups;
}

function SidebarSection({
  label,
  docs,
  product,
  pathname,
}: {
  label: string;
  docs: DocMeta[];
  product: string;
  pathname: string;
}) {
  const hasActive = docs.some(
    (d) => pathname === `/docs/${product}/${d.slug}`
  );
  const [open, setOpen] = useState(hasActive || label === "Getting Started");

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface rounded-md transition-colors"
      >
        {label}
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted" />
        )}
      </button>
      {open && (
        <ul className="ml-2 border-l border-border">
          {docs.map((doc) => {
            const href = `/docs/${product}/${doc.slug}`;
            const isActive = pathname === href;
            return (
              <li key={doc.slug}>
                <Link
                  href={href}
                  className={cn(
                    "block py-1.5 pl-4 pr-3 text-sm transition-colors",
                    isActive
                      ? "border-l-2 border-primary text-primary font-medium -ml-px"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {doc.frontmatter.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DocsSidebar({ product, productName, iconUrl, docs }: DocsSidebarProps) {
  const pathname = usePathname();
  const groups = groupBySection(docs);

  const content = (
    <div className="flex flex-col gap-1">
      {/* Back to product */}
      <Link
        href={`/products/${product}`}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to product
      </Link>

      {/* Product header */}
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-border mb-2">
        {iconUrl ? (
          <img src={iconUrl} alt="" className="h-6 w-6 rounded" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-xs font-bold">
            {productName.charAt(0)}
          </div>
        )}
        <span className="text-sm font-semibold text-foreground">{productName}</span>
      </div>

      {/* Sections */}
      {sectionOrder.map((sectionKey) => {
        const sectionDocs = groups[sectionKey];
        if (!sectionDocs || sectionDocs.length === 0) return null;
        return (
          <SidebarSection
            key={sectionKey}
            label={sectionLabels[sectionKey]}
            docs={sectionDocs}
            product={product}
            pathname={pathname}
          />
        );
      })}

      {/* API Reference link */}
      <Link
        href={`/products/${product}/api-reference`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors",
          pathname === `/products/${product}/api-reference`
            ? "text-primary bg-primary/5"
            : "text-foreground hover:bg-surface"
        )}
      >
        API Reference
      </Link>
    </div>
  );

  return content;
}

export function MobileSidebarDrawer(props: DocsSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground lg:hidden"
        aria-label="Open docs navigation"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-background border-r border-border p-4 lg:hidden">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1 hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DocsSidebar {...props} />
          </div>
        </>
      )}
    </>
  );
}
