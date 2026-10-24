import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "./index";
import { customers } from "./schema";

// The saved details for a signed-in user, or null if they haven't saved any.
// Looked up by the account ID from the session, never by a typed email.
export const getCustomerByAuthUserId = cache(async (authUserId: string) => {
  const rows = await db
    .select({
      id: customers.customerId,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      address: customers.address,
      city: customers.city,
      state: customers.state,
      zip: customers.zip,
      dateOfBirth: customers.dateOfBirth,
    })
    .from(customers)
    .where(eq(customers.authUserId, authUserId))
    .limit(1);
  return rows[0] ?? null;
});
