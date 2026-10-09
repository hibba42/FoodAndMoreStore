import "./home.css";
import { getProductsByCategory, getTopProducts } from "@/lib/db/products";

// This page reads from the database, so render it on each request.
// (Without this, `next build` inside Docker would try to query a database
// that isn't reachable during the image build.)
export const dynamic = "force-dynamic";

// The database stores image paths like "/images/tomato.jpg", but the image
// files don't exist yet, so we still show the placeholder for now.
// Once real images are in public/images/, swap this for <Image src={...} />.
function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="imagePlaceholder" role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
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
          {topProducts.map((product) => (
            <div className="productCard" key={product.id}>
              <ImagePlaceholder label={product.name} />
              <span className="productTitle">{product.name}</span>
              <span className="productPrice">${product.price}</span>
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
                  <ImagePlaceholder label={item.name} />
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
