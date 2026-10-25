import Link from "next/link";
import "./product.css";

export default function ProductNotFound() {
  return (
    <div className="productPage">
      <h1>We couldn&apos;t find that product</h1>
      <p className="productDescription">
        It may have been removed, or the link may be mistyped.
      </p>
      <p>
        <Link className="backLink" href="/">
          Back to the store
        </Link>
      </p>
    </div>
  );
}
