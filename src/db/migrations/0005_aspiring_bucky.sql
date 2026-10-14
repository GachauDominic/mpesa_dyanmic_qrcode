ALTER TABLE "qr_requests" DROP CONSTRAINT "qr_requests_ref_no_unique";--> statement-breakpoint
CREATE INDEX "merchant_channels_merchant_type_idx" ON "merchant_channels" USING btree ("merchant_id","channel_type");--> statement-breakpoint
CREATE UNIQUE INDEX "merchant_channels_merchant_cpi_uq" ON "merchant_channels" USING btree ("merchant_id","cpi");--> statement-breakpoint
CREATE UNIQUE INDEX "merchant_channels_one_default_uq" ON "merchant_channels" USING btree ("merchant_id") WHERE "merchant_channels"."is_default" = true;--> statement-breakpoint
CREATE INDEX "qr_requests_ref_no_idx" ON "qr_requests" USING btree ("ref_no");