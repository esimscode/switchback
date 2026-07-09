import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";

// Prebuilt Neon Auth views (account settings, security, callback, …).
// Sign-in and sign-up keep their custom Switchback pages, which take
// precedence over this dynamic segment as static routes.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths)
    .filter((path) => path !== "sign-in" && path !== "sign-up")
    .map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <AuthView path={path} />
    </main>
  );
}
