import assert from "node:assert/strict";
import test from "node:test";

import type { DueItem } from "@/lib/reminders";

import { buildReminderDigest } from "./reminder-digest";

const BASE = "https://switchback.careers";

const reminderItem: DueItem = {
  userId: "u1",
  type: "reminder_due",
  title: "Ping the recruiter",
  href: "https://linkedin.test/post",
};
const followUpItem: DueItem = {
  userId: "u1",
  type: "followup_due",
  title: "Follow up: Cobalt Health — APM",
  href: "/applications",
};

test("subject is singular for one item, plural otherwise", () => {
  assert.equal(buildReminderDigest([reminderItem], BASE).subject, "1 Switchback nudge");
  assert.equal(
    buildReminderDigest([reminderItem, followUpItem], BASE).subject,
    "2 Switchback nudges",
  );
});

test("body lists titles, passes external links, and absolutizes internal ones", () => {
  const { html } = buildReminderDigest([reminderItem, followUpItem], BASE);
  assert.ok(html.includes("Ping the recruiter"));
  assert.ok(html.includes("Follow up: Cobalt Health — APM"));
  assert.ok(html.includes("https://linkedin.test/post"), "external link passes through");
  assert.ok(html.includes(`${BASE}/applications`), "internal href absolutized");
});

test("titles are HTML-escaped", () => {
  const { html } = buildReminderDigest(
    [{ userId: "u1", type: "reminder_due", title: "A <script> & \"quotes\"", href: null }],
    BASE,
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});
