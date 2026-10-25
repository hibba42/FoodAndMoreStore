import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByToken } from "@/lib/db/orders";
import { formatPrice, lineTotal } from "@/lib/format";
import { getSession } from "@/lib/session";
import LocalDateTime from "../../local-date-time";
import ProductImage from "../../product-image";
import "./order.css";

export const dynamic = "force-dynamic";

// Order pages are private: keep them out of search engines.
export const metadata: Metadata = {
  title: "Order confirmation | Food & More Store",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function OrderPage(props: Props) {
  const { token } = await props.params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  const totalCents = order.items.reduce(
    (sum, item) => sum + Math.round(Number(item.unitPrice) * 100) * item.quantity,
    0
  );
  const session = await getSession();

  return (
    <div className="orderPage">
      <h2>Thank you for your order!</h2>
      <p>
        Order <strong>#{order.id}</strong> · placed <LocalDateTime iso={order.placedAtIso} /> ·
        status: {order.status}
      </p>

      <ul className="orderItems">
        {order.items.map((item) => (
          <li key={item.productId}>
            <ProductImage src={item.imagePath} alt={item.name} size={64} />
            <span className="orderItemName">
              {item.name}
              <span className="orderItemQty">
                {item.quantity} × {formatPrice(item.unitPrice)}
              </span>
            </span>
            <span>{formatPrice(lineTotal(item.unitPrice, item.quantity))}</span>
          </li>
        ))}
      </ul>

      <p className="orderTotal">
        Total: <strong>{formatPrice(totalCents / 100)}</strong>
      </p>

      <section className="orderDetails" aria-label="Delivery details">
        <h3>Shipping to</h3>
        <p>
          {order.recipientName}
          <br />
          {order.orderAddress}
        </p>
        <p>
          {order.contactEmail}
          {order.contactPhone && <> · {order.contactPhone}</>}
        </p>
      </section>

      <p className="orderNotice">
        Payment isn&apos;t connected yet, so nothing was charged. Keep this page&apos;s link:
        without an account, it&apos;s the only way to view this order.
      </p>

      <p>
        <Link className="orderLink" href="/">
          Continue shopping
        </Link>
        {session && (
          <>
            {" · "}
            <Link className="orderLink" href="/orders">
              View all your orders
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
