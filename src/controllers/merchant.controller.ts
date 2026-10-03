import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createMerchant,
  addMerchantChannel,
} from "../services/merchant.service";

// Ideally this lives in validators/schemas.ts alongside the others —
// kept here since only three files were asked for this time.
export const createMerchantSchema = z.object({
  businessName: z.string().min(1).max(100),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  channelType: z.enum(["TILL", "PAYBILL", "POCHI", "SEND_MONEY"]),
  cpi: z.string().min(1),
});

export const addChannelSchema = z.object({
  channelType: z.enum(["TILL", "PAYBILL", "POCHI", "SEND_MONEY"]),
  cpi: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export async function addChannelController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = addChannelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await addMerchantChannel({
      merchantId: req.user!.merchantId,
      ...parsed.data,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
