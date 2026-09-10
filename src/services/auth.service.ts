import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";
import { env } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../lib/errors";

export async function login(email: string, password: string): Promise<{ token: string }> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.merchantId) {
    throw new ForbiddenError("User has no associated merchant");
  }

  const token = jwt.sign(
    { userId: user.id, merchantId: user.merchantId, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return { token };
}
