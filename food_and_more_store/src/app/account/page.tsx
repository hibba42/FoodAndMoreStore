import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toDateInputValue } from "@/lib/birth-date";
import type { ProfileValues } from "@/lib/checkout-types";
import { getCustomerByAuthUserId } from "@/lib/db/customers";
import { getSession } from "@/lib/session";
import AccountForm from "./account-form";
import "./account.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your account | Food & More Store" };

export default async function AccountPage() {
  // The real access check happens here, on the server.
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/account");

  const customer = await getCustomerByAuthUserId(session.user.id);
  const defaults: ProfileValues = {
    name: customer?.name ?? session.user.name,
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    state: customer?.state ?? "",
    zip: customer?.zip ?? "",
    dateOfBirth: toDateInputValue(customer?.dateOfBirth),
  };

  return (
    <div className="accountPage">
      <h1>Your account</h1>
      <p>
        Signed in as <strong>{session.user.email}</strong>
      </p>

      <p>
        <Link className="accountLink" href="/orders">
          View your order history
        </Link>
      </p>

      <section aria-labelledby="saved-details">
        <h2 id="saved-details">Saved details</h2>
        <p className="accountIntro">
          These fill in the checkout form for you. You can still change them on any order.
        </p>
        <AccountForm defaults={defaults} />
      </section>
    </div>
  );
}
