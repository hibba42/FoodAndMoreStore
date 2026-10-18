import Link from "next/link";
import { cartItemCount, readCart } from "@/lib/cart";
import "./header.css";

// A Server Component: it reads the cart cookie to show the item count.
export default async function Header() {
  const count = cartItemCount(await readCart());

  return (
    <header className="siteHeader">
      <nav className="siteNav" aria-label="Main">
        <Link href="/">Home</Link>
        <Link
          href="/cart"
          className="cartLink"
          aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
        >
          Cart
          {count > 0 && <span className="cartCount">{count}</span>}
        </Link>
      </nav>
      <h1 style={{ textAlign: "center" }}>Welcome to Food &amp; More Store!</h1>
    </header>
  );
}
