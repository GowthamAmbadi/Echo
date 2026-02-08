import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  return user ?? null;
}

export async function verifyPassword(user: { passwordHash: string }, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = data.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(data.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name: data.name?.trim() || null,
    })
    .returning();
  return user ?? null;
}
