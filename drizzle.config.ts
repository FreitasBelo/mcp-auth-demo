import { defineConfig } from "drizzle-kit";

// Next.js automatically loads `.env.local` during the build.
// Avoid importing `@next/env` here to prevent build-time resolution
// errors when building the Next.js app.

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
