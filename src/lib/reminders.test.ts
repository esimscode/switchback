import assert from "node:assert/strict";
import test from "node:test";

import {
  dueFollowUps,
  dueReminders,
  followUpDueItem,
  reminderDueItem,
} from "./reminders";

const NOW = new Date("2026-07-15T14:00:00Z");
const past = new Date("2026-07-15T09:00:00Z");
const future = new Date("2026-07-20T09:00:00Z");

const reminder = (over: Partial<Parameters<typeof reminderDueItem>[0]> = {}) => ({
  id: "r1",
  userId: "u1",
  text: "Check the post",
  dueDate: past,
  link: null,
  status: "PENDING",
  notifiedAt: null,
  ...over,
});

const application = (over: Partial<Parameters<typeof followUpDueItem>[0]> = {}) => ({
  id: "a1",
  userId: "u1",
  company: "Cobalt Health",
  roleTitle: "APM",
  status: "APPLIED",
  followUpDate: past,
  followUpNotifiedAt: null,
  ...over,
});

test("dueReminders includes a pending, past-due, un-notified reminder", () => {
  assert.equal(dueReminders([reminder()], NOW).length, 1);
});

test("dueReminders excludes future, already-notified, and non-pending reminders", () => {
  assert.equal(dueReminders([reminder({ dueDate: future })], NOW).length, 0);
  assert.equal(dueReminders([reminder({ notifiedAt: past })], NOW).length, 0, "already notified");
  assert.equal(dueReminders([reminder({ status: "DONE" })], NOW).length, 0);
  assert.equal(dueReminders([reminder({ status: "CANCELLED" })], NOW).length, 0);
});

test("dueFollowUps includes an active application with a past due, un-notified follow-up", () => {
  assert.equal(dueFollowUps([application()], NOW).length, 1);
});

test("dueFollowUps excludes future, notified, closed, and null-date follow-ups", () => {
  assert.equal(dueFollowUps([application({ followUpDate: future })], NOW).length, 0);
  assert.equal(dueFollowUps([application({ followUpNotifiedAt: past })], NOW).length, 0, "already notified");
  assert.equal(dueFollowUps([application({ status: "REJECTED" })], NOW).length, 0, "closed");
  assert.equal(dueFollowUps([application({ followUpDate: null })], NOW).length, 0);
});

test("due-item builders produce the right notification payloads", () => {
  assert.deepEqual(reminderDueItem(reminder({ link: "https://x.test" })), {
    userId: "u1",
    type: "reminder_due",
    title: "Check the post",
    href: "https://x.test",
  });
  assert.deepEqual(followUpDueItem(application()), {
    userId: "u1",
    type: "followup_due",
    title: "Follow up: Cobalt Health — APM",
    href: "/applications",
  });
});
