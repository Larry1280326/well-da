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
    b.onResolve({ filter: /^@aws-sdk\/client-ses$/ }, () => ({ path: "ses", namespace: "test" }));
    b.onLoad({ filter: /.*/, namespace: "test" }, args => ({ contents: ({
      empty: "",
      ses: "export class SESClient { async send(cmd) { return globalThis.__alertSES.send(cmd.input); } } export class SendEmailCommand { constructor(input) { this.input = input; } }",
      "@/lib/db": "export const query = async () => [];",
      "@/lib/email/templates": "export const confirmationEmailEn = () => ({subject:'test customer confirmation',html:'<p>test</p>'}); export const confirmationEmailZh = confirmationEmailEn;",
    })[args.path], loader: "js" }));
  } }],
});
const { sendInternalRfqNotification, sendConfirmationEmail } = require("../.test-build/internal-alert.cjs");
const keys = ["M365_TENANT_ID", "M365_CLIENT_ID", "M365_CLIENT_SECRET", "SES_REGION", "SES_ACCESS_KEY_ID", "SES_SECRET_ACCESS_KEY", "SES_SENDER_EMAIL"];
const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
const originalFetch = globalThis.fetch;
const params = {
  rfqId: 42, reference: "RFQ-2026-000042", companyName: "Test & <Co>", projectName: "Panels",
  contactName: "Test Buyer", contactEmail: "buyer@example.invalid", submittedAt: "2026-11-13", fileCount: 2,
};
let requests = [], sesMessages = [], tokenStatus = 200, graphStatus = 202, missingToken = false, fetchError = false;

beforeEach(() => {
  requests = []; sesMessages = []; tokenStatus = 200; graphStatus = 202; missingToken = false; fetchError = false;
  globalThis.__alertSES = { send: async input => { sesMessages.push(input); return {}; } };
  Object.assign(process.env, {
    M365_TENANT_ID: "test-tenant-id", M365_CLIENT_ID: "test-client-id", M365_CLIENT_SECRET: "test-secret",
    SES_REGION: "ap-southeast-1", SES_ACCESS_KEY_ID: "test", SES_SECRET_ACCESS_KEY: "test",
    SES_SENDER_EMAIL: "eng@wellda.com",
  });
  globalThis.fetch = async (url, options) => {
    if (fetchError) throw new Error("test network failure");
    requests.push({ url: String(url), options });
    if (requests.length === 1) return {
      ok: tokenStatus === 200, status: tokenStatus,
      json: async () => missingToken ? {} : { access_token: "test-token" },
    };
    return { ok: graphStatus === 202, status: graphStatus };
  };
});
after(() => {
  globalThis.fetch = originalFetch;
  for (const k of keys) if (previous[k] === undefined) delete process.env[k]; else process.env[k] = previous[k];
});

test("staff notification uses M365 eng mailbox to notify only Henry, excluding attachments", async () => {
  assert.equal((await sendInternalRfqNotification(params)).sent, true);
  assert.equal(requests.length, 2);
  const auth = requests[0];
  assert.equal(auth.url, "https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/token");
  assert.equal(auth.options.method, "POST");
  const form = new URLSearchParams(auth.options.body);
  assert.equal(form.get("client_id"), "test-client-id");
  assert.equal(form.get("client_secret"), "test-secret");
  assert.equal(form.get("grant_type"), "client_credentials");
  assert.equal(form.get("scope"), "https://graph.microsoft.com/.default");

  const graph = requests[1];
  assert.equal(graph.url, "https://graph.microsoft.com/v1.0/users/eng%40wellda.com/sendMail");
  assert.equal(graph.options.headers.Authorization, "Bearer test-token");
  const payload = JSON.parse(graph.options.body);
  assert.deepEqual(payload.message.toRecipients, [{ emailAddress: { address: "henrychoi@wellda.com" } }]);
  assert.equal(payload.message.body.contentType, "Text");
  assert.match(payload.message.subject, /RFQ-2026-000042/);
  assert.match(payload.message.body.content, /buyer@example.invalid/);
  assert.match(payload.message.body.content, /Test & <Co>/);
  assert.match(payload.message.body.content, /\/en\/administrator\/rfq\/42/);
  assert.ok(!("attachments" in payload.message));
  assert.equal(payload.saveToSentItems, true);
  assert.equal(sesMessages.length, 0);
});

test("missing M365 configuration prevents internal email but not the RFQ", async () => {
  delete process.env.M365_CLIENT_SECRET;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(requests.length, 0);
});
test("token HTTP failure is not mistaken for delivery", async () => {
  tokenStatus = 401;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(requests.length, 1);
});
test("missing access token is a handled failure", async () => {
  missingToken = true;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(requests.length, 1);
});
test("Graph permission failure is not mistaken for delivery", async () => {
  graphStatus = 403;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
  assert.equal(requests.length, 2);
});
test("network failure is handled without throwing into the RFQ flow", async () => {
  fetchError = true;
  assert.equal((await sendInternalRfqNotification(params)).sent, false);
});
test("customer confirmation still uses AWS SES, not Microsoft Graph", async () => {
  const result = await sendConfirmationEmail({ ...params, to: "fkdowncharlotte@gmail.com", lang: "en" });
  assert.equal(result.sent, true);
  assert.equal(requests.length, 0);
  assert.equal(sesMessages.length, 1);
  assert.deepEqual(sesMessages[0].Destination.ToAddresses, ["fkdowncharlotte@gmail.com"]);
  assert.equal(sesMessages[0].Source, "eng@wellda.com");
  assert.ok(sesMessages[0].Message.Body.Html);
});