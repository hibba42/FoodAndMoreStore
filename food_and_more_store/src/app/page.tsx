import "./home.css";

const topProducts = [
  { id: 1, title: "Organic Apples" },
  { id: 2, title: "Whole Wheat Bread" },
  { id: 3, title: "Free-Range Eggs" },
  { id: 4, title: "Cheddar Cheese" },
];

const categories = [
  { id: "fruits", title: "Fruits" },
  { id: "vegetables", title: "Vegetables & Mushrooms" },
  { id: "proteins", title: "Proteins" },
];

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="imagePlaceholder" role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
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
              <ImagePlaceholder label={product.title} />
              <span className="productTitle">{product.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Shop by Category</h2>
        <div className="categories">
          {categories.map((category) => (
            <div className="categoryCard" key={category.id}>
              <ImagePlaceholder label={category.title} />
              <span className="categoryTitle">{category.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}