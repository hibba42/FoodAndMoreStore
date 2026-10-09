import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";

// Server-only: import this file from Server Components, Server Actions,
// or Route Handlers, never from a "use client" file.

// Fail fast at runtime if the URL is missing, but not during `next build`,
// where the database isn't available (e.g. inside the Docker build stage).
if (
  !process.env.DATABASE_URL &&
  process.env.NEXT_PHASE !== "phase-production-build"
) {
  throw new Error("DATABASE_URL is not set");
}

// A Pool only connects when the first query runs, so creating it is safe.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({
  client: pool,
  schema: { ...schema, ...relations },
});