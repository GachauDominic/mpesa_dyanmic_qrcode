import { Request, Response, NextFunction } from "express";
import { loginSchema } from "../validators/schemas";
import { login, registerAdminService } from "../services/auth.service";
import bcrypt from "bcryptjs";

// { create admin }
export const registerAdminController = async (req: Request, res: Response) => {
  try {
    const admin = req.body;
    const passwordHarsh = admin.passwordHarsh;
    const hashedpassword = await bcrypt.hashSync(passwordHarsh, 10);
    admin.passwordHarsh = hashedpassword;

    const newAdmin = await registerAdminService(admin);
    if (!newAdmin)
      return res.status(401).json({ message: "Admin not created!" });
    return res
      .status(201)
      .json({ message: "Admin created successfully", data: newAdmin });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// { login admin }
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    res.status(200);
    const result = await login(parsed.data.email, parsed.data.password);
    res.json({ message: "Login was successful", result });
  } catch (err) {
    next(err);
  }
}
