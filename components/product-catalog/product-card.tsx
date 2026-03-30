import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface ProductCardProps {
  slug: string;
  name: string;
  description: string;
  status: string;
  iconUrl: string | null;
  interactionTypes: string[];
}

export function ProductCard({
  slug,
  name,
  description,
  status,
  iconUrl,
  interactionTypes,
}: ProductCardProps) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        {/* Icon or colored circle with initials */}
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={`${name} icon`}
            width={40}
            height={40}
            className="shrink-0 rounded-lg"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {name}
            </h3>
            <StatusBadge status={status} short />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Interaction type pills */}
      {interactionTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {interactionTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-auto flex items-center gap-4 pt-4 text-sm font-medium">
        <span className="inline-flex items-center gap-1 text-primary">
          View docs
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="text-muted group-hover:text-foreground transition-colors">
          Get started
        </span>
      </div>
    </Link>
  );
}
