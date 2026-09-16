import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./client";
import { merchants, merchantChannels, users } from "./schema";

const CHANNEL_TYPES = ["TILL", "PAYBILL", "POCHI", "SEND_MONEY"] as const;

async function main() {
  const merchantName = process.env.SEED_MERCHANT_NAME ?? "My Test Shop";
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const channelType = process.env.SEED_CHANNEL_TYPE ?? "TILL";
  const channelCpi = process.env.SEED_CHANNEL_CPI ?? "174379";

  if (!CHANNEL_TYPES.includes(channelType as any)) {
    throw new Error(`SEED_CHANNEL_TYPE must be one of ${CHANNEL_TYPES.join(", ")}`);
  }

  const [merchant] = await db
    .insert(merchants)
    .values({ businessName: merchantName })
    .returning();

  await db.insert(merchantChannels).values({
    merchantId: merchant.id,
    channelType: channelType as (typeof CHANNEL_TYPES)[number],
    cpi: channelCpi,
    label: "Default channel",
    isDefault: true,
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db.insert(users).values({
    email: adminEmail,
    passwordHash,
    merchantId: merchant.id,
    role: "MERCHANT_ADMIN",
  });

  console.log("Seeded merchant:", merchant.id);
  console.log("Admin login:", adminEmail, "/", adminPassword);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
