import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createMerchantSchema } from "../controllers/merchant.controller";
import { createMerchant } from "../services/merchant.service";

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

export async function createMerchantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createMerchantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await createMerchant(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export type GenerateQrInput = z.infer<typeof generateQrSchema>;
