import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const generateQrSchema = z.object({
  amount: z.number().int().positive(),
  // Optional order/invoice reference. If you don't pass one, we generate one.
  refNo: z.string().min(1).max(20).optional(),
  // Omit this to use the merchant's default channel (the "just amount + PIN" flow).
  // Pass it to let the caller pick a specific channel (the "choose a method" flow).
  channelType: z.enum(["TILL", "PAYBILL", "POCHI", "SEND_MONEY"]).optional(),
});

export type GenerateQrInput = z.infer<typeof generateQrSchema>;
