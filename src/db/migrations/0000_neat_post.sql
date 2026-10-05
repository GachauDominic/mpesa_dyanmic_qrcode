CREATE TYPE "public"."channel_type" AS ENUM('TILL', 'PAYBILL', 'POCHI', 'SEND_MONEY');--> statement-breakpoint
CREATE TYPE "public"."qr_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('MERCHANT_ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(50) NOT NULL,
	"lastName" varchar(50) NOT NULL,
	"hostEmail" varchar(100) NOT NULL,
	"password_harsh" varchar(255) NOT NULL,
	"role" text DEFAULT 'SUPER_ADMIN' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"channel_type" "channel_type" NOT NULL,
	"cpi" text NOT NULL,
	"label" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'MERCHANT_ADMIN' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_confirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_request_id" uuid,
	"mpesa_receipt_number" text,
	"trans_amount" integer,
	"msisdn" text,
	"raw_payload" jsonb NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qr_requests" (
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
ALTER TABLE "merchant_channels" ADD CONSTRAINT "merchant_channels_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_confirmations" ADD CONSTRAINT "payment_confirmations_qr_request_id_qr_requests_id_fk" FOREIGN KEY ("qr_request_id") REFERENCES "public"."qr_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_requests" ADD CONSTRAINT "qr_requests_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_requests" ADD CONSTRAINT "qr_requests_channel_id_merchant_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."merchant_channels"("id") ON DELETE no action ON UPDATE no action;