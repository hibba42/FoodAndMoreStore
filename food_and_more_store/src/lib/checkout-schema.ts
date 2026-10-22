import { z } from "zod";
import { STATE_CODES } from "./checkout-types";

// Server-side validation for the checkout form. Lengths match the database
// columns. Date of birth is checked separately (it depends on the cart).

const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const checkoutSchema = z.object({
  name: text("Name", 100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(100, "Email must be 100 characters or fewer.")
    .email("Enter a valid email address."),
  // Keep digits (and a leading +) only; empty becomes null.
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d+]/g, ""))
    .refine((v) => v === "" || /^\+?\d{7,15}$/.test(v), "Enter a valid phone number (7 to 15 digits).")
    .transform((v) => (v === "" ? null : v)),
  address: text("Street address", 150),
  city: text("City", 60),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => STATE_CODES.includes(v), "Choose a state."),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a ZIP code like 97201 or 97201-1234."),
});
