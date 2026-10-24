import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as authSchema from "./db/auth-schema";
import { customers } from "./db/schema";

// During `next build` (e.g. inside the Docker image build) there are no
// runtime secrets. A placeholder keeps the build from failing; it is never
// used to sign anything, because the pages that need auth render per request.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),

  // Required at runtime: a long random string (see .env.example).
  secret:
    process.env.BETTER_AUTH_SECRET ??
    (isBuild ? "build-time-placeholder-secret-not-used-at-runtime" : undefined),

  // The public address of the site, e.g. http://localhost:3000
  baseURL: process.env.BETTER_AUTH_URL,

  // Extra addresses the site may be opened from (comma-separated), e.g. a LAN IP.
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Email verification and password reset need an outgoing mail server;
    // they can be added later.
  },

  databaseHooks: {
    user: {
      create: {
        // The customers table has narrower columns than Better Auth's user
        // table, so reject over-long values up front with a clear message.
        before: async (user) => {
          if (user.name.length > 100 || user.email.length > 100) {
            throw new APIError("BAD_REQUEST", {
              message: "Name and email must each be 100 characters or fewer.",
            });
          }
        },

        // Every new account gets a matching customers row straight away, so
        // support can always find a customer by email, even if their first
        // checkout fails. Saved address details are filled in later.
        after: async (user) => {
          try {
            await db
              .insert(customers)
              .values({ authUserId: user.id, email: user.email, name: user.name })
              .onConflictDoNothing({ target: customers.authUserId });
          } catch (error) {
            // Never block sign-up over this. Checkout creates the row if it's missing.
            console.error("Could not create the customer row for a new account:", error);
          }
        },
      },
    },
  },

  // Lets Server Actions and Server Components set the session cookie.
  // Must be the LAST plugin in the list.
  plugins: [nextCookies()],
});
