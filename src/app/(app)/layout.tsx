import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

// Every workspace route is session-gated, so static prerendering can never
// succeed. Declaring that up front stops `next build` from attempting it and
// hitting cookies() mid-render — which neon-auth logged as a scary (but
// harmless) "Cookie validation error" for each route on every build.
export const dynamic = "force-dynamic";

// proxy.ts guarantees a session exists; this guards *which* account it is.
// Sign-up against the Neon Auth service stays open until disabled in the
// Neon config, so AUTH_ALLOWED_EMAILS pins the workspace to its owner.
async function assertAllowedAccount() {
  const allowed = process.env.AUTH_ALLOWED_EMAILS;
  if (!allowed) return;
  const { data: session } = await auth.getSession();
  const email = session?.user?.email?.trim().toLowerCase();
  const isAllowed =
    email !== undefined &&
    allowed
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .includes(email);
  if (!isAllowed) {
    redirect("/auth/sign-in");
  }
}

// The workspace chrome. First run (no user yet) hands off to onboarding.
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertAllowedAccount();

  const users = await prisma.user.count();
  if (users === 0) {
    redirect("/welcome");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
