import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

// Server-side Neon Auth instance: .handler() backs /api/auth/[...path],
// .middleware() backs proxy.ts, and .getSession() serves server components
// and actions.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // Session data (name, avatar, …) is cached in a signed cookie; the
    // default 300s made profile changes take minutes to show up in
    // server-rendered pages. One minute keeps staleness tolerable.
    sessionDataTtl: 60,
  },
});
