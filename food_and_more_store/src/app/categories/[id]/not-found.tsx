import Link from "next/link";
import "./category.css";

export default function CategoryNotFound() {
  return (
    <div className="categoryPage">
      <h2>We couldn&apos;t find that category</h2>
      <p>The link may be mistyped, or the category may no longer exist.</p>
      <p>
        <Link href="/" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
          Back to the store
        </Link>
      </p>
    </div>
  );
}
