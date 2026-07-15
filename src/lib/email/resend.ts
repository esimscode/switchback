// Minimal Resend sender over fetch (no SDK dependency). Provisioned via the
// Vercel Resend integration: RESEND_API_KEY + RESEND_EMAIL_DOMAIN. When the key
// is absent (self-host, or before DNS is ready) this no-ops so callers — like
// the reminder scan — keep working without email. Never throws.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  if (!apiKey || !domain) {
    console.warn("[email] RESEND not configured — skipping send.");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Switchback <notify@${domain}>`,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`[email] send failed (${res.status}):`, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send error:", error);
    return false;
  }
}
