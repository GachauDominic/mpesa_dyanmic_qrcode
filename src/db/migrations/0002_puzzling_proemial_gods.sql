ALTER TABLE "admins" RENAME COLUMN "password_harsh" TO "password_hash";--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('MERCHANT', 'SUPER_ADMIN');--> statement-breakpoint
ALTER TABLE "merchants" ALTER COLUMN "role" SET DEFAULT 'MERCHANT';