import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { admins, TIAdmin } from "../db/schema";
import { env } from "../config/env";
import { UnauthorizedError } from "../lib/errors";

export const registerAdminService = async (admin: TIAdmin) => {
  const newAdmin = await db.insert(admins).values(admin).returning();
  return newAdmin;
};

export async function login(
  email: string,
  password: string,
): Promise<{ adminFirstName: string; token: string }> {
  const [admin] = await db.select().from(admins).where(eq(admins.email, email));
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = jwt.sign(
    { adminId: admin.id, role: admin.role },
    env.JWT_SECRET,
    {
      expiresIn: "12h",
    },
  );

  return { adminFirstName: admin.firstName, token };
}
