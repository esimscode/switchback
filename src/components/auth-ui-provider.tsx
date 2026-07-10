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
      // Professional headshot: resized client-side and stored on the Neon
      // Auth user (no upload handler → data URL in user.image). Editable
      // from Account → Settings; shown in the sidebar and career profile.
      avatar={{ size: 256, extension: "webp" }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
