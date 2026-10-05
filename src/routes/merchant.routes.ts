import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createMerchantController,
  addChannelController,
} from "../controllers/merchant.controller";

export const merchantRouter = Router();

merchantRouter.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  createMerchantController,
);
merchantRouter.post("/:merchantId/channels", requireAuth, addChannelController);
