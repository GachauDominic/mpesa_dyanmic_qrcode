import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db/client";
import { merchants, merchantChannels, users } from "../db/schema";
import { ChannelType } from "../lib/daraja/types";
import { BadRequestError } from "../lib/errors";

interface CreateMerchantParams {
  businessName: string;
  adminEmail: string;
  adminPassword: string;
  channelType: ChannelType;
  cpi: string;
}

interface CreateMerchantResult {
  merchantId: string;
  businessName: string;
  channel: {
    type: ChannelType;
    cpi: string;
  };
}

interface AddChannelParams {
  merchantId: string;
  channelType: ChannelType;
  cpi: string;
  isDefault?: boolean;
}

interface AddChannelResult {
  id: string;
  channelType: ChannelType;
  cpi: string;
  isDefault: boolean;
}

export async function createMerchant(
  params: CreateMerchantParams,
): Promise<CreateMerchantResult> {
  const { businessName, adminEmail, adminPassword, channelType, cpi } = params;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail));
  if (existing) {
    throw new BadRequestError("Email is already registered to a merchant");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // All three inserts succeed together or not at all — otherwise a failure
  // partway through could leave a merchant with no user able to log into it.
  return db.transaction(async (tx) => {
    const [merchant] = await tx
      .insert(merchants)
      .values({ businessName })
      .returning();

    const [channel] = await tx
      .insert(merchantChannels)
      .values({
        merchantId: merchant.id,
        channelType,
        cpi,
        label: "Default channel",
        isDefault: true,
      })
      .returning();

    await tx.insert(users).values({
      email: adminEmail,
      passwordHash,
      merchantId: merchant.id,
      role: "MERCHANT_ADMIN",
    });

    return {
      merchantId: merchant.id,
      businessName: merchant.businessName,
      channel: {
        type: channel.channelType,
        cpi: channel.cpi,
      },
    };
  });
}

export async function addMerchantChannel(
  params: AddChannelParams,
): Promise<AddChannelResult> {
  const { merchantId, channelType, cpi, isDefault = false } = params;

  const [existingOfType] = await db
    .select()
    .from(merchantChannels)
    .where(
      and(
        eq(merchantChannels.merchantId, merchantId),
        eq(merchantChannels.channelType, channelType),
      ),
    );

  if (existingOfType) {
    throw new BadRequestError(
      `Merchant already has a ${channelType} channel configured`,
    );
  }

  return db.transaction(async (tx) => {
    if (isDefault) {
      // Only one channel should ever be the default — clear the old one first.
      await tx
        .update(merchantChannels)
        .set({ isDefault: false })
        .where(
          and(
            eq(merchantChannels.merchantId, merchantId),
            eq(merchantChannels.isDefault, true),
          ),
        );
    }

    const [channel] = await tx
      .insert(merchantChannels)
      .values({ merchantId, channelType, cpi, isDefault })
      .returning();

    return {
      id: channel.id,
      channelType: channel.channelType,
      cpi: channel.cpi,
      isDefault: channel.isDefault,
    };
  });
}
