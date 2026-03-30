"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md",
        "bg-white/10 text-gray-400 opacity-0 backdrop-blur-sm transition-all",
        "hover:bg-white/20 hover:text-gray-200 group-hover:opacity-100",
        "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      aria-label={copied ? "Copied" : "Copy code to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
