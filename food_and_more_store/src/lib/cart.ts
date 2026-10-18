import { cookies } from "next/headers";
import { MAX_LINES, MAX_QTY, MIN_QTY } from "./cart-limits";

// The cart lives in a cookie as JSON: { "<productId>": quantity }.
// It stores NO prices or names. Those are always read from the database.

const COOKIE_NAME = "cart";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export type Cart = Record<string, number>;

// Reads and VALIDATES the cart cookie. The cookie belongs to the visitor and
// can be edited, so anything malformed is silently dropped.
export async function readCart(): Promise<Cart> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return {};

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return {};

  const cart: Cart = {};
  for (const [key, value] of Object.entries(data)) {
    if (Object.keys(cart).length >= MAX_LINES) break;
    if (!/^\d{1,9}$/.test(key)) continue;
    if (typeof value !== "number" || !Number.isInteger(value)) continue;
    cart[key] = Math.min(MAX_QTY, Math.max(MIN_QTY, value));
  }
  return cart;
}

// Only call this from a Server Action or Route Handler (cookies can't be
// changed while a page is rendering).
export async function writeCart(cart: Cart): Promise<void> {
  const store = await cookies();

  if (Object.keys(cart).length === 0) {
    store.delete(COOKIE_NAME);
    return;
  }

  store.set(COOKIE_NAME, JSON.stringify(cart), {
    httpOnly: true, // not readable by JavaScript in the browser
    sameSite: "lax",
    // Set COOKIE_SECURE=true once the site is served over HTTPS.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

// Total number of items (sum of quantities), for the header badge.
export function cartItemCount(cart: Cart): number {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}
