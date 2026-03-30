import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  GA: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  BETA: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  COMING_SOON: "bg-primary-100 text-primary dark:bg-primary/20 dark:text-primary-300",
  DEPRECATED: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
};

const statusLabels: Record<string, string> = {
  GA: "Generally Available",
  BETA: "Beta",
  COMING_SOON: "Coming Soon",
  DEPRECATED: "Deprecated",
};

export function StatusBadge({
  status,
  short = false,
  className,
}: {
  status: string;
  short?: boolean;
  className?: string;
}) {
  const shortLabels: Record<string, string> = {
    GA: "GA",
    BETA: "Beta",
    COMING_SOON: "Coming Soon",
    DEPRECATED: "Deprecated",
  };

  const label = short ? (shortLabels[status] ?? status) : (statusLabels[status] ?? status);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status] ?? "bg-surface text-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}
