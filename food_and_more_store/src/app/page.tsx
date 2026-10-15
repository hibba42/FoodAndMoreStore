import "./home.css";
import { getProductsByCategory, getTopProducts } from "@/lib/db/products";
import Image from 'next/image';

// This page reads from the database, so render it on each request.
// (Without this, `next build` inside Docker would try to query a database
// that isn't reachable during the image build.)
export const dynamic = "force-dynamic";

// The database stores image paths like "/images/tomato.jpg". If the file doesn't exist,
// gracefully show a placeholder instead.
function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="imagePlaceholder" role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    );
  }
  return <Image src={src} alt={alt} width={120} height={120} className="productImage" />;
}

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
          {topProducts.map((item) => (
            <div className="productCard" key={item.id}>
              <ProductImage src={item.imagePath} alt={item.name} />
              <span className="productTitle">{item.name}</span>
              <span className="productPrice">${item.price}</span>
            </div>
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
                <div className="productCard" key={item.id}>
                  <ProductImage src={item.imagePath} alt={item.name} />
                  <span className="productTitle">{item.name}</span>
                  <span className="productPrice">${item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
