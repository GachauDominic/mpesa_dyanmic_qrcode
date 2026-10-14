import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Maps directly to Daraja's TrxCode values for the channels this project supports.
// BG = Buy Goods (Till), PB = Paybill, SB = Sent to Business (Pochi la Biashara), SM = Send Money
export const channelTypeEnum = pgEnum("channel_type", [
  "TILL",
  "PAYBILL",
  "POCHI",
  "SEND_MONEY",
]);

export const qrStatusEnum = pgEnum("qr_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "EXPIRED",
]);

export const userRoleEnum = pgEnum("user_role", ["MERCHANT", "SUPER_ADMIN"]);

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("SUPER_ADMIN").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const merchants = pgTable("merchants", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: text("role").default("MERCHANT").notNull(),
});

// A merchant can register several channels (Till + Paybill + Pochi, etc).
// Exactly one row per merchant should have isDefault = true.
export const merchantChannels = pgTable(
  "merchant_channels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id)
      .notNull(),
    channelType: channelTypeEnum("channel_type").notNull(),
    cpi: text("cpi").notNull(),
    label: text("label"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // resolveChannel(): WHERE merchant_id = ? AND channel_type = ?
    merchantTypeIdx: index("merchant_channels_merchant_type_idx").on(
      table.merchantId,
      table.channelType,
    ),

    // addMerchantChannel(): WHERE merchant_id = ? AND cpi = ?
    // Unique, so the database itself enforces "no repeated CPI within a merchant".
    merchantCpiUnique: uniqueIndex("merchant_channels_merchant_cpi_uq").on(
      table.merchantId,
      table.cpi,
    ),

    // resolveChannel() default lookup: WHERE merchant_id = ? AND is_default = true
    // Partial + unique: at most one default channel per merchant.
    oneDefaultPerMerchant: uniqueIndex("merchant_channels_one_default_uq")
      .on(table.merchantId)
      .where(sql`${table.isDefault} = true`),
  }),
);

export const qrRequests = pgTable(
  "qr_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id)
      .notNull(),
    channelId: uuid("channel_id")
      .references(() => merchantChannels.id)
      .notNull(),
    refNo: text("ref_no").notNull(), // no longer .unique()
    amount: integer("amount").notNull(),
    trxCode: text("trx_code").notNull(),
    cpi: text("cpi").notNull(),
    merchantName: text("merchant_name").notNull(),
    qrImageBase64: text("qr_image_base64"),
    status: qrStatusEnum("status").default("PENDING").notNull(),
    darajaRequestId: text("daraja_request_id"),
    darajaResponseCode: text("daraja_response_code"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
  },
  (table) => ({
    refNoIdx: index("qr_requests_ref_no_idx").on(table.refNo),
  }),
);

export const paymentConfirmations = pgTable("payment_confirmations", {
  id: uuid("id").defaultRandom().primaryKey(),
  qrRequestId: uuid("qr_request_id").references(() => qrRequests.id),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  transAmount: integer("trans_amount"),
  msisdn: text("msisdn"),
  rawPayload: jsonb("raw_payload").notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export type TIAdmin = typeof admins.$inferInsert;
export type TSAdmin = typeof admins.$inferSelect;
export type TIMerchant = typeof merchants.$inferInsert;
export type TSMerchant = typeof merchants.$inferSelect;
