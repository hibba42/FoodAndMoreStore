import type { Metadata } from "next";
import Link from "next/link";
import { readCart } from "@/lib/cart";
import { getProductsByIds } from "@/lib/db/products";
import { formatPrice, lineTotal } from "@/lib/format";
import ProductImage from "../product-image";
import CartLineControls from "./cart-line-controls";
import "./cart.css";

// The cart depends on the visitor's cookie and the database: render per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your cart | Food & More Store" };

export default async function CartPage() {
  const cart = await readCart();
  const ids = Object.keys(cart).map(Number);
  const products = await getProductsByIds(ids);

  // Build cart lines in the order products were added; items that no longer
  // exist (or were deactivated) are skipped.
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [{ product, quantity: cart[String(id)] }] : [];
  });
  const skipped = ids.length - lines.length;

  if (lines.length === 0) {
    return (
      <div className="cartPage">
        <h1>Your cart is empty</h1>
        {skipped > 0 && (
          <p className="cartNotice">
            Some items in your cart are no longer available.
          </p>
        )}
        <p>
          <Link className="cartLinkText" href="/">
            Browse the store
          </Link>
        </p>
      </div>
    );
  }

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lines.reduce(
    (sum, l) => sum + Math.round(Number(l.product.price) * 100) * l.quantity,
    0
  );
  const hasAgeRestricted = lines.some((l) => l.product.isAgeRestricted);

  return (
    <div className="cartPage">
      <h1>Your cart</h1>

      {skipped > 0 && (
        <p className="cartNotice">
          Some items in your cart are no longer available and were left out.
        </p>
      )}

      <ul className="cartList">
        {lines.map(({ product, quantity }) => (
          <li className="cartLine" key={product.id}>
            <Link href={`/products/${product.id}`} className="cartLineImage">
              <ProductImage src={product.imagePath} alt={product.name} size={96} />
            </Link>

            <div className="cartLineInfo">
              <Link href={`/products/${product.id}`} className="cartLineName">
                {product.name}
              </Link>
              <span>{formatPrice(product.price)} each</span>
            </div>

            <CartLineControls
              productId={product.id}
              quantity={quantity}
              name={product.name}
            />

            <span className="cartLineTotal">
              {formatPrice(lineTotal(product.price, quantity))}
            </span>
          </li>
        ))}
      </ul>

      <div className="cartSummary">
        <p className="cartSubtotal">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
          <strong>{formatPrice(subtotalCents / 100)}</strong>
        </p>
        {hasAgeRestricted && (
          <p className="cartNotice">
            Some items require you to be 21 or older. We&apos;ll ask for your date of
            birth at checkout.
          </p>
        )}
        <Link className="checkoutButton" href="/checkout">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
