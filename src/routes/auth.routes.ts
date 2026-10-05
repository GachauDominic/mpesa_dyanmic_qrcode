import { Router } from "express";
import {
  loginController,
  registerAdminController,
} from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", registerAdminController);
authRouter.post("/login", loginController);
