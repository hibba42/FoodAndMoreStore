import Link from "next/link";
import { cartItemCount, readCart } from "@/lib/cart";
import { getSession } from "@/lib/session";
import "./header.css";
import SignOutButton from "./sign-out-button";

// A Server Component: it reads the cart cookie and the session on each request.
export default async function Header() {
  const [session, cart] = await Promise.all([getSession(), readCart()]);
  const count = cartItemCount(cart);

  return (
    <header className="siteHeader">
      <nav className="siteNav" aria-label="Main">
        <Link href="/">Home</Link>

        {session ? (
          <>
            <Link href="/account">{session.user.name}</Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/sign-in">Sign in</Link>
        )}

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
