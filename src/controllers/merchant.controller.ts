import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createMerchant,
  addMerchantChannel,
} from "../services/merchant.service";

export const createMerchantSchema = z.object({
  businessName: z.string().min(1).max(100),
  channelType: z.enum(["TILL", "PAYBILL", "POCHI", "SEND_MONEY"]),
  cpi: z.string().min(1),
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

const addChannelSchema = z.object({
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
      merchantId: String(req.params.merchantId),
      ...parsed.data,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
