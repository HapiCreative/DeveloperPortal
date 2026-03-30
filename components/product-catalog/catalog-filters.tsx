"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const INTERACTION_TYPES = ["API", "SDK", "CLI", "Webhook"] as const;
const STATUSES = [
  { value: "GA", label: "Generally Available" },
  { value: "BETA", label: "Beta" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "DEPRECATED", label: "Deprecated" },
] as const;

function CatalogFiltersInner({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const selectedCategories = searchParams.getAll("category");
  const selectedTypes = searchParams.getAll("type");
  const selectedStatuses = searchParams.getAll("status");
  const hasFilters =
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedStatuses.length > 0 ||
    searchParams.has("search");

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleFilter = useCallback(
    (key: string, value: string) => {
      updateParams((params) => {
        const values = params.getAll(key);
        if (values.includes(value)) {
          params.delete(key);
          values
            .filter((v) => v !== value)
            .forEach((v) => params.append(key, v));
        } else {
          params.append(key, value);
        }
      });
    },
    [updateParams],
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
    setSearchValue("");
  }, [router, pathname]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams((params) => {
        if (searchValue.trim()) {
          params.set("search", searchValue.trim());
        } else {
          params.delete("search");
        }
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // Only trigger on searchValue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const filterContent = (
    <div className="space-y-6">
      {/* Categories */}
      {categories.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Category
          </legend>
          <div className="mt-2 space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleFilter("category", cat.slug)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Interaction Type */}
      <fieldset>
        <legend className="text-sm font-semibold text-foreground">
          Interaction Type
        </legend>
        <div className="mt-2 space-y-2">
          {INTERACTION_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleFilter("type", type)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Status */}
      <fieldset>
        <legend className="text-sm font-semibold text-foreground">
          Status
        </legend>
        <div className="mt-2 space-y-2">
          {STATUSES.map((s) => (
            <label
              key={s.value}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedStatuses.includes(s.value)}
                onChange={() => toggleFilter("status", s.value)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Clear All */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-sm font-medium text-danger hover:text-danger/80 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-elevated py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center gap-2 text-sm font-medium text-foreground lg:hidden mt-3"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasFilters && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
            {selectedCategories.length +
              selectedTypes.length +
              selectedStatuses.length}
          </span>
        )}
      </button>

      {/* Mobile filter panel */}
      {mobileOpen && (
        <div className="mt-3 rounded-lg border border-border bg-surface-elevated p-4 lg:hidden">
          {filterContent}
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{filterContent}</div>
    </>
  );
}

export function CatalogFilters({ categories }: { categories: Category[] }) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded-lg bg-surface" />
          <div className="hidden lg:block space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-3/4 rounded bg-surface" />
            ))}
          </div>
        </div>
      }
    >
      <CatalogFiltersInner categories={categories} />
    </Suspense>
  );
}
