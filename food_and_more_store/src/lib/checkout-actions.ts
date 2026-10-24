"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { checkBirthDate } from "./birth-date";
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
import { getSession } from "./session";

function readValues(formData: FormData): CheckoutValues {
  const values = {} as CheckoutValues;
  for (const name of FIELD_NAMES) {
    const raw = formData.get(name);
    values[name] = typeof raw === "string" ? raw : "";
  }
  return values;
}

// Turns the cart into an order. Everything the browser sends is re-validated,
// and prices always come from the database, never from the cart or the form.
export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const values = readValues(formData);
  const saveDetails = formData.get("saveDetails") === "on";
  const fail = (
    message: string,
    fieldErrors: CheckoutState["fieldErrors"] = {}
  ): CheckoutState => ({ values, fieldErrors, message, saveDetails });

  // 0. Who is ordering? A session means a signed-in member; none means a guest.
  const session = await getSession();

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
  const details = {
    name: data.name,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    dateOfBirth: values.dateOfBirth || null,
  };

  // 3. Save everything in ONE transaction: all of it or none of it.
  let token: string;
  try {
    token = await db.transaction(async (tx) => {
      let customerId: number | undefined;

      if (session) {
        // ---- Signed-in member: their customer row is found by account ID ----
        const userId = session.user.id;

        // Create the row if it doesn't exist yet. If they asked us to save
        // their details, store the full form; otherwise just the basics.
        const created = await tx
          .insert(customers)
          .values({
            authUserId: userId,
            email: session.user.email,
            ...(saveDetails ? details : { name: session.user.name }),
          })
          .onConflictDoNothing({ target: customers.authUserId })
          .returning({ id: customers.customerId });

        customerId = created[0]?.id;

        if (customerId === undefined) {
          const existing = await tx
            .select({ id: customers.customerId })
            .from(customers)
            .where(eq(customers.authUserId, userId))
            .limit(1);
          customerId = existing[0].id;

          if (saveDetails) {
            await tx.update(customers).set(details).where(eq(customers.customerId, customerId));
          }
        }
      } else {
        // ---- Guest: find or create a GUEST row by email ----
        // An existing customer's saved details are NOT overwritten: anyone can
        // type any email at a guest checkout, so this form must never change
        // someone else's record. Member rows are never matched here.
        const created = await tx
          .insert(customers)
          .values({ ...details, email: data.email })
          .onConflictDoNothing({
            target: customers.email,
            where: isNull(customers.authUserId),
          })
          .returning({ id: customers.customerId });

        customerId = created[0]?.id;

        if (customerId === undefined) {
          const existing = await tx
            .select({ id: customers.customerId })
            .from(customers)
            .where(and(eq(customers.email, data.email), isNull(customers.authUserId)))
            .limit(1);
          customerId = existing[0].id;
        }
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
