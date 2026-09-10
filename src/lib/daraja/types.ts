// The channel names your app uses internally
export type ChannelType = "TILL" | "PAYBILL" | "POCHI" | "SEND_MONEY";

// Daraja's own TrxCode values for the Dynamic QR endpoint
export type DarajaTrxCode = "BG" | "PB" | "SB" | "SM";

// TILL -> Buy Goods, PAYBILL -> Paybill, POCHI -> Sent to Business (Pochi la
// Biashara), SEND_MONEY -> Send Money. Verify SB vs SM for Pochi against the
// sandbox simulator once you have credentials — Safaricom's public docs don't
// name Pochi explicitly, this is the closest documented match.
export const CHANNEL_TO_TRX_CODE: Record<ChannelType, DarajaTrxCode> = {
  TILL: "BG",
  PAYBILL: "PB",
  POCHI: "SB",
  SEND_MONEY: "SM",
};

export interface DynamicQrRequest {
  MerchantName: string;
  RefNo: string;
  Amount: number;
  TrxCode: DarajaTrxCode;
  CPI: string;
  Size: string;
}

export interface DynamicQrResponse {
  ResponseCode: string;
  RequestID: string;
  ResponseDescription: string;
  QRCode: string; // base64 PNG data, no data: prefix
}
