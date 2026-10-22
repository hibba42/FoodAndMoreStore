import type { Metadata } from "next";
import Link from "next/link";
import { readCart } from "@/lib/cart";
import { EMPTY_VALUES } from "@/lib/checkout-types";
import { getProductsByIds } from "@/lib/db/products";
import { formatPrice, lineTotal } from "@/lib/format";
import ProductImage from "../product-image";
import CheckoutForm from "./checkout-form";
import "./checkout.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Checkout | Food & More Store" };

export default async function CheckoutPage() {
  const cart = await readCart();
  const ids = Object.keys(cart).map(Number);
  const products = await getProductsByIds(ids);

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [{ product, quantity: cart[String(id)] }] : [];
  });

  if (lines.length === 0) {
    return (
      <div className="checkoutPage">
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
        <p>
          <Link className="checkoutLink" href="/">
            Browse the store
          </Link>
        </p>
      </div>
    );
  }

  if (lines.length !== ids.length) {
    return (
      <div className="checkoutPage">
        <h2>Checkout</h2>
        <p className="formMessage">Some items in your cart are no longer available.</p>
        <p>
          <Link className="checkoutLink" href="/cart">
            Review your cart
          </Link>
        </p>
      </div>
    );
  }

  const requiresBirthDate = lines.some((l) => l.product.isAgeRestricted);
  const subtotalCents = lines.reduce(
    (sum, l) => sum + Math.round(Number(l.product.price) * 100) * l.quantity,
    0
  );

  return (
    <div className="checkoutPage">
      <h2>Checkout</h2>

      <div className="checkoutLayout">
        {/* Phase 2 (accounts) will pass a signed-in customer's saved details here. */}
        <CheckoutForm defaults={EMPTY_VALUES} requiresBirthDate={requiresBirthDate} />

        <aside className="orderSummary" aria-label="Order summary">
          <h3>Order summary</h3>
          <ul>
            {lines.map(({ product, quantity }) => (
              <li key={product.id}>
                <ProductImage src={product.imagePath} alt={product.name} size={56} />
                <span className="summaryName">
                  {product.name}
                  <span className="summaryQty">Qty {quantity}</span>
                </span>
                <span>{formatPrice(lineTotal(product.price, quantity))}</span>
              </li>
            ))}
          </ul>
          <p className="summaryTotal">
            Subtotal: <strong>{formatPrice(subtotalCents / 100)}</strong>
          </p>
          <Link className="checkoutLink" href="/cart">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
