import { prisma } from "@/lib/db/prisma";
import type { ProductStatus } from "@/lib/generated/prisma/client";

export interface ProductFilters {
  search?: string;
  categories?: string[];
  interactionTypes?: string[];
  statuses?: ProductStatus[];
}

export async function getProducts(filters: ProductFilters = {}) {
  const where: Record<string, unknown> = {
    visibility: "PUBLIC",
  };

  if (filters.statuses && filters.statuses.length > 0) {
    where.status = { in: filters.statuses };
  }

  if (filters.categories && filters.categories.length > 0) {
    where.category = { slug: { in: filters.categories } };
  }

  if (filters.interactionTypes && filters.interactionTypes.length > 0) {
    where.interactionTypes = { hasSome: filters.interactionTypes };
  }

  if (filters.search && filters.search.trim()) {
    where.OR = [
      { name: { contains: filters.search.trim(), mode: "insensitive" } },
      { description: { contains: filters.search.trim(), mode: "insensitive" } },
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { category: true },
  });
}

export async function getProductCategories() {
  return prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductCount() {
  return prisma.product.count({
    where: { visibility: "PUBLIC" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, visibility: "PUBLIC" },
    include: { category: true },
  });
}
