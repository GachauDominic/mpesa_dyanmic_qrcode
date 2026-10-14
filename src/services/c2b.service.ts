import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { qrRequests, paymentConfirmations } from "../db/schema";

export interface C2bConfirmationPayload {
  TransID?: string;
  TransAmount?: string;
  MSISDN?: string;
  BillRefNumber?: string; // this is your RefNo for Paybill-style transactions
}

// Called on the validation webhook. Unless you have a specific reason to
// reject (e.g. unrecognized account reference), always accept — rejecting
// here can block genuine payments.
export function buildValidationResponse() {
  return { ResultCode: 0, ResultDesc: "Accepted" };
}

export async function recordConfirmation(payload: C2bConfirmationPayload) {
  const refNo = payload.BillRefNumber;
  const paidAmount = payload.TransAmount
    ? Math.round(Number(payload.TransAmount))
    : null;
  let qrRequestId: string | null = null;

  if (refNo && paidAmount !== null) {
    const [match] = await db
      .select()
      .from(qrRequests)
      .where(
        and(
          eq(qrRequests.refNo, refNo),
          eq(qrRequests.amount, paidAmount),
          eq(qrRequests.status, "PENDING"),
        ),
      )
      .orderBy(desc(qrRequests.createdAt))
      .limit(1);

    if (match) {
      qrRequestId = match.id;
      await db
        .update(qrRequests)
        .set({ status: "PAID", paidAt: new Date() })
        .where(eq(qrRequests.id, match.id));
    }
  }

  await db.insert(paymentConfirmations).values({
    qrRequestId,
    mpesaReceiptNumber: payload.TransID,
    transAmount: paidAmount,
    msisdn: payload.MSISDN,
    rawPayload: payload,
  });
}
