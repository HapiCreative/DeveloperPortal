"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import { CodeBlock } from "@/components/ui/code-block";
import {
  useLanguage,
  type SupportedLanguage,
} from "@/lib/mdx/language-context";

// When true, Pre renders a bare <pre> without wrapper/header (CodeGroup provides its own)
const CodeGroupContext = createContext(false);
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
  Link as LinkIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Heading with anchor link
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const;
  const sizes: Record<number, string> = {
    1: "text-3xl font-bold mt-10 mb-4",
    2: "text-2xl font-semibold mt-8 mb-3",
    3: "text-xl font-semibold mt-6 mb-2",
    4: "text-lg font-semibold mt-4 mb-2",
    5: "text-base font-semibold mt-4 mb-1",
    6: "text-sm font-semibold mt-4 mb-1",
  };

  function HeadingComponent({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text =
      typeof children === "string"
        ? children
        : React.Children.toArray(children)
            .map((child) => (typeof child === "string" ? child : ""))
            .join("");
    const id = props.id ?? slugify(text);

    return (
      <Tag id={id} className={cn("group scroll-mt-24 text-foreground", sizes[level])} {...props}>
        <a
          href={`#${id}`}
          className="inline-flex items-center text-inherit no-underline hover:underline"
        >
          {children}
          <LinkIcon className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50" />
        </a>
      </Tag>
    );
  }

  HeadingComponent.displayName = `Heading${level}`;
  return HeadingComponent;
}

// ---------------------------------------------------------------------------
// Code blocks
// ---------------------------------------------------------------------------

function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const insideCodeGroup = useContext(CodeGroupContext);
  const propsRecord = props as Record<string, unknown>;

  // Inside CodeGroup — render bare <pre> without wrapper (CodeGroup provides its own)
  if (insideCodeGroup) {
    return (
      <pre
        {...props}
        className={cn(
          "overflow-x-auto p-4 text-sm leading-relaxed",
          "font-[var(--font-jetbrains-mono)]",
          "max-h-[32rem] overflow-y-auto",
          props.className
        )}
      >
        {children}
      </pre>
    );
  }

  const codeEl = React.Children.toArray(children).find(
    (child): child is React.ReactElement =>
      React.isValidElement(child) && (child as React.ReactElement).type === "code"
  );

  const codeText =
    codeEl && typeof (codeEl.props as { children?: unknown }).children === "string"
      ? ((codeEl.props as { children: string }).children)
      : "";

  const dataLanguage =
    propsRecord["data-language"] ??
    (codeEl &&
      ((codeEl.props as Record<string, unknown>)["data-language"] as string | undefined));

  // Parse meta string attributes for enhanced features
  const rawMeta = (propsRecord["data-meta"] as string) ?? "";
  const showLineNumbers = rawMeta.includes("showLineNumbers");
  const titleMatch = rawMeta.match(/title="([^"]+)"/);
  const title = titleMatch?.[1] ?? undefined;

  // Parse highlight lines: {1,3-5}
  const highlightMatch = rawMeta.match(/\{([^}]+)\}/);
  const highlightLines: number[] = [];
  if (highlightMatch) {
    for (const part of highlightMatch[1].split(",")) {
      const range = part.trim().split("-");
      if (range.length === 2) {
        const start = parseInt(range[0], 10);
        const end = parseInt(range[1], 10);
        for (let i = start; i <= end; i++) highlightLines.push(i);
      } else {
        highlightLines.push(parseInt(range[0], 10));
      }
    }
  }

  const hasEnhancements = showLineNumbers || highlightLines.length > 0 || title;

  if (hasEnhancements) {
    return (
      <CodeBlock
        language={dataLanguage ? String(dataLanguage) : undefined}
        title={title}
        showLineNumbers={showLineNumbers}
        highlightLines={highlightLines}
      >
        {children}
      </CodeBlock>
    );
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {dataLanguage && (
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {String(dataLanguage)}
        </div>
      )}
      <CopyButton text={codeText} />
      <pre
        {...props}
        className={cn(
          "overflow-x-auto p-4 text-sm leading-relaxed",
          "font-[var(--font-jetbrains-mono)]",
          "max-h-[32rem] overflow-y-auto",
          props.className
        )}
      >
        {children}
      </pre>
    </div>
  );
}

function Code({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  // rehype-pretty-code sets data-theme on code elements inside pre blocks.
  // Those should pass through unstyled — the Pre wrapper handles their container.
  const isCodeBlock = (props as Record<string, unknown>)["data-theme"] !== undefined ||
                       (props as Record<string, unknown>)["data-language"] !== undefined;

  if (isCodeBlock) {
    return <code {...props}>{children}</code>;
  }

  // Inline code — add styling
  return (
    <code
      {...props}
      className={cn(
        "rounded-md bg-gray-100 px-1.5 py-0.5 text-sm font-medium",
        "font-[var(--font-jetbrains-mono)]",
        "dark:bg-gray-800",
        props.className
      )}
    >
      {children}
    </code>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

function Table(props: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm" {...props} />
    </div>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold dark:border-gray-700 dark:bg-gray-800/50"
      {...props}
    />
  );
}

function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className="border-b border-gray-200 px-4 py-3 dark:border-gray-700"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

function Anchor({
  href = "",
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300"
      {...props}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Blockquote
// ---------------------------------------------------------------------------

function Blockquote(props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className="my-6 border-l-4 border-blue-500 bg-blue-50 py-3 pl-4 pr-4 text-sm text-blue-900 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200 [&>p]:m-0"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Custom components: Callout
// ---------------------------------------------------------------------------

const calloutConfig = {
  info: {
    icon: Info,
    border: "border-blue-500 dark:border-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-900 dark:text-blue-200",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-yellow-500 dark:border-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-900 dark:text-yellow-200",
    iconColor: "text-yellow-500 dark:text-yellow-400",
  },
  danger: {
    icon: AlertOctagon,
    border: "border-red-500 dark:border-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-900 dark:text-red-200",
    iconColor: "text-red-500 dark:text-red-400",
  },
  tip: {
    icon: Lightbulb,
    border: "border-green-500 dark:border-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-900 dark:text-green-200",
    iconColor: "text-green-500 dark:text-green-400",
  },
};

interface CalloutProps {
  type?: "info" | "warning" | "danger" | "tip";
  children: React.ReactNode;
}

function Callout({ type = "info", children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border-l-4 p-4 text-sm",
        config.border,
        config.bg,
        config.text
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconColor)} />
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom components: CodeGroup (tabbed code blocks)
// ---------------------------------------------------------------------------

interface CodeGroupProps {
  children: React.ReactNode;
}

/** Extracts plain text from a React node tree for the copy button. */
function extractCodeText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractCodeText).join("");
  if (React.isValidElement(node)) {
    return extractCodeText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

/** Traverses a React element tree to find a prop value (e.g. data-label, data-language). */
function findPropDeep(node: React.ReactNode, propName: string): string | undefined {
  if (!React.isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (props[propName]) return String(props[propName]);
  const children = React.Children.toArray(props.children as React.ReactNode);
  for (const child of children) {
    const found = findPropDeep(child, propName);
    if (found) return found;
  }
  return undefined;
}

function CodeGroup({ children }: CodeGroupProps) {
  let contextLanguage: SupportedLanguage | null = null;
  try {
    const ctx = useLanguage();
    contextLanguage = ctx.language;
  } catch {
    // Not inside LanguageProvider — fall back to manual tab selection
  }

  const tabs = React.Children.toArray(children).filter(React.isValidElement);

  const tabInfo = useMemo(() => {
    return tabs.map((tab, i) => {
      // Look deep into the tree (Figure → Pre → Code) for label/language
      const label =
        findPropDeep(tab, "data-label") ??
        findPropDeep(tab, "data-language") ??
        `Tab ${i + 1}`;
      const langKey = label.toLowerCase().replace(/[^a-z]/g, "");
      return { label, langKey };
    });
  }, [tabs]);

  // Determine active tab: prefer language context match, otherwise first tab
  const contextMatchIndex = contextLanguage
    ? tabInfo.findIndex(
        (t) =>
          t.langKey === contextLanguage ||
          t.langKey === contextLanguage.replace(/[^a-z]/g, "")
      )
    : -1;

  const [manualTab, setManualTab] = useState(0);
  const activeTab = contextMatchIndex >= 0 ? contextMatchIndex : manualTab;

  const activeContent = tabs[activeTab];
  const activeText = activeContent ? extractCodeText(activeContent) : "";

  return (
    <CodeGroupContext.Provider value={true}>
      <div className="group relative my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex gap-0">
            {tabInfo.map((info, i) => (
              <button
                key={info.label + i}
                onClick={() => setManualTab(i)}
                className={cn(
                  "px-4 py-2 text-xs font-medium transition-colors",
                  i === activeTab
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                {info.label}
              </button>
            ))}
          </div>
          <div className="pr-2">
            <CopyButton text={activeText} className="relative opacity-100 right-0 top-0 position-static" />
          </div>
        </div>
        <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">{tabs[activeTab]}</div>
      </div>
    </CodeGroupContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Custom components: Steps
// ---------------------------------------------------------------------------

interface StepsProps {
  children: React.ReactNode;
}

function Steps({ children }: StepsProps) {
  return (
    <div className="my-8 ml-4 border-l-2 border-gray-200 pl-6 dark:border-gray-700 [&>h3]:mt-0">
      {React.Children.map(children, (child, index) => (
        <div className="relative mb-8 last:mb-0">
          <div className="absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
            {index + 1}
          </div>
          <div className="pt-0.5">{child}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom components: ApiEndpoint
// ---------------------------------------------------------------------------

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  PATCH: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

interface ApiEndpointProps {
  method: string;
  path: string;
}

function ApiEndpoint({ method, path }: ApiEndpointProps) {
  const colorClass =
    methodColors[method.toUpperCase()] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return (
    <div className="my-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
      <span
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
          colorClass
        )}
      >
        {method}
      </span>
      <code className="text-sm font-medium font-[var(--font-jetbrains-mono)]">
        {path}
      </code>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Paragraph & list styling
// ---------------------------------------------------------------------------

function Paragraph(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="my-4 leading-7 text-foreground/90" {...props} />;
}

function UnorderedList(props: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className="my-4 ml-6 list-disc space-y-2 text-foreground/90"
      {...props}
    />
  );
}

function OrderedList(props: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className="my-4 ml-6 list-decimal space-y-2 text-foreground/90"
      {...props}
    />
  );
}

function HorizontalRule() {
  return <hr className="my-8 border-gray-200 dark:border-gray-700" />;
}

// ---------------------------------------------------------------------------
// Figure (strip rehype-pretty-code's <figure> wrapper)
// ---------------------------------------------------------------------------

function Figure({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  // rehype-pretty-code wraps code blocks in <figure data-rehype-pretty-code-figure>.
  // Render its children directly to avoid default figure margins/styling.
  if ((props as Record<string, unknown>)["data-rehype-pretty-code-figure"] !== undefined) {
    return <>{children}</>;
  }
  return <figure {...props}>{children}</figure>;
}

// ---------------------------------------------------------------------------
// Export component map
// ---------------------------------------------------------------------------

export const mdxComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  p: Paragraph,
  a: Anchor,
  pre: Pre,
  code: Code,
  figure: Figure,
  table: Table,
  th: Th,
  td: Td,
  blockquote: Blockquote,
  ul: UnorderedList,
  ol: OrderedList,
  hr: HorizontalRule,
  Callout,
  CodeGroup,
  Steps,
  ApiEndpoint,
};
