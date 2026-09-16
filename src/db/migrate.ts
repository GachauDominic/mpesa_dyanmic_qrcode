import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { env } from "../config/env";

async function main() {
  const migrationClient = neon(env.DATABASE_URL);
  const db = drizzle(migrationClient);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
