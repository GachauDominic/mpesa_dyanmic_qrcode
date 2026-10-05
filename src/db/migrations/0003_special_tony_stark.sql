ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'SUPER_ADMIN'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_email_unique" UNIQUE("email");