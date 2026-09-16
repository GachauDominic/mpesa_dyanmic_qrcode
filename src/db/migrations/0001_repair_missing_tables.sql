CREATE TABLE IF NOT EXISTS "merchants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "business_name" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant_channels" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "merchant_id" uuid NOT NULL,
        "channel_type" "channel_type" NOT NULL,
        "cpi" text NOT NULL,
        "label" text,
        "is_default" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qr_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "merchant_id" uuid NOT NULL,
        "channel_id" uuid NOT NULL,
        "ref_no" text NOT NULL,
        "amount" integer NOT NULL,
        "trx_code" text NOT NULL,
        "cpi" text NOT NULL,
        "merchant_name" text NOT NULL,
        "qr_image_base64" text,
        "status" "qr_status" DEFAULT 'PENDING' NOT NULL,
        "daraja_request_id" text,
        "daraja_response_code" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "paid_at" timestamp,
        CONSTRAINT "qr_requests_ref_no_unique" UNIQUE("ref_no")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_confirmations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "qr_request_id" uuid,
        "mpesa_receipt_number" text,
        "trans_amount" integer,
        "msisdn" text,
        "raw_payload" jsonb NOT NULL,
        "received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "password_hash" text NOT NULL,
        "merchant_id" uuid,
        "role" "user_role" DEFAULT 'MERCHANT_ADMIN' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "merchant_channels" ADD CONSTRAINT "merchant_channels_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qr_requests" ADD CONSTRAINT "qr_requests_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qr_requests" ADD CONSTRAINT "qr_requests_channel_id_merchant_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."merchant_channels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_confirmations" ADD CONSTRAINT "payment_confirmations_qr_request_id_qr_requests_id_fk" FOREIGN KEY ("qr_request_id") REFERENCES "public"."qr_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;