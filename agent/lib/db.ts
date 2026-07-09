import { PrismaNeon } from "@prisma/adapter-neon";

// Relative import (no tsconfig alias): eve compiles the agent tree separately
// from Next.js, and tools run in the eve app runtime with process.env.
import { PrismaClient } from "../../src/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { agentPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.agentPrisma ??
  new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.agentPrisma = prisma;
}

// Single-user MVP: every tool operates on the seeded user's data.
export async function getUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    throw new Error("No user found — run `npx prisma db seed` first.");
  }
  return user;
}
