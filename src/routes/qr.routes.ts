import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { generateQr, getQr, getQrImage } from "../controllers/qr.controller";

export const qrRouter = Router();

qrRouter.post("/generate", requireAuth, generateQr);
qrRouter.get("/:id", requireAuth, getQr);
qrRouter.get("/:id/image", requireAuth, getQrImage);
