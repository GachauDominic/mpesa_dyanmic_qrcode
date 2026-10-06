import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const generateQrSchema = z.object({
  merchantId: z.string().uuid(),
  amount: z.number().int().positive(),
  refNo: z.string().min(1).max(20).optional(),
  channelType: z.enum(["TILL", "PAYBILL", "POCHI", "SEND_MONEY"]).optional(),
  channelId: z.string().uuid().optional(),
});

export type GenerateQrInput = z.infer<typeof generateQrSchema>;
