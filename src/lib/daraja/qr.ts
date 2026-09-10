import { env } from "../../config/env";
import { getDarajaAccessToken } from "./auth";
import { DynamicQrRequest, DynamicQrResponse } from "./types";

export async function generateDynamicQr(
  payload: DynamicQrRequest
): Promise<DynamicQrResponse> {
  const token = await getDarajaAccessToken();

  const res = await fetch(`${env.DARAJA_BASE_URL}/mpesa/qrcode/v1/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(
      `Daraja Dynamic QR failed (${res.status}): ${JSON.stringify(body)}`
    );
  }

  return body as DynamicQrResponse;
}

// Daraja returns raw base64 with no prefix — this is what you hand to an <img> tag.
export function toDataUri(base64: string): string {
  return `data:image/png;base64,${base64}`;
}
