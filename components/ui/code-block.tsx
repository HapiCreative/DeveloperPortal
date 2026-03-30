"use client";

import React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return "";
}

export function CodeBlock({
  children,
  language,
  title,
  showLineNumbers = false,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  const codeText = extractText(children);

  return (
    <div
      className={cn(
        "group relative my-6 rounded-lg border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header: title and/or language label */}
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {title || ""}
          </span>
          {language && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
              {language}
            </span>
          )}
        </div>
      )}

      <CopyButton text={codeText} />

      <pre
        className={cn(
          "overflow-x-auto p-4 text-sm leading-relaxed",
          "font-[var(--font-jetbrains-mono)]",
          "max-h-[32rem] overflow-y-auto",
          (title || language) ? "rounded-b-lg" : "rounded-lg",
          showLineNumbers && "[counter-reset:line]"
        )}
      >
        {showLineNumbers || highlightLines.length > 0
          ? processLines(children, showLineNumbers, highlightLines)
          : children}
      </pre>
    </div>
  );
}

/**
 * Wraps each line in a span for line numbers and/or highlighting.
 * Works with both raw text and rehype-pretty-code output (which wraps lines in spans).
 */
function processLines(
  children: React.ReactNode,
  showLineNumbers: boolean,
  highlightLines: number[]
): React.ReactNode {
  // If children is a <code> element with span children (rehype-pretty-code output),
  // process each line span
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    const lines = React.Children.toArray(props.children);

    return React.cloneElement(children as React.ReactElement<{ children?: React.ReactNode }>, {
      children: lines.map((line, i) => {
        const lineNum = i + 1;
        const isHighlighted = highlightLines.includes(lineNum);

        return (
          <span
            key={i}
            className={cn(
              "block",
              isHighlighted && "bg-blue-500/10 -mx-4 px-4 border-l-2 border-blue-500",
              showLineNumbers &&
                "before:inline-block before:w-8 before:mr-4 before:text-right before:text-gray-400 before:dark:text-gray-600 before:content-[counter(line)] [counter-increment:line] before:select-none"
            )}
          >
            {line}
          </span>
        );
      }),
    });
  }

  // Fallback: split raw text by newlines
  const text = extractText(children);
  const lines = text.split("\n");

  return (
    <code>
      {lines.map((line, i) => {
        const lineNum = i + 1;
        const isHighlighted = highlightLines.includes(lineNum);

        return (
          <span
            key={i}
            className={cn(
              "block",
              isHighlighted && "bg-blue-500/10 -mx-4 px-4 border-l-2 border-blue-500",
              showLineNumbers &&
                "before:inline-block before:w-8 before:mr-4 before:text-right before:text-gray-400 before:dark:text-gray-600 before:content-[counter(line)] [counter-increment:line] before:select-none"
            )}
          >
            {line}
            {i < lines.length - 1 ? "\n" : ""}
          </span>
        );
      })}
    </code>
  );
}
