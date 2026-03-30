import { cn } from "@/lib/utils";

const config = {
  beginner: {
    label: "Beginner",
    dots: 1,
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  intermediate: {
    label: "Intermediate",
    dots: 2,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
  },
  advanced: {
    label: "Advanced",
    dots: 3,
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    dotColor: "bg-red-500",
  },
} as const;

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: "beginner" | "intermediate" | "advanced";
  className?: string;
}) {
  const c = config[difficulty];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.color,
        className
      )}
    >
      <span className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              i <= c.dots ? c.dotColor : "bg-current opacity-20"
            )}
          />
        ))}
      </span>
      {c.label}
    </span>
  );
}
