"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { readCart } from "./cart";
import { clearCart } from "./cart-actions";
import { checkoutSchema } from "./checkout-schema";
import {
  FIELD_NAMES,
  type CheckoutState,
  type CheckoutValues,
  type FieldName,
} from "./checkout-types";
import { db } from "./db";
import { getProductsByIds } from "./db/products";
import { customers, orderItems, orders } from "./db/schema";

const MIN_AGE = 21;

function readValues(formData: FormData): CheckoutValues {
  const values = {} as CheckoutValues;
  for (const name of FIELD_NAMES) {
    const raw = formData.get(name);
    values[name] = typeof raw === "string" ? raw : "";
  }
  return values;
}

// Newest birth date (YYYY-MM-DD) that is still old enough, as of today (UTC).
function latestAllowedBirthDate(): string {
  const now = new Date();
  const limit = new Date(
    Date.UTC(now.getUTCFullYear() - MIN_AGE, now.getUTCMonth(), now.getUTCDate())
  );
  return limit.toISOString().slice(0, 10);
}

function checkBirthDate(value: string, required: boolean): string | null {
  if (!value) {
    return required ? "Date of birth is required for age-restricted items." : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Enter a valid date.";

  const parsed = new Date(`${value}T00:00:00Z`);
  const today = new Date().toISOString().slice(0, 10);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value ||
    value < "1900-01-01" ||
    value > today
  ) {
    return "Enter a valid date.";
  }
  if (required && value > latestAllowedBirthDate()) {
    return `You must be ${MIN_AGE} or older to order these items.`;
  }
  return null;
}

// Turns the cart into an order. Everything the browser sends is re-validated,
// and prices always come from the database, never from the cart or the form.
export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const values = readValues(formData);
  const fail = (
    message: string,
    fieldErrors: CheckoutState["fieldErrors"] = {}
  ): CheckoutState => ({ values, fieldErrors, message });

  // 1. The cart, re-read from the cookie and the database.
  const cart = await readCart();
  const ids = Object.keys(cart).map(Number);
  if (ids.length === 0) return fail("Your cart is empty.");

  const products = await getProductsByIds(ids);
  if (products.length !== ids.length) {
    return fail("Some items in your cart are no longer available. Please review your cart.");
  }

  // 2. Validate the form.
  const requiresBirthDate = products.some((p) => p.isAgeRestricted);
  const parsed = checkoutSchema.safeParse(values);
  const fieldErrors: Partial<Record<FieldName, string>> = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as FieldName] = issue.message;
      }
    }
  }
  const birthDateError = checkBirthDate(values.dateOfBirth, requiresBirthDate);
  if (birthDateError) fieldErrors.dateOfBirth = birthDateError;

  if (!parsed.success || birthDateError) {
    return fail("Please fix the highlighted fields.", fieldErrors);
  }
  const data = parsed.data;

  // 3. Save everything in ONE transaction: all of it or none of it.
  let token: string;
  try {
    token = await db.transaction(async (tx) => {
      // Find or create the customer by email. An existing customer's saved
      // details are NOT overwritten: anyone can type any email at a guest
      // checkout, so this form must never change someone else's record.
      const created = await tx
        .insert(customers)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          dateOfBirth: values.dateOfBirth || null,
        })
        .onConflictDoNothing({ target: customers.email })
        .returning({ id: customers.customerId });

      let customerId = created[0]?.id;
      if (customerId === undefined) {
        const existing = await tx
          .select({ id: customers.customerId })
          .from(customers)
          .where(eq(customers.email, data.email))
          .limit(1);
        customerId = existing[0].id;
      }

      const [order] = await tx
        .insert(orders)
        .values({
          customerId,
          recipientName: data.name,
          contactEmail: data.email,
          contactPhone: data.phone,
          orderAddress: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
        })
        .returning({ orderId: orders.orderId, token: orders.publicToken });

      await tx.insert(orderItems).values(
        products.map((p) => ({
          orderId: order.orderId,
          productId: p.id,
          quantity: cart[String(p.id)],
          unitPrice: p.price, // price snapshot, read from the database just now
        }))
      );

      return order.token;
    });
  } catch (error) {
    console.error("Failed to place order:", error);
    return fail("Something went wrong saving your order. Please try again.");
  }

  // 4. Success: empty the cart and show the confirmation page.
  await clearCart();
  redirect(`/orders/${token}`);
}
