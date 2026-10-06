import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { merchants, merchantChannels, qrRequests } from "../db/schema";
import { generateDynamicQr, toDataUri } from "../lib/daraja/qr";
import { CHANNEL_TO_TRX_CODE, ChannelType } from "../lib/daraja/types";
import { NotFoundError, BadRequestError } from "../lib/errors";

interface GenerateQrParams {
  merchantId: string;
  amount: number;
  refNo?: string;
  channelType?: ChannelType;
  channelId?: string;
}

interface GenerateQrResult {
  id: string;
  refNo: string;
  amount: number;
  channel: ChannelType;
  status: string;
  qrCodeDataUri: string;
}

async function resolveChannel(
  merchantId: string,
  channelId?: string,
  channelType?: ChannelType,
) {
  if (channelId) {
    const [channel] = await db
      .select()
      .from(merchantChannels)
      .where(
        and(
          eq(merchantChannels.id, channelId),
          eq(merchantChannels.merchantId, merchantId),
        ),
      );

    if (!channel) {
      throw new BadRequestError("No matching channel found for this merchant");
    }
    return channel;
  }

  if (channelType) {
    const matches = await db
      .select()
      .from(merchantChannels)
      .where(
        and(
          eq(merchantChannels.merchantId, merchantId),
          eq(merchantChannels.channelType, channelType),
        ),
      );

    if (matches.length === 0) {
      throw new BadRequestError(
        `Merchant has no ${channelType} channel configured`,
      );
    }
    if (matches.length > 1) {
      throw new BadRequestError(
        `Merchant has multiple ${channelType} channels — pass channelId to pick one`,
      );
    }
    return matches[0];
  }

  const [defaultChannel] = await db
    .select()
    .from(merchantChannels)
    .where(
      and(
        eq(merchantChannels.merchantId, merchantId),
        eq(merchantChannels.isDefault, true),
      ),
    );

  if (!defaultChannel) {
    throw new BadRequestError("Merchant has no default channel configured");
  }
  return defaultChannel;
}

export async function generateQrForMerchant(
  params: GenerateQrParams,
): Promise<GenerateQrResult> {
  const { merchantId, amount, refNo, channelType, channelId } = params;

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, merchantId));

  if (!merchant) {
    throw new NotFoundError("Merchant not found");
  }

  const channel = await resolveChannel(merchantId, channelId, channelType);

  const finalRefNo = refNo ?? randomUUID().slice(0, 12);
  const trxCode = CHANNEL_TO_TRX_CODE[channel.channelType];

  const darajaResponse = await generateDynamicQr({
    MerchantName: merchant.businessName,
    RefNo: finalRefNo,
    Amount: amount,
    TrxCode: trxCode,
    CPI: channel.cpi,
    Size: "300",
  });

  const [saved] = await db
    .insert(qrRequests)
    .values({
      merchantId,
      channelId: channel.id,
      refNo: finalRefNo,
      amount,
      trxCode,
      cpi: channel.cpi,
      merchantName: merchant.businessName,
      qrImageBase64: darajaResponse.QRCode,
      darajaRequestId: darajaResponse.RequestID,
      darajaResponseCode: darajaResponse.ResponseCode,
    })
    .returning();

  return {
    id: saved.id,
    refNo: saved.refNo,
    amount: saved.amount,
    channel: channel.channelType,
    status: saved.status,
    qrCodeDataUri: toDataUri(darajaResponse.QRCode),
  };
}

export async function getQrById(id: string) {
  const [record] = await db
    .select()
    .from(qrRequests)
    .where(eq(qrRequests.id, id));

  if (!record) {
    throw new NotFoundError();
  }

  return {
    id: record.id,
    refNo: record.refNo,
    amount: record.amount,
    status: record.status,
    paidAt: record.paidAt,
  };
}

export async function getQrImageById(id: string): Promise<Buffer> {
  const [record] = await db
    .select()
    .from(qrRequests)
    .where(eq(qrRequests.id, id));

  if (!record || !record.qrImageBase64) {
    throw new NotFoundError("QR image not found");
  }

  return Buffer.from(record.qrImageBase64, "base64");
}
