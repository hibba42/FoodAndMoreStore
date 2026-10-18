import Link from "next/link";
import "./home.css";
import ProductImage from "./product-image";
import { getProductsByCategory, getTopProducts } from "@/lib/db/products";
import { formatPrice } from "@/lib/format";

// This page reads from the database, so render it on each request.
// (Without this, `next build` inside Docker would try to query a database
// that isn't reachable during the image build.)
export const dynamic = "force-dynamic";

export default async function Home() {
  const [topProducts, categories] = await Promise.all([
    getTopProducts(4),
    getProductsByCategory(),
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
            <Link
              className="productCard"
              href={`/products/${product.id}`}
              key={product.id}
            >
              <ProductImage src={product.imagePath} alt={product.name} />
              <span className="productTitle">{product.name}</span>
              <span className="productPrice">{formatPrice(product.price)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>Shop by Category</h2>
        {categories.map((category) => (
          <div className="categorySection" key={category.id}>
            <h3>{category.title}</h3>
            <div className="categoryItems">
              {category.items.map((item) => (
                <Link
                  className="productCard"
                  href={`/products/${item.id}`}
                  key={item.id}
                >
                  <ProductImage src={item.imagePath} alt={item.name} />
                  <span className="productTitle">{item.name}</span>
                  <span className="productPrice">{formatPrice(item.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
