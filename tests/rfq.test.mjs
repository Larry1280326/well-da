import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

import { load } from "./bundle.mjs";
const require = createRequire(import.meta.url);
const { POST } = await load("src/app/api/rfq/route.ts", "route", true);
const { validateRfqInput } = await load("src/lib/validation.ts", "validation");
const { parseQuantity, sourcePage } = await load("src/lib/rfq-source.ts", "source");
const { trackRfqSuccess } = await load("src/lib/rfq-measurement.ts", "measurement");
const { refreshRfqFileUrl } = await load("src/lib/s3.ts", "storage");
const { NextRequest } = require("next/server");
let queries, uploads, deleted, emails, released, failQuery, failUpload, failConnect, failEmail;
beforeEach(() => {
  queries = []; uploads = []; deleted = []; emails = []; released = false;
  failQuery = failUpload = failConnect = failEmail = false;
  globalThis.__rfqTest = {
    getClient: async () => {
      if (failConnect) throw new Error("isolated connection failure");
      return { query: async (sql, values) => {
        queries.push({ sql, values });
        if (failQuery && sql.includes("INSERT INTO rfq_files")) throw new Error("isolated transaction failure");
        return { rows: [{ id: 42 }] };
      }, release: () => { released = true; } };
    },
    uploadFile: async (buffer, fileName, contentType) => {
      if (failUpload && uploads.length === 1) throw new Error("isolated upload failure");
      uploads.push({ buffer, fileName, contentType });
      return { key: fileName, url: `https://test.invalid/${fileName}` };
    },
    deleteFile: async key => { deleted.push(key); },
    sendConfirmationEmail: async params => {
      assert.ok(queries.some(q => q.sql === "COMMIT"), "email must follow commit");
      emails.push(params);
      if (failEmail) throw new Error("isolated mail failure");
      return { sent: true };
    },
  };
  delete globalThis.window;
});
const valid = {
  company_name: "Test OEM", contact_name: "Local test", email: "buyer@example.invalid", country_region: "Hong Kong",
  project_name: "Isolated RFQ", drawing_avail: "Production drawing available", material: "Mild Steel", production_quantity: "1,000",
  delivery_region: "Hong Kong", privacy_accepted: "on", material_grade: "Drawing specified", thickness: "1.5", thickness_unit: "mm",
  surface_finish: "Other", surface_finish_other: "Per drawing", special_req_notes: "Keep this technical requirement.",
  printing_marking: '["Silk Screen","INVALID"]', product_type: '["Enclosure"]', lang: "en",
  source_page: "/en/applications/custom-metal-enclosures-cabinets?email=private#drawing",
};
const fileInfo = name => ({ fileName: name, size: 10, contentType: "application/octet-stream" });
let ip = 0;
function request(fields = {}, names = ["drawing.pdf", "part.step"]) {
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...valid, ...fields })) data.set(k, v);
  for (const name of names) data.append("files", new File([`test bytes ${name}`], name));
  return new NextRequest("http://localhost/api/rfq", { method: "POST", headers: { "x-forwarded-for": `test-${++ip}` }, body: data });
}

test("successful multipart submission persists all files, quantities, requirements and sanitized source", async () => {
  const res = await POST(request()); const body = await res.json();
  assert.equal(res.status, 201); assert.equal(body.persisted, true); assert.match(body.reference, /^RFQ-\d{4}-000042$/);
  assert.deepEqual(uploads.map(f => [f.fileName, f.buffer.toString()]), [["drawing.pdf", "test bytes drawing.pdf"], ["part.step", "test bytes part.step"]]);
  assert.equal(queries.filter(q => q.sql.includes("INSERT INTO rfq_files")).length, 2);
  assert.equal(queries.find(q => q.sql.includes("INSERT INTO quantity")).values[1], 1000);
  const material = queries.find(q => q.sql.includes("INSERT INTO material_n_manu_req")).values;
  assert.equal(material[4], "Per drawing"); assert.deepEqual(material[9], ["Silk Screen"]);
  const technical = queries.find(q => q.sql.includes("INSERT INTO additional_technical_requirements")).values[5];
  assert.match(technical, /Keep this technical requirement/); assert.match(technical, /\[Website source page\] \/en\/applications\/custom-metal-enclosures-cabinets$/);
  assert.ok(!technical.includes("private")); assert.equal(emails.length, 1); assert.equal(released, true);
});
test("DB connection failure cleans every pre-uploaded file", async () => {
  failConnect = true; const res = await POST(request());
  assert.equal(res.status, 500); assert.deepEqual(deleted, ["drawing.pdf", "part.step"]); assert.equal(emails.length, 0);
});
test("second upload failure cleans first file without writing to DB", async () => {
  failUpload = true; assert.equal((await POST(request())).status, 500);
  assert.deepEqual(deleted, ["drawing.pdf"]); assert.equal(queries.length, 0);
});
test("failed file record rolls back transaction and deletes attachments", async () => {
  failQuery = true; assert.equal((await POST(request())).status, 500);
  assert.ok(queries.some(q => q.sql === "ROLLBACK")); assert.ok(!queries.some(q => q.sql === "COMMIT"));
  assert.equal(deleted.length, 2); assert.equal(emails.length, 0); assert.equal(released, true);
});
test("email failure after commit preserves RFQ and attachments", async () => {
  failEmail = true; const res = await POST(request()); const body = await res.json();
  assert.equal(res.status, 201); assert.equal(body.persisted, true); assert.equal(body.data.emailSent, false);
  assert.equal(deleted.length, 0); assert.ok(!queries.some(q => q.sql === "ROLLBACK"));
});
test("honeypot does not persist or return a conversion-eligible response", async () => {
  const body = await (await POST(request({ website: "bot" }))).json();
  assert.equal(body.persisted, false); assert.equal(queries.length, 0); assert.equal(uploads.length, 0);
});
test("missing required data and unsupported attachments return 400 without side effects", async () => {
  const res = await POST(request({ company_name: "", email: "invalid" }, ["bad.exe"]));
  assert.equal(res.status, 400); const body = await res.json();
  assert.ok(body.errors.company_name); assert.ok(body.errors.email); assert.ok(body.errors.files);
  assert.equal(uploads.length, 0); assert.equal(queries.length, 0);
});
test("invalid multipart and non-file file entries return 400", async () => {
  assert.equal((await POST(new NextRequest("http://localhost/api/rfq", { method: "POST", headers: { "x-forwarded-for": `test-${++ip}` }, body: "invalid" }))).status, 400);
  const data = new FormData(); data.append("files", "bad");
  assert.equal((await POST(new NextRequest("http://localhost/api/rfq", { method: "POST", headers: { "x-forwarded-for": `test-${++ip}` }, body: data }))).status, 400);
});
test("rate limit returns 429 on fourth request", async () => {
  const key = `rate-${++ip}`;
  for (let i = 0; i < 4; i++) {
    const req = request({ website: "bot" }); req.headers.set("x-forwarded-for", key);
    assert.equal((await POST(req)).status, i === 3 ? 429 : 201);
  }
});
test("attachment formats, count, per-file, total and empty limits", () => {
  for (const name of ["a.PDF", "a.dxf", "a.dwg", "a.step", "a.stp", "a.igs", "a.iges", "a.jpg", "a.jpeg", "a.png", "a.xlsx", "a.zip"]) assert.equal(validateRfqInput(valid, [fileInfo(name)]).ok, true, name);
  for (const files of [[], [fileInfo("a.exe")], [{ ...fileInfo("a.pdf"), size: 0 }], [{ ...fileInfo("a.pdf"), size: 50 * 1024 * 1024 + 1 }], Array.from({ length: 11 }, () => fileInfo("a.pdf")), Array.from({ length: 3 }, () => ({ ...fileInfo("a.pdf"), size: 40 * 1024 * 1024 }))]) assert.equal(validateRfqInput(valid, files).ok, false);
  assert.equal(validateRfqInput({ ...valid, additional_options: '["NO_DRAWING"]' }, []).ok, true);
  assert.equal(validateRfqInput({ ...valid, privacy_accepted: "false" }, [fileInfo("a.pdf")]).ok, false);
});
test("quantities reject truncated, fractional, infinite and out of range values", () => {
  assert.equal(parseQuantity("1,000"), 1000); assert.equal(parseQuantity("12000"), 12000);
  for (const raw of ["1,23", "2.5", "2abc", "1e3", "-1", "0", "2147483648", "Infinity"]) {
    assert.equal(parseQuantity(raw), null, raw);
    assert.equal(validateRfqInput({ ...valid, production_quantity: raw }, [fileInfo("a.pdf")]).ok, false);
  }
});
test("source allowlist rejects external, admin and private paths", () => {
  assert.equal(sourcePage("/zh/manufacturing?email=private#drawings"), "/zh/manufacturing");
  for (const raw of ["https://evil.invalid/en", "//evil.invalid/en", "/en/administrator", "/en/customer-name", "/en/../api", null]) assert.equal(sourcePage(raw), null);
});
test("measurement requires explicit consent and sends only safe paths after success", () => {
  const events = [];
  globalThis.window = { gtag: (...args) => events.push(args), location: { origin: "https://www.wellda.com" } };
  trackRfqSuccess("/en/manufacturing", "en"); assert.equal(events.length, 0);
  window.wellDaAnalyticsConsent = false; trackRfqSuccess("/en/manufacturing", "en"); assert.equal(events.length, 0);
  window.wellDaAnalyticsConsent = true; trackRfqSuccess("/en/manufacturing?email=private", "en");
  assert.equal(events.length, 1); assert.equal(events[0][1], "generate_lead");
  assert.deepEqual(Object.keys(events[0][2]).sort(), ["language", "page_location", "page_referrer", "source_page"]);
  assert.equal(events[0][2].source_page, "/en/manufacturing"); assert.ok(!JSON.stringify(events).includes("private"));
});

test("attachment links are re-signed offline only for the configured RFQ bucket", async () => {
  const keys = ["S3_BUCKET_NAME", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    Object.assign(process.env, { S3_BUCKET_NAME: "rfq-local-test", S3_REGION: "ap-southeast-1", S3_ACCESS_KEY_ID: "local-test-only", S3_SECRET_ACCESS_KEY: "local-test-only" });
    const refreshed = new URL(await refreshRfqFileUrl("https://rfq-local-test.s3.ap-southeast-1.amazonaws.com/rfq-uploads/old/drawing.pdf?X-Amz-Date=20000101T000000Z"));
    assert.equal(refreshed.pathname, "/rfq-uploads/old/drawing.pdf");
    assert.notEqual(refreshed.searchParams.get("X-Amz-Date"), "20000101T000000Z");
    for (const url of ["https://other.invalid/rfq-uploads/a.pdf", "https://rfq-local-test.s3.ap-southeast-1.amazonaws.com/other/a.pdf", "invalid legacy URL"]) assert.equal(await refreshRfqFileUrl(url), url);
  } finally {
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});
