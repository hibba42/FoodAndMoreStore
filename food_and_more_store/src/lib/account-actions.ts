"use server";

import { revalidatePath } from "next/cache";
import { checkBirthDate } from "./birth-date";
import { profileSchema } from "./checkout-schema";
import {
  PROFILE_FIELD_NAMES,
  type AccountState,
  type FieldName,
  type ProfileValues,
} from "./checkout-types";
import { db } from "./db";
import { customers } from "./db/schema";
import { getSession } from "./session";

const orNull = (value: string) => (value === "" ? null : value);

// Saves the signed-in member's details (used to prefill checkout).
// The member is identified by their session, never by anything in the form.
export async function saveAccountDetails(
  _previous: AccountState,
  formData: FormData
): Promise<AccountState> {
  const values = {} as ProfileValues;
  for (const name of PROFILE_FIELD_NAMES) {
    const raw = formData.get(name);
    values[name] = typeof raw === "string" ? raw : "";
  }

  const session = await getSession();
  if (!session) {
    return { values, fieldErrors: {}, message: "Please sign in again.", saved: false };
  }

  const parsed = profileSchema.safeParse(values);
  const fieldErrors: Partial<Record<FieldName, string>> = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as FieldName] = issue.message;
      }
    }
  }
  const birthDateError = checkBirthDate(values.dateOfBirth, false);
  if (birthDateError) fieldErrors.dateOfBirth = birthDateError;

  if (!parsed.success || birthDateError) {
    return { values, fieldErrors, message: "Please fix the highlighted fields.", saved: false };
  }

  const data = parsed.data;
  const details = {
    name: data.name,
    phone: data.phone,
    address: orNull(data.address),
    city: orNull(data.city),
    state: orNull(data.state),
    zip: orNull(data.zip),
    dateOfBirth: orNull(values.dateOfBirth),
  };

  try {
    await db
      .insert(customers)
      .values({ authUserId: session.user.id, email: session.user.email, ...details })
      .onConflictDoUpdate({ target: customers.authUserId, set: details });
  } catch (error) {
    console.error("Failed to save account details:", error);
    return { values, fieldErrors: {}, message: "Something went wrong. Please try again.", saved: false };
  }

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { values, fieldErrors: {}, message: null, saved: true };
}
