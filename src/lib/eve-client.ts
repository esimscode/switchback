import "server-only";

import { Client } from "eve/client";

// Server-to-server client for the eve runtime.
//
// Locally, withEve() mounts the eve routes on the Next.js dev origin.
// On Vercel, the app and the eve runtime deploy as one project, so the
// server calls its own deployment URL — authenticating with the project
// OIDC token (satisfies the eve channel's vercelOidc() policy) and the
// deployment-protection bypass header when the deployment is private.
export function createEveClient() {
  if (process.env.VERCEL) {
    return new Client({
      host: `https://${process.env.VERCEL_URL}`,
      auth: {
        vercelOidc: {
          token: async () => {
            const { getVercelOidcToken } = await import("@vercel/oidc");
            return getVercelOidcToken();
          },
        },
      },
      headers: (): Record<string, string> => {
        const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
        return bypass ? { "x-vercel-protection-bypass": bypass } : {};
      },
    });
  }

  const port = process.env.PORT ?? "3000";
  return new Client({ host: `http://127.0.0.1:${port}` });
}
