"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

let cachedToken: { value: string; expiresAtMs: number } | null = null;

function tokenExpiryMs(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

// Bearer token for the eve agent routes. The eve runtime is a separate
// service that can't read the app's session cookie, so it verifies these
// short-lived (15 min) Neon Auth JWTs against the project JWKS instead —
// see agent/channels/eve.ts. Cached until shortly before expiry.
//
// Returns "" when no session token is available rather than throwing: eve's
// extractBearerToken treats an empty bearer as absent, so the channel's other
// authenticators (localDev in development) still get their turn, and a
// production caller without a session gets the channel's clean 401.
export async function getEveToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAtMs - 60_000) {
    return cachedToken.value;
  }
  const { data, error } = await authClient.token().catch(() => ({
    data: null,
    error: { message: "token fetch failed" },
  }));
  if (error || !data?.token) {
    return "";
  }
  cachedToken = { value: data.token, expiresAtMs: tokenExpiryMs(data.token) };
  return data.token;
}
