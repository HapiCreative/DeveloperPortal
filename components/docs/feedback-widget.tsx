"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  if (feedback) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-center text-sm text-muted">
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-medium text-foreground text-center mb-3">
        Was this page helpful?
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setFeedback("helpful")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors",
            "hover:border-green-500 hover:text-green-600 dark:hover:text-green-400"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </button>
        <button
          onClick={() => setFeedback("not-helpful")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors",
            "hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </button>
      </div>
    </div>
  );
}
