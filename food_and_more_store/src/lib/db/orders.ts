import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { customers, orderItems, orders, products } from "./schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The order time as an ISO-8601 UTC string ("2026-10-24T05:23:11.123Z"), built
// in SQL so it doesn't depend on how the timestamp column is mapped in JavaScript.
const placedAtIso = sql<string>`to_char(${orders.orderedAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// Looks an order up by its unguessable public token (not the sequential ID).
// Returns null for malformed or unknown tokens.
export async function getOrderByToken(token: string) {
  if (!UUID.test(token)) return null; // avoids a Postgres "invalid uuid" error

  const [order] = await db
    .select({
      id: orders.orderId,
      placedAtIso,
      status: orders.status,
      recipientName: orders.recipientName,
      contactEmail: orders.contactEmail,
      contactPhone: orders.contactPhone,
      orderAddress: orders.orderAddress,
    })
    .from(orders)
    .where(eq(orders.publicToken, token))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      productId: orderItems.productId,
      name: products.name,
      imagePath: products.imagePath,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.productId))
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.orderItemId));

  return { ...order, items };
}

// All orders placed by a signed-in member, newest first, with an item count
// and total for each. Found through the member's account ID (from the session),
// so guest orders that merely used the same email are not included.
export async function getOrdersForUser(authUserId: string) {
  return db
    .select({
      id: orders.orderId,
      token: orders.publicToken,
      placedAtIso,
      status: orders.status,
      itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      total: sql<string>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), 0)::numeric(12,2)::text`,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.customerId))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.orderId))
    .where(eq(customers.authUserId, authUserId))
    .groupBy(orders.orderId)
    .orderBy(desc(orders.orderedAt), desc(orders.orderId));
}
