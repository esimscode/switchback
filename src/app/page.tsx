import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const users = await prisma.user.count();
  redirect(users === 0 ? "/welcome" : "/dashboard");
}
