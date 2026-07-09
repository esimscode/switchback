import { prisma } from "@/lib/db";

// Single-user MVP: the workspace belongs to the seeded user.
export async function getUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    throw new Error("No user found. Run `npx prisma db seed` first.");
  }
  return user;
}
