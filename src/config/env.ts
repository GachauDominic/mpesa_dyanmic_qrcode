import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET should be a long random string"),

  DARAJA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  DARAJA_BASE_URL: z.string().url(),
  DARAJA_CONSUMER_KEY: z.string().min(1),
  DARAJA_CONSUMER_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
