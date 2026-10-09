import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { categories, products } from "./schema";

// All active products, each with its category name.
// Note: price is a string (e.g. "2.49") because Postgres NUMERIC is
// returned as text to avoid floating-point rounding.
export async function getActiveProducts() {
  return db
    .select({
      id: products.productId,
      name: products.name,
      description: products.description,
      price: products.price,
      imagePath: products.imagePath,
      isAgeRestricted: products.isAgeRestricted,
      categoryId: categories.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(eq(products.isActive, true))
    .orderBy(asc(categories.categoryId), asc(products.productId));
}

export type ProductSummary = Awaited<ReturnType<typeof getActiveProducts>>[number];

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
