"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";

import { authClient } from "@/lib/auth/client";

export function AuthUIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
