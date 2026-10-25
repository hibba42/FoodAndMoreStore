import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrdersForUser } from "@/lib/db/orders";
import { formatPrice } from "@/lib/format";
import { getSession } from "@/lib/session";
import LocalDateTime from "../local-date-time";
import "./orders.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders | Food & More Store",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  // The real access check happens here, on the server.
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/orders");

  const orders = await getOrdersForUser(session.user.id);

  return (
    <div className="ordersPage">
      <h1>Your orders</h1>

      {orders.length === 0 ? (
        <>
          <p>You haven&apos;t placed any orders yet.</p>
          <p>
            <Link className="ordersLink" href="/">
              Browse the store
            </Link>
          </p>
        </>
      ) : (
        <ul className="ordersList">
          {orders.map((order) => (
            <li key={order.token}>
              <Link className="ordersLink orderDate" href={`/orders/${order.token}`}>
                <LocalDateTime iso={order.placedAtIso} />
              </Link>
              <span className="orderMeta">
                Order #{order.id} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ·{" "}
                {formatPrice(order.total)} · {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="ordersNote">
        Orders placed as a guest before you signed in aren&apos;t listed here.
      </p>
    </div>
  );
}
