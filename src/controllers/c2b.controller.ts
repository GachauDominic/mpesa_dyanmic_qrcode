import { Request, Response, NextFunction } from "express";
import { buildValidationResponse, recordConfirmation } from "../services/c2b.service";

export function handleValidation(_req: Request, res: Response) {
  res.json(buildValidationResponse());
}

export async function handleConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    await recordConfirmation(req.body);
    // Safaricom expects this exact shape to consider the callback handled.
    res.json({ ResultCode: 0, ResultDesc: "Confirmation received successfully" });
  } catch (err) {
    next(err);
  }
}
