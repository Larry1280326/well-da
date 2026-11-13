import { createServer, request as httpRequest } from "node:http";
import { createRequire } from "node:module";
import { load } from "./bundle.mjs";
import { writeFileSync } from "node:fs";

// LOCAL TEST ONLY: production handler + simulated service boundaries, never AWS/RDS/SES.
const { POST } = await load("src/app/api/rfq/route.ts", "preview-route", true);
const { NextRequest } = createRequire(import.meta.url)("next/server");
writeFileSync(".test-build/local-drawing.pdf", "%PDF-1.4\n% LOCAL RFQ TEST ONLY — synthetic attachment\n%%EOF\n");
writeFileSync(".test-build/local-part.step", "ISO-10303-21;\nHEADER;\n/* LOCAL RFQ TEST ONLY */\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;");
const state = { queries: [], files: [], emails: 0 };
globalThis.__rfqTest = {
  getClient: async () => ({ query: async (sql, values) => { state.queries.push({ sql, values }); return { rows: [{ id: 42 }] }; }, release() {} }),
  uploadFile: async (bytes, name) => { state.files.push({ name, size: bytes.length, content: bytes.toString() }); return { key: name, url: `https://example.invalid/${name}` }; },
  deleteFile: async () => {},
  sendConfirmationEmail: async () => { state.emails++; return { sent: false, error: "LOCAL TEST: no email is sent." }; },
};
createServer(async (req, res) => {
  try {
    if (req.url === "/__test/state") { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(state)); return; }
    if (req.url === "/api/rfq" && req.method === "POST") {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const response = await POST(new NextRequest("http://127.0.0.1:3001/api/rfq", { method: "POST", headers: req.headers, body: Buffer.concat(chunks) }));
      res.writeHead(response.status, { "Content-Type": "application/json", "X-WellDa-Test": "simulated-services" }); res.end(await response.text()); return;
    }
    if (req.url.startsWith("/api/")) { res.writeHead(404); res.end("Not available in RFQ test preview."); return; }
    // Only public UI and static assets are proxied to the local production build.
    if (req.url.includes("/administrator")) { res.writeHead(404); res.end(); return; }
    const upstream = httpRequest({ hostname: "127.0.0.1", port: 3000, path: req.url, method: req.method, headers: { ...req.headers, host: "127.0.0.1:3000" } }, incoming => {
      res.writeHead(incoming.statusCode, incoming.headers); incoming.pipe(res);
    });
    upstream.on("error", () => { res.writeHead(502); res.end("Start the local app on port 3000 first."); }); req.pipe(upstream);
  } catch { res.writeHead(500); res.end("Local RFQ test failed."); }
}).listen(3001, "127.0.0.1", () => console.log("LOCAL TEST ONLY http://127.0.0.1:3001 — DB/S3/email are simulated; no mail is sent."));
