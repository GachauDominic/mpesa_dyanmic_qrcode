import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./client";
import { merchants, merchantChannels, admins } from "./schema";

const CHANNEL_TYPES = ["TILL", "PAYBILL", "POCHI", "SEND_MONEY"] as const;

async function main() {
  const merchantName = process.env.SEED_MERCHANT_NAME ?? "Dominic's Shop";
  const channelType = process.env.SEED_CHANNEL_TYPE ?? "TILL";
  const channelCpi = process.env.SEED_CHANNEL_CPI ?? "174379";

  const adminFirstName = process.env.SEED_ADMIN_FIRST_NAME ?? "Dominic";
  const adminLastName = process.env.SEED_ADMIN_LAST_NAME ?? "Admin";
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "gachaudominic@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "*T89z>O35e=7tm";

  if (!CHANNEL_TYPES.includes(channelType as any)) {
    throw new Error(
      `SEED_CHANNEL_TYPE must be one of ${CHANNEL_TYPES.join(", ")}`,
    );
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

  await db.insert(admins).values({
    firstName: adminFirstName,
    lastName: adminLastName,
    email: adminEmail,
    passwordHash,
    role: "SUPER_ADMIN",
  });

  console.log("Seeded merchant:", merchant.id, "-", merchant.businessName);
  console.log("Admin login:", adminEmail, "/", adminPassword);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
