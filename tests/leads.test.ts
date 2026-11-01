import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";
import { createLeadHandler, createRateLimiter } from "../src/lib/leads";
import { sendLead } from "../src/lib/mail";

const env = { SITE_URL: "https://volta.example", LEADS_ENABLED: "true", LEGAL_APPROVED: "true", LEGAL_OPERATOR: "Тестовый оператор", LEGAL_INN: "123456789012", LEGAL_ADDRESS: "Москва", PRIVACY_EMAIL: "privacy@volta.example", LEGAL_RETENTION: "30 дней" };
const valid = { name: "Анна", phone: "+7 (999) 123-45-67", consent: true, direction: "baby", website: "" };
function request(body: unknown = valid, origin = env.SITE_URL) {
  return new Request(`${env.SITE_URL}/api/leads`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
}
test("accepted SMTP delivery returns success", async () => {
  let called = false;
  const handler = createLeadHandler({ env, send: async lead => { called = true; assert.equal(lead.name, "Анна"); return true; } });
  assert.equal((await handler(request())).status, 200);
  assert.equal(called, true);
});
test("invalid consent, phone, direction and spam never call SMTP", async () => {
  const handler = createLeadHandler({ env, send: async () => { assert.fail("must not send"); } });
  for (const data of [{ ...valid, consent: false }, { ...valid, phone: "123" }, { ...valid, direction: "unknown" }, { ...valid, website: "spam" }]) assert.equal((await handler(request(data))).status, 400);
});
test("origin and body size are enforced", async () => {
  const handler = createLeadHandler({ env, send: async () => true });
  assert.equal((await handler(request(valid, "https://other.example"))).status, 403);
  assert.equal((await handler(request({ ...valid, name: "x".repeat(5000) }))).status, 413);
});
test("rate limit includes Retry-After and expires", async () => {
  let now = 0;
  const handler = createLeadHandler({ env, send: async () => true, limit: createRateLimiter(() => now) });
  for (let i = 0; i < 5; i++) assert.equal((await handler(request())).status, 200);
  const limited = await handler(request());
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "900");
  now = 900001;
  assert.equal((await handler(request())).status, 200);
});
test("SMTP failure or rejection never reports success", async () => {
  for (const send of [async () => false, async () => { throw new Error("SMTP failure"); }]) {
    assert.equal((await createLeadHandler({ env, send })(request())).status, 503);
  }
});
test("missing configuration and disabled/legal gates prevent sending", async () => {
  assert.equal(await sendLead({ ...valid, consent: true }, {}), false);
  for (const overrides of [{ LEADS_ENABLED: "false" }, { LEGAL_APPROVED: "false" }, { SITE_URL: "" }, { LEGAL_OPERATOR: "" }, { LEGAL_INN: "" }, { LEGAL_ADDRESS: "" }, { PRIVACY_EMAIL: "" }, { LEGAL_RETENTION: "" }]) {
    const handler = createLeadHandler({ env: { ...env, ...overrides }, send: async () => { assert.fail("must not send"); } });
    assert.equal((await handler(request())).status, 503);
  }
});

test("SMTP envelope stays fixed and requires the configured recipient to be accepted", async t => {
  const smtpEnv = { SMTP_HOST: "smtp.volta.example", SMTP_PORT: "465", SMTP_SECURE: "true", SMTP_USER: "user", SMTP_PASS: "password", MAIL_FROM: "form@volta.example", LEADS_EMAIL: "school@volta.example" };
  let accepted: string[] = [smtpEnv.LEADS_EMAIL];
  let sent: Record<string, unknown> | undefined;
  let closed = 0;
  const create = t.mock.method(nodemailer, "createTransport", () => ({
    sendMail: async (message: Record<string, unknown>) => { sent = message; return { accepted }; },
    close: () => { closed++; },
  }));
  const lead = { name: "Анна <attacker@example.com>", phone: "+79991234567", direction: "baby", consent: true as const };
  assert.equal(await sendLead(lead, smtpEnv), true);
  assert.equal(sent?.from, smtpEnv.MAIL_FROM);
  assert.equal(sent?.to, smtpEnv.LEADS_EMAIL);
  assert.equal(sent?.subject, "VOLTA — заявка на пробное занятие");
  assert.equal(sent?.replyTo, undefined);
  assert.equal(sent?.disableFileAccess, true);
  assert.equal(sent?.disableUrlAccess, true);
  assert.match(String(sent?.text), /Анна/);
  accepted = [];
  assert.equal(await sendLead(lead, smtpEnv), false);
  accepted = ["other@example.com"];
  assert.equal(await sendLead(lead, smtpEnv), false);
  assert.equal(closed, 3);
  const calls = create.mock.callCount();
  assert.equal(await sendLead(lead, {}), false);
  assert.equal(await sendLead(lead, { ...smtpEnv, MAIL_FROM: "form@volta.example\r\nBcc: other@example.com" }), false);
  assert.equal(create.mock.callCount(), calls);
});

test("frontend name and phone length limits are enforced on the server", async () => {
  const handler = createLeadHandler({ env, send: async () => { assert.fail("must not send"); } });
  for (const data of [{ ...valid, name: "Я".repeat(81) }, { ...valid, phone: "+7         (999) 123-45-67 " }, { ...valid, phone: "+7999\n1234567" }]) {
    assert.equal((await handler(request(data))).status, 400);
  }
});
