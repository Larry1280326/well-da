import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
await build({
  entryPoints: ["src/lib/email.ts"],
  outfile: ".test-build/internal-alert.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  logLevel: "silent",
  plugins: [{ name: "isolated-ses", setup(b) {
    b.onResolve({ filter: /^server-only$/ }, () => ({ path: "empty", namespace: "test" }));
    b.onResolve({ filter: /^@\/lib\/(db|email\/templates)$/ }, args => ({ path: args.path, namespace: "test" }));
    b.onResolve({ filter: /^@aws-sdk\/client-ses$/ }, () => ({ path: "ses", namespace: "test" }));
    b.onLoad({ filter: /.*/, namespace: "test" }, args => ({ contents: ({
      empty: "",
      ses: "export class SESClient { async send(cmd) { return globalThis.__alertSES.send(cmd.input); } } export class SendEmailCommand { constructor(input) { this.input = input; } }",
      "@/lib/db": "export const query = async () => [];",
      "@/lib/email/templates": "export const confirmationEmailEn = () => ({subject:'test',html:'test'}); export const confirmationEmailZh = confirmationEmailEn;",
    })[args.path], loader: "js" }));
  } }],
});
const { sendInternalRfqNotification } = require("../.test-build/internal-alert.cjs");
const keys = ["SES_REGION","SES_ACCESS_KEY_ID","SES_SECRET_ACCESS_KEY","SES_SENDER_EMAIL","RFQ_NOTIFICATION_EMAIL"];
const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
const params = { rfqId: 42, reference: "RFQ-2026-000042", companyName: "Test & <Co>", projectName: "Panels",
  contactName: "Test Buyer", contactEmail: "buyer@example.invalid", submittedAt: "2026-11-13", fileCount: 2 };
let captured = [], shouldFail = false;
beforeEach(() => {
  captured = []; shouldFail = false;
  globalThis.__alertSES = { send: async input => { captured.push(input); if (shouldFail) throw new Error("test-failure"); return {}; } };
  Object.assign(process.env, {
    SES_REGION: "ap-southeast-1", SES_ACCESS_KEY_ID: "test", SES_SECRET_ACCESS_KEY: "test",
    SES_SENDER_EMAIL: "verified-sender@example.invalid", RFQ_NOTIFICATION_EMAIL: "staff@example.invalid",
  });
});
after(() => { for (const k of keys) if (previous[k] === undefined) delete process.env[k]; else process.env[k] = previous[k]; });
test("internal alert sends only to configured staff, with reference, contact and no drawing payload", async () => {
  assert.equal((await sendInternalRfqNotification(params)).sent, true);
  assert.equal(captured.length, 1);
  const m = captured[0];
  assert.deepEqual(m.Destination.ToAddresses, ["staff@example.invalid"]);
  assert.match(m.Message.Subject.Data, /RFQ-2026-000042/);
  assert.match(m.Message.Body.Text.Data, /buyer@example.invalid/);
  assert.match(m.Message.Body.Text.Data, /\/en\/administrator\/rfq\/42/);
  assert.ok(!("Attachments" in m));
});
test("without a configured recipient no staff mail is sent", async () => {
  delete process.env.RFQ_NOTIFICATION_EMAIL;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(captured.length, 0);
});
test("rejects accidental multiple recipients and malformed address", async () => {
  process.env.RFQ_NOTIFICATION_EMAIL = "staff@example.invalid,other@example.invalid";
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(captured.length, 0);
});
test("SES failure is returned as failure rather than throwing into the RFQ flow", async () => {
  shouldFail = true;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(captured.length, 1);
});
