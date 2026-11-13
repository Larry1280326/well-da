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
  plugins: [{ name: "isolated-email", setup(b) {
    b.onResolve({ filter: /^server-only$/ }, () => ({ path: "empty", namespace: "test" }));
    b.onResolve({ filter: /^@\/lib\/(db|email\/templates)$/ }, args => ({ path: args.path, namespace: "test" }));
    b.onResolve({ filter: /^@aws-sdk\/client-(ses|sns)$/ }, args => ({ path: args.path, namespace: "test" }));
    b.onLoad({ filter: /.*/, namespace: "test" }, args => ({ contents: ({
      empty: "",
      "@aws-sdk/client-ses": "export class SESClient { async send(cmd) { return globalThis.__alertSES.send(cmd.input); } } export class SendEmailCommand { constructor(input) { this.input = input; } }",
      "@aws-sdk/client-sns": "export class SNSClient { constructor(config) { this.config = config; } async send(cmd, options) { return globalThis.__alertSNS.send(cmd.input, this.config, options); } } export class PublishCommand { constructor(input) { this.input = input; } }",
      "@/lib/db": "export const query = async () => [];",
      "@/lib/email/templates": "export const confirmationEmailEn = () => ({subject:'test customer confirmation',html:'<p>test</p>'}); export const confirmationEmailZh = confirmationEmailEn;",
    })[args.path], loader: "js" }));
  } }],
});

const { sendInternalRfqNotification, sendConfirmationEmail } = require("../.test-build/internal-alert.cjs");
const keys = ["SNS_RFQ_TOPIC_ARN", "SES_REGION", "SES_ACCESS_KEY_ID", "SES_SECRET_ACCESS_KEY", "SES_SENDER_EMAIL"];
const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
const params = {
  rfqId: 42, reference: "RFQ-2026-000042", companyName: "Test & <Co>", projectName: "Panels",
  contactName: "Test Buyer", contactEmail: "buyer@example.invalid", submittedAt: "2026-11-13", fileCount: 2,
};
const topicArn = "arn:aws:sns:ap-southeast-1:347912233598:wellda-rfq-internal-alerts";
let snsMessages = [], sesMessages = [], snsResponse, snsError;

beforeEach(() => {
  snsMessages = []; sesMessages = []; snsResponse = { MessageId: "test-message-id" }; snsError = undefined;
  globalThis.__alertSES = { send: async input => { sesMessages.push(input); return {}; } };
  globalThis.__alertSNS = { send: async (input, config, options) => {
    snsMessages.push({ input, config, options });
    if (snsError) throw snsError;
    return snsResponse;
  } };
  Object.assign(process.env, {
    SNS_RFQ_TOPIC_ARN: topicArn,
    SES_REGION: "ap-southeast-1", SES_ACCESS_KEY_ID: "test", SES_SECRET_ACCESS_KEY: "test",
    SES_SENDER_EMAIL: "eng@wellda.com",
  });
});
after(() => {
  for (const k of keys) if (previous[k] === undefined) delete process.env[k]; else process.env[k] = previous[k];
});

test("staff notification publishes one minimal alert to the configured SNS topic", async () => {
  assert.equal((await sendInternalRfqNotification(params)).sent, true);
  assert.equal(snsMessages.length, 1);
  const { input, config, options } = snsMessages[0];
  assert.deepEqual(config, { region: "ap-southeast-1" });
  assert.equal(input.TopicArn, topicArn);
  assert.equal(input.Subject, "New website RFQ - RFQ-2026-000042");
  assert.match(input.Message, /Test & <Co>/);
  assert.match(input.Message, /Project: Panels/);
  assert.match(input.Message, /Drawing files: 2/);
  assert.match(input.Message, /https:\/\/www\.wellda\.com\/en\/administrator\/rfq\/42/);
  assert.doesNotMatch(input.Message, /buyer@example\.invalid|Test Buyer|attachment|notes:/i);
  assert.ok(options.abortSignal instanceof AbortSignal);
  assert.equal(sesMessages.length, 0);
});

test("customer-supplied line breaks cannot impersonate alert fields", async () => {
  const result = await sendInternalRfqNotification({ ...params, projectName: "Panels\nReference: fake" });
  assert.equal(result.sent, true);
  assert.match(snsMessages[0].input.Message, /Project: Panels Reference: fake/);
  assert.doesNotMatch(snsMessages[0].input.Message, /\nReference: fake/);
});

test("missing SNS configuration prevents publication without throwing", async () => {
  delete process.env.SNS_RFQ_TOPIC_ARN;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(snsMessages.length, 0);
});

test("malformed SNS topic is rejected before sending", async () => {
  process.env.SNS_RFQ_TOPIC_ARN = "not-an-arn";
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(snsMessages.length, 0);
});

test("SNS publish without MessageId is not counted as accepted", async () => {
  snsResponse = {};
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(snsMessages.length, 1);
});

test("SNS permission rejection does not throw into the RFQ handler", async () => {
  snsError = Object.assign(new Error("Access denied"), { name: "AuthorizationError" });
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(snsMessages.length, 1);
});

test("SNS network failure is handled", async () => {
  snsError = new Error("test network failure");
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
});

test("customer confirmation remains on SES and never uses SNS", async () => {
  const result = await sendConfirmationEmail({ ...params, to: "fkdowncharlotte@gmail.com", lang: "en" });
  assert.equal(result.sent, true);
  assert.equal(snsMessages.length, 0);
  assert.equal(sesMessages.length, 1);
  assert.deepEqual(sesMessages[0].Destination.ToAddresses, ["fkdowncharlotte@gmail.com"]);
  assert.equal(sesMessages[0].Source, "eng@wellda.com");
  assert.ok(sesMessages[0].Message.Body.Html);
});
