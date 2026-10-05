import { Request, Response, NextFunction } from "express";
import { generateQrSchema } from "../validators/schemas";
import {
  generateQrForMerchant,
  getQrById,
  getQrImageById,
} from "../services/qr.service";

export async function generateQr(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = generateQrSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await generateQrForMerchant(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getQr(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getQrById(String(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getQrImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const buffer = await getQrImageById(String(req.params.id));
    res.type("png").send(buffer);
  } catch (err) {
    next(err);
  }
}
