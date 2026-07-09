import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

// Server-side Neon Auth instance: .handler() backs /api/auth/[...path],
// .middleware() backs proxy.ts, and .getSession() serves server components
// and actions.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
