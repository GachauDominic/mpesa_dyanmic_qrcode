import "dotenv/config";
import { env } from "../config/env";
import { getDarajaAccessToken } from "../lib/daraja/auth";

// One-time (per shortcode) call that tells Safaricom where to send C2B
// validation and confirmation webhooks. Run this once after deploying,
// and again any time those URLs change (e.g. new ngrok tunnel in sandbox).
async function main() {
  const shortCode = process.env.DARAJA_SHORTCODE;
  const confirmationUrl = process.env.DARAJA_CONFIRMATION_URL;
  const validationUrl = process.env.DARAJA_VALIDATION_URL;
  const responseType = process.env.DARAJA_RESPONSE_TYPE ?? "Completed";

  if (!shortCode || !confirmationUrl || !validationUrl) {
    throw new Error(
      "Set DARAJA_SHORTCODE, DARAJA_CONFIRMATION_URL and DARAJA_VALIDATION_URL in .env before running this script."
    );
  }

  const token = await getDarajaAccessToken();

  const res = await fetch(`${env.DARAJA_BASE_URL}/mpesa/c2b/v1/registerurl`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ShortCode: shortCode,
      ResponseType: responseType, // "Completed" or "Cancelled"
      ConfirmationURL: confirmationUrl,
      ValidationURL: validationUrl,
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(`Register URL failed (${res.status}): ${JSON.stringify(body)}`);
  }

  console.log("C2B URLs registered:", body);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
