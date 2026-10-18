"use server";

import { revalidatePath } from "next/cache";
import { cartItemCount, readCart, writeCart } from "./cart";
import { MAX_LINES, MAX_QTY, MIN_QTY } from "./cart-limits";
import { getProductById } from "./db/products";

// Server Actions run on the server but can be called from client components.
// Treat every one as a public endpoint: validate everything they receive.

export type CartResult =
  | { ok: true; lineQuantity: number; itemCount: number }
  | { ok: false; error: string };

function isValidId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0 && id <= 999_999_999;
}

function isValidQuantity(qty: unknown): qty is number {
  return typeof qty === "number" && Number.isInteger(qty) && qty >= MIN_QTY && qty <= MAX_QTY;
}

// Refresh every page that shows the cart (header badge, cart page).
function refreshCartViews() {
  revalidatePath("/", "layout");
}

export async function addToCart(productId: number, quantity: number): Promise<CartResult> {
  if (!isValidId(productId) || !isValidQuantity(quantity)) {
    return { ok: false, error: "That quantity isn't valid." };
  }

  const product = await getProductById(productId);
  if (!product) return { ok: false, error: "Sorry, that product isn't available." };

  const cart = await readCart();
  const key = String(productId);

  if (!(key in cart) && Object.keys(cart).length >= MAX_LINES) {
    return { ok: false, error: `Your cart is full (${MAX_LINES} different items).` };
  }

  // Adding something already in the cart increases its quantity.
  cart[key] = Math.min(MAX_QTY, (cart[key] ?? 0) + quantity);
  await writeCart(cart);
  refreshCartViews();

  return { ok: true, lineQuantity: cart[key], itemCount: cartItemCount(cart) };
}

// Sets an item's quantity. A quantity below 1 removes the item.
export async function setQuantity(productId: number, quantity: number): Promise<CartResult> {
  if (!isValidId(productId) || typeof quantity !== "number" || !Number.isInteger(quantity)) {
    return { ok: false, error: "That quantity isn't valid." };
  }

  const cart = await readCart();
  const key = String(productId);
  if (!(key in cart)) return { ok: false, error: "That item isn't in your cart." };

  if (quantity < MIN_QTY) {
    delete cart[key];
  } else {
    cart[key] = Math.min(MAX_QTY, quantity);
  }

  await writeCart(cart);
  refreshCartViews();
  return { ok: true, lineQuantity: cart[key] ?? 0, itemCount: cartItemCount(cart) };
}

export async function removeFromCart(productId: number): Promise<CartResult> {
  if (!isValidId(productId)) return { ok: false, error: "That item isn't valid." };

  const cart = await readCart();
  delete cart[String(productId)];
  await writeCart(cart);
  refreshCartViews();
  return { ok: true, lineQuantity: 0, itemCount: cartItemCount(cart) };
}

// Used after a successful checkout (coming next).
export async function clearCart(): Promise<void> {
  await writeCart({});
  refreshCartViews();
}
