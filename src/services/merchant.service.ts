import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { merchants, merchantChannels } from "../db/schema";
import { ChannelType } from "../lib/daraja/types";
import { BadRequestError } from "../lib/errors";

interface CreateMerchantParams {
  businessName: string;
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

export async function createMerchant(
  params: CreateMerchantParams,
): Promise<CreateMerchantResult> {
  const { businessName, channelType, cpi } = params;

  const [existing] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.businessName, businessName));

  if (existing) {
    throw new BadRequestError(
      "Business name is already registered to a merchant",
    );
  }

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

export async function addMerchantChannel(
  params: AddChannelParams,
): Promise<AddChannelResult> {
  const { merchantId, channelType, cpi, isDefault = false } = params;

  const [existingCpi] = await db
    .select()
    .from(merchantChannels)
    .where(
      and(
        eq(merchantChannels.merchantId, merchantId),
        eq(merchantChannels.cpi, cpi),
      ),
    );

  if (existingCpi) {
    throw new BadRequestError(
      `CPI "${cpi}" is already registered to this merchant`,
    );
  }

  return db.transaction(async (tx) => {
    if (isDefault) {
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
