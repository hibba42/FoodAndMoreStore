import type { Metadata } from "next";
import Link from "next/link";
import { toDateInputValue } from "@/lib/birth-date";
import { readCart } from "@/lib/cart";
import { EMPTY_VALUES, type CheckoutValues } from "@/lib/checkout-types";
import { getCustomerByAuthUserId } from "@/lib/db/customers";
import { getProductsByIds } from "@/lib/db/products";
import { formatPrice, lineTotal } from "@/lib/format";
import { getSession } from "@/lib/session";
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
        <h1>Checkout</h1>
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
        <h1>Checkout</h1>
        <p className="formMessage">Some items in your cart are no longer available.</p>
        <p>
          <Link className="checkoutLink" href="/cart">
            Review your cart
          </Link>
        </p>
      </div>
    );
  }

  // Signed-in members get the form prefilled from their saved details (found by
  // account ID, never by a typed email). Guests get a blank form.
  const session = await getSession();
  const customer = session ? await getCustomerByAuthUserId(session.user.id) : null;
  const defaults: CheckoutValues = session
    ? {
        name: customer?.name ?? session.user.name,
        email: session.user.email,
        phone: customer?.phone ?? "",
        address: customer?.address ?? "",
        city: customer?.city ?? "",
        state: customer?.state ?? "",
        zip: customer?.zip ?? "",
        dateOfBirth: toDateInputValue(customer?.dateOfBirth),
      }
    : EMPTY_VALUES;

  const requiresBirthDate = lines.some((l) => l.product.isAgeRestricted);
  const subtotalCents = lines.reduce(
    (sum, l) => sum + Math.round(Number(l.product.price) * 100) * l.quantity,
    0
  );

  return (
    <div className="checkoutPage">
      <h1>Checkout</h1>

      {session ? (
        <p>
          Signed in as <strong>{session.user.email}</strong>.{" "}
          <Link className="checkoutLink" href="/account">
            Manage saved details
          </Link>
        </p>
      ) : (
        <p>
          Checking out as a guest.{" "}
          <Link className="checkoutLink" href="/sign-in?next=/checkout">
            Sign in
          </Link>{" "}
          or{" "}
          <Link className="checkoutLink" href="/sign-up?next=/checkout">
            create an account
          </Link>{" "}
          to reuse your details next time.
        </p>
      )}

      <div className="checkoutLayout">
        <CheckoutForm
          defaults={defaults}
          requiresBirthDate={requiresBirthDate}
          signedIn={Boolean(session)}
        />

        <aside className="orderSummary" aria-label="Order summary">
          <h2>Order summary</h2>
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
