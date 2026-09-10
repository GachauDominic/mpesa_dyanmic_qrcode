import { Router } from "express";
import { handleValidation, handleConfirmation } from "../controllers/c2b.controller";

export const c2bRouter = Router();

c2bRouter.post("/validation", handleValidation);
c2bRouter.post("/confirmation", handleConfirmation);
