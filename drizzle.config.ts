import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out:"./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: (globalThis as typeof globalThis & {
      process?: { env?: { DATABASE_URL?: string } };
    }).process?.env?.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
} satisfies Config;
