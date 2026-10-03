import { Router } from "express";
import { createMerchantController } from "../validators/schemas";
import { requireAuth } from "../middleware/auth";
import { addChannelController } from "../controllers/merchant.controller";

export const merchantRouter = Router();

// Deliberately NOT behind requireAuth — a merchant doesn't have a JWT yet
// at the moment they're signing up, so requiring one would make this
// endpoint impossible to ever call.
merchantRouter.post("/", createMerchantController);
merchantRouter.post("/me/channels", requireAuth, addChannelController);
