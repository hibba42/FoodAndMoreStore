import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load .env.local ourselves
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  // `drizzle-kit pull` writes the generated schema into this folder
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
