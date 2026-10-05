import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { TIAdmin, admins, merchants } from "../db/schema";
import { env } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../lib/errors";

export const registerAdminService = async (adminData: TIAdmin) => {
  const [newAdmin] = await db.insert(admins).values(adminData).returning();
  return newAdmin;
};

export async function login(
  email: string,
  password: string,
): Promise<{ email: string; token: string }> {
  const [admin] = await db.select().from(admins).where(eq(admins.email, email));
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, admin.passwordHarsh);
  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (!admin.id) {
    throw new ForbiddenError("Admin has no associated id");
  }

  const token = jwt.sign(
    { adminId: admin.id, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: "12h" },
  );

  return { email, token };
}
