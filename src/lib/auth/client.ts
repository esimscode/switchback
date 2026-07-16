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
//
// authClient.token() can fail transiently without ever hitting the network
// (SDK-internal session-cache races), which used to surface as a chat 401
// ("Authorization is required for this route"). The cookie-authed /token
// route itself is reliable, so fall back to calling it directly.
export async function getEveToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAtMs - 60_000) {
    return cachedToken.value;
  }
  const token = (await tokenFromClient()) ?? (await tokenFromRoute());
  if (!token) {
    return "";
  }
  cachedToken = { value: token, expiresAtMs: tokenExpiryMs(token) };
  return token;
}

async function tokenFromClient(): Promise<string | null> {
  const { data, error } = await authClient
    .token()
    .catch(() => ({ data: null, error: { message: "token fetch failed" } }));
  return error || !data?.token ? null : data.token;
}

async function tokenFromRoute(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) return null;
    const body = (await res.json()) as { token?: string };
    return body.token ?? null;
  } catch {
    return null;
  }
}
