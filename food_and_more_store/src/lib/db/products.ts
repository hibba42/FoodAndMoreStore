import { and, asc, eq, inArray } from "drizzle-orm";
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

// Several active products at once (used by the cart and, later, checkout).
// IDs that don't exist or are inactive are simply missing from the result.
export async function getProductsByIds(ids: number[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];
  return db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(and(inArray(products.productId, ids), eq(products.isActive, true)));
}

// Products grouped by category, in category order, for "Shop by Category".
export async function getProductsByCategory() {
  const rows = await getActiveProducts();

  const grouped = new Map<
    number,
    { id: number; title: string; items: ProductSummary[] }
  >();

  for (const row of rows) {
    let group = grouped.get(row.categoryId);
    if (!group) {
      group = { id: row.categoryId, title: row.categoryName, items: [] };
      grouped.set(row.categoryId, group);
    }
    group.items.push(row);
  }

  return [...grouped.values()];
}

// Placeholder for "Top Products": the first few active products for now.
// Later this can rank by units sold using order_items.
export async function getTopProducts(limit = 4) {
  const rows = await getActiveProducts();
  return rows.slice(0, limit);
}
