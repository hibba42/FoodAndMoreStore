import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { orderItems, orders, products } from "./schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Looks an order up by its unguessable public token (not the sequential ID).
// Returns null for malformed or unknown tokens.
export async function getOrderByToken(token: string) {
  if (!UUID.test(token)) return null; // avoids a Postgres "invalid uuid" error

  const [order] = await db
    .select({
      id: orders.orderId,
      orderedAt: orders.orderedAt,
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
