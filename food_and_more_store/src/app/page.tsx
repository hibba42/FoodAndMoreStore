import Link from "next/link";
import "./home.css";
import "./home-categories.css";
import ProductCard from "./product-card";
import { getProductsByCategory, getTopProducts } from "@/lib/db/products";

// This page reads from the database, so render it on each request.
// (Without this, `next build` inside Docker would try to query a database
// that isn't reachable during the image build.)
export const dynamic = "force-dynamic";

// How many products to preview in each category on the home page.
const HOME_SAMPLE_SIZE = 3;

export default async function Home() {
  const [topProducts, categories] = await Promise.all([
    getTopProducts(4),
    getProductsByCategory(HOME_SAMPLE_SIZE),
  ]);

  return (
    <div className="homeMain">
      <section className="greeting">
        <h3>Welcome to our store!</h3>
        <p>Fresh groceries, delivered with care.</p>
      </section>

      <section>
        <h2>Top Products!</h2>
        <div className="topProducts">
          {topProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <h2>Shop by Category</h2>
        {categories.map((category) => (
          <div className="categorySection" key={category.id}>
            <div className="categoryHeader">
              <h3>
                <Link className="categoryTitleLink" href={`/categories/${category.id}`}>
                  {category.title}
                </Link>
              </h3>
              <Link className="seeAll" href={`/categories/${category.id}`}>
                See all {category.total} {category.total === 1 ? "item" : "items"}
                <span className="visuallyHidden"> in {category.title}</span>
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
            <div className="categoryItems">
              {category.items.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
