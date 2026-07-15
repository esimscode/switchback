import type { DueItem } from "@/lib/reminders";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });

// Absolute link for a due item: external links pass through; internal hrefs
// (e.g. /applications) get the app base prepended.
function resolveHref(href: string | null, baseUrl: string): string | null {
  if (!href) return null;
  return href.startsWith("http") ? href : `${baseUrl}${href}`;
}

// One plain, on-brand digest for a user's newly-due items. Captions only, no
// marketing — this is a working nudge, not a campaign.
export function buildReminderDigest(
  items: DueItem[],
  baseUrl: string,
): { subject: string; html: string } {
  const subject =
    items.length === 1 ? "1 Switchback nudge" : `${items.length} Switchback nudges`;

  const rows = items
    .map((item) => {
      const href = resolveHref(item.href, baseUrl);
      const link = href
        ? ` &nbsp;<a href="${escapeHtml(href)}" style="color:#3f6212;">open</a>`
        : "";
      return `<li style="margin:0 0 10px 0;">${escapeHtml(item.title)}${link}</li>`;
    })
    .join("");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#111;">
    <p style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#666;">Switchback</p>
    <h1 style="font-size:20px;margin:0 0 4px 0;">On deck today</h1>
    <p style="color:#555;margin:0 0 18px 0;">Reminders and follow-ups that are due.</p>
    <ul style="padding-left:18px;margin:0 0 20px 0;font-size:15px;">${rows}</ul>
    <p style="font-size:13px;color:#888;">
      <a href="${escapeHtml(baseUrl)}/reminders" style="color:#3f6212;">Manage in Switchback</a>
      &nbsp;·&nbsp; You get this only when something is due — no spam.
    </p>
  </div>`;

  return { subject, html };
}
