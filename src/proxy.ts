import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

// Gate the whole app behind a Neon Auth session. Excluded from the matcher:
// - /              the public landing page (`.+` requires a non-empty path,
//                  so the waitlist form's server action stays reachable)
// - /auth/*        sign-in and sign-up pages
// - /api/auth/*    the Neon Auth proxy handler
// - /api/cron/*    scheduled jobs — guarded by CRON_SECRET, not a session
// - /eve/*, /_eve_internal/*  the eve agent routes — the channel enforces its
//   own auth (agent/channels/eve.ts) and must return 401 JSON, not a redirect
// - /opengraph-image, /twitter-image  the generated share cards (no file
//   extension, so social crawlers must reach them without an auth redirect)
// - /_next/*, files with an extension  static assets
const neonAuthMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default async function proxy(request: NextRequest) {
  // The SDK middleware (0.4.2-beta) forwards the incoming request verbatim to
  // the upstream get-session endpoint, which only accepts GET. A server-action
  // POST therefore has its body consumed and its session check fail, bouncing
  // the action to the sign-in page. Probe the session with a synthetic GET
  // instead, and let mutations through untouched once it passes.
  if (request.method !== "GET" && request.method !== "HEAD") {
    const probe = new NextRequest(new URL("/", request.url), {
      headers: request.headers,
    });
    const result = await neonAuthMiddleware(probe);
    if (result && result.status >= 300 && result.status < 400) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url), 303);
    }
    return NextResponse.next();
  }

  return neonAuthMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!auth|api/auth|api/cron|eve|_eve_internal|_next|opengraph-image|twitter-image|.*\\..*).+)",
  ],
};
