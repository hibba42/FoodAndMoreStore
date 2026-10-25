import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "./index";
import { categories, products } from "./schema";

// The columns every product query returns.
// Note: price is a string (e.g. "2.49") because Postgres NUMERIC is
// returned as text to avoid floating-point rounding.
const productFields = {
  id: products.productId,
  name: products.name,
  description: products.description,
  price: products.price,
  imagePath: products.imagePath,
  isAgeRestricted: products.isAgeRestricted,
  categoryId: categories.categoryId,
  categoryName: categories.name,
};

// All active products, each with its category name.
export async function getActiveProducts() {
  return db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(eq(products.isActive, true))
    .orderBy(asc(categories.categoryId), asc(products.productId));
}

export type ProductSummary = Awaited<ReturnType<typeof getActiveProducts>>[number];

// One active product by its ID, or null if it doesn't exist or is inactive.
// Wrapped in cache() so generateMetadata and the page share a single query.
export const getProductById = cache(async (id: number): Promise<ProductSummary | null> => {
  const rows = await db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(and(eq(products.productId, id), eq(products.isActive, true)))
    .limit(1);
  return rows[0] ?? null;
});

// Several active products at once (used by the cart and checkout).
// IDs that don't exist or are inactive are simply missing from the result.
export async function getProductsByIds(ids: number[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];
  return db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(and(inArray(products.productId, ids), eq(products.isActive, true)));
}

export type CategoryGroup = {
  id: number;
  title: string;
  total: number; // how many active products the category has in all
  items: ProductSummary[]; // at most `limitPerCategory` of them
};

// Products grouped by category, in category order, for "Shop by Category".
// Pass a limit to get only a sample from each category (the total is still
// the full count). Categories with no active products are left out.
// (Fine for a small catalog; a very large one would limit this in SQL.)
export async function getProductsByCategory(limitPerCategory?: number): Promise<CategoryGroup[]> {
  const rows = await getActiveProducts();

  const grouped = new Map<number, CategoryGroup>();
  for (const row of rows) {
    let group = grouped.get(row.categoryId);
    if (!group) {
      group = { id: row.categoryId, title: row.categoryName, total: 0, items: [] };
      grouped.set(row.categoryId, group);
    }
    group.total += 1;
    if (limitPerCategory === undefined || group.items.length < limitPerCategory) {
      group.items.push(row);
    }
  }

  return [...grouped.values()];
}

// One category by ID, or null if there isn't one.
export const getCategoryById = cache(async (id: number) => {
  const rows = await db
    .select({ id: categories.categoryId, name: categories.name })
    .from(categories)
    .where(eq(categories.categoryId, id))
    .limit(1);
  return rows[0] ?? null;
});

// Every category with the number of active products in it (for navigation).
export async function getCategoriesWithCounts() {
  return db
    .select({
      id: categories.categoryId,
      name: categories.name,
      productCount: sql<number>`count(${products.productId})::int`,
    })
    .from(categories)
    .leftJoin(
      products,
      and(eq(products.categoryId, categories.categoryId), eq(products.isActive, true))
    )
    .groupBy(categories.categoryId)
    .orderBy(asc(categories.categoryId));
}

// All active products in one category, alphabetically.
export async function getProductsInCategory(categoryId: number): Promise<ProductSummary[]> {
  return db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(asc(products.name), asc(products.productId));
}

// Placeholder for "Top Products": the first few active products for now.
// Later this can rank by units sold using order_items.
export async function getTopProducts(limit = 4) {
  const rows = await getActiveProducts();
  return rows.slice(0, limit);
}
