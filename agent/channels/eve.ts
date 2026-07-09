import { createRemoteJWKSet, jwtVerify } from "jose";

import {
  extractBearerToken,
  localDev,
  vercelOidc,
  type AuthFn,
} from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// The eve runtime is a separate service from the Next.js app, so it can't
// read the app's session cookie. Browser callers authenticate with a
// short-lived Neon Auth JWT instead (see getEveToken in src/lib/auth/client),
// verified here against the project JWKS. EdDSA-signed, 15-minute expiry.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

// Signature alone proves the token came from this project's Neon Auth, not
// that the caller belongs here: sign-up against the auth service is open
// until it's disabled in the Neon config. AUTH_ALLOWED_EMAILS (comma-
// separated) pins the workspace to its owner; unset means allow any account.
function isAllowedEmail(email: string | null): boolean {
  const allowed = process.env.AUTH_ALLOWED_EMAILS;
  if (!allowed) return true;
  if (!email) return false;
  return allowed
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(email.trim().toLowerCase());
}

function neonAuthJwt(): AuthFn<Request> {
  return async (request) => {
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    if (!baseUrl) return null;

    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) return null;

    try {
      jwks ??= createRemoteJWKSet(
        new URL(`${baseUrl}/.well-known/jwks.json`),
      );
      const origin = new URL(baseUrl).origin;
      const { payload } = await jwtVerify(token, jwks, {
        issuer: origin,
        audience: origin,
      });
      if (!payload.sub) return null;

      const email = typeof payload.email === "string" ? payload.email : null;
      if (!isAllowedEmail(email)) return null;

      const attributes: Record<string, string> = {};
      if (email) attributes.email = email;
      if (typeof payload.name === "string") attributes.name = payload.name;

      return {
        authenticator: "neon-auth",
        principalId: payload.sub,
        principalType: "user",
        attributes,
      };
    } catch {
      // Invalid or expired token: skip so the walk can end in a clean 401.
      return null;
    }
  };
}

// vercelOidc() covers the app's server-to-runtime calls (src/lib/eve-client);
// localDev() covers local development traffic.
export default eveChannel({
  auth: [neonAuthJwt(), vercelOidc(), localDev()],
});
