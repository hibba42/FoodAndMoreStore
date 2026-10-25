import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoriesWithCounts,
  getCategoryById,
  getProductsInCategory,
} from "@/lib/db/products";
import { parseId } from "@/lib/parse-id";
import ProductCard from "../../product-card";
import "./category.css";

// Reads from the database, so render on each request (not at build time).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id: rawId } = await props.params;
  const id = parseId(rawId);
  const category = id === null ? null : await getCategoryById(id);

  if (!category) return { title: "Category not found | Food & More Store" };
  return {
    title: `${category.name} | Food & More Store`,
    description: `Browse everything in ${category.name} at Food & More Store.`,
  };
}

export default async function CategoryPage(props: Props) {
  const { id: rawId } = await props.params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const category = await getCategoryById(id);
  if (!category) notFound();

  const [items, categories] = await Promise.all([
    getProductsInCategory(id),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="categoryPage">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{category.name}</span>
      </nav>

      <div className="categoryTitle">
        <h2>{category.name}</h2>
        <p>
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      <nav className="categoryNav" aria-label="Categories">
        <ul>
          {categories
            .filter((c) => c.productCount > 0 || c.id === id)
            .map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.id}`}
                  aria-current={c.id === id ? "page" : undefined}
                >
                  {c.name} ({c.productCount})
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      {items.length === 0 ? (
        <p>There are no products in this category yet.</p>
      ) : (
        <div className="categoryProducts">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
