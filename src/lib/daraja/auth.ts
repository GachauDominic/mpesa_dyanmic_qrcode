import { env } from "../../config/env";

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

let cached: CachedToken | null = null;

// Daraja tokens are valid ~3600s. We refresh a little early to be safe.
const SAFETY_MARGIN_MS = 60_000;

export async function getDarajaAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const credentials = Buffer.from(
    `${env.DARAJA_CONSUMER_KEY}:${env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(
    `${env.DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daraja OAuth failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: string; // seconds, as a string
  };

  cached = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in) * 1000 - SAFETY_MARGIN_MS,
  };

  return cached.token;
}
