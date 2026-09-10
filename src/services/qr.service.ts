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
}

interface GenerateQrResult {
  id: string;
  refNo: string;
  amount: number;
  channel: ChannelType;
  status: string;
  qrCodeDataUri: string;
}

export async function generateQrForMerchant(
  params: GenerateQrParams
): Promise<GenerateQrResult> {
  const { merchantId, amount, refNo, channelType } = params;

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, merchantId));

  if (!merchant) {
    throw new NotFoundError("Merchant not found");
  }

  // No channelType -> the merchant's default channel (just amount + PIN).
  // channelType given -> that specific channel (caller already picked a method).
  const channelFilter = channelType
    ? and(eq(merchantChannels.merchantId, merchantId), eq(merchantChannels.channelType, channelType))
    : and(eq(merchantChannels.merchantId, merchantId), eq(merchantChannels.isDefault, true));

  const [channel] = await db.select().from(merchantChannels).where(channelFilter);

  if (!channel) {
    throw new BadRequestError(
      channelType
        ? `Merchant has no ${channelType} channel configured`
        : "Merchant has no default channel configured"
    );
  }

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

export async function getQrRequestForMerchant(id: string, merchantId: string) {
  const [record] = await db
    .select()
    .from(qrRequests)
    .where(and(eq(qrRequests.id, id), eq(qrRequests.merchantId, merchantId)));

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
