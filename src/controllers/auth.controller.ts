import { Request, Response, NextFunction } from "express";
import { loginSchema } from "../validators/schemas";
import { login } from "../services/auth.service";

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await login(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
