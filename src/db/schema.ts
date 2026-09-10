import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

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

export const userRoleEnum = pgEnum("user_role", ["MERCHANT_ADMIN", "SUPER_ADMIN"]);

export const merchants = pgTable("merchants", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A merchant can register several channels (Till + Paybill + Pochi, etc).
// Exactly one row per merchant should have isDefault = true.
export const merchantChannels = pgTable("merchant_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  channelType: channelTypeEnum("channel_type").notNull(),
  // The Daraja CPI: till number, paybill number, or MSISDN depending on channelType
  cpi: text("cpi").notNull(),
  label: text("label"), // e.g. "Main till", "School fees paybill"
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const qrRequests = pgTable("qr_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  channelId: uuid("channel_id")
    .references(() => merchantChannels.id)
    .notNull(),
  refNo: text("ref_no").notNull().unique(),
  amount: integer("amount").notNull(),

  // Snapshots of what was actually sent to Daraja, in case the merchant's
  // channel config changes later — keeps historical requests accurate.
  trxCode: text("trx_code").notNull(),
  cpi: text("cpi").notNull(),
  merchantName: text("merchant_name").notNull(),

  qrImageBase64: text("qr_image_base64"),
  status: qrStatusEnum("status").default("PENDING").notNull(),

  darajaRequestId: text("daraja_request_id"),
  darajaResponseCode: text("daraja_response_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const paymentConfirmations = pgTable("payment_confirmations", {
  id: uuid("id").defaultRandom().primaryKey(),
  qrRequestId: uuid("qr_request_id").references(() => qrRequests.id),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  transAmount: integer("trans_amount"),
  msisdn: text("msisdn"),
  rawPayload: jsonb("raw_payload").notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  merchantId: uuid("merchant_id").references(() => merchants.id),
  role: userRoleEnum("role").default("MERCHANT_ADMIN").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
