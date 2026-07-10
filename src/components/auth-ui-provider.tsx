"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { toast } from "sonner";

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
      // Surface the auth UI's success/error feedback (avatar accepted,
      // upload failed, …) through the app's toaster.
      toast={({ variant, message }) => {
        if (!message) return;
        if (variant === "error") toast.error(message);
        else if (variant === "success") toast.success(message);
        else if (variant === "warning") toast.warning(message);
        else toast(message);
      }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
