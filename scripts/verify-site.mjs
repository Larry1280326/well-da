import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Read-only HTTP checks against a running local build. Does not submit RFQs.
const origin = process.env.SITE_TEST_ORIGIN || "http://127.0.0.1:3000";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname)) throw new Error("Use a local test server only.");
const host = "https://www.wellda.com";
const slugs = ["custom-metal-enclosures-cabinets", "equipment-housings-machine-covers", "sheet-metal-panels-chassis"];
const routes = ["", "/about", "/applications", "/manufacturing", "/quality", "/case-studies", "/quotation", "/faq", ...slugs.map(s => `/applications/${s}`)];
const pages = new Map();
const titles = new Set(), descriptions = new Set();
const decode = s => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
function attrs(tag) { return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])])); }
function elements(html, tag) { return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "g"))].map(m => attrs(m[0])); }
async function get(path, options) { return fetch(origin + path, options); }
for (const lang of ["en", "zh"]) {
  for (const route of routes) {
    const path = `/${lang}${route}`;
    const res = await get(path); assert.equal(res.status, 200, path);
    const html = await res.text(); pages.set(path, html);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title, path);
    assert.ok(!titles.has(title), `duplicate title: ${path}`); titles.add(title);
    const metas = elements(html, "meta"), links = elements(html, "link");
    const description = metas.find(m => m.name === "description")?.content;
    assert.ok(description, path); assert.ok(!descriptions.has(description), `duplicate description ${path}`); descriptions.add(description);
    assert.equal(links.find(l => l.rel === "canonical")?.href, `${host}${path}`, path);
    for (const [hrefLang, code] of [["en", "en"], ["zh-Hant", "zh"], ["x-default", "en"]]) assert.ok(links.some(l => l.hrefLang === hrefLang && l.href === `${host}/${code}${route}`), `hreflang ${path} ${hrefLang}`);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `H1 ${path}`);
    assert.ok(!metas.some(m => m.name === "robots" && m.content?.includes("noindex")), path);
    assert.equal(metas.find(m => m.property === "og:url")?.content, `${host}${path}`);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.ok(schemas.some(s => s["@type"] === "Organization"), path);
    if (route.startsWith("/applications/")) {
      assert.ok(schemas.some(s => s["@type"] === "BreadcrumbList"), path);
      assert.ok(elements(html, "a").some(a => a.href?.startsWith(`/${lang}/quotation?source=`)), `RFQ ${path}`);
    }
    assert.ok(elements(html, "img").every(img => typeof img.alt === "string" && img.alt.length > 0), `image alt ${path}`);
  }
}
let linkCount = 0;
for (const [path, html] of pages) {
  for (const a of elements(html, "a")) {
    if (!a.href?.startsWith("/")) continue;
    const url = new URL(a.href, origin), target = pages.get(url.pathname);
    if (target) { if (url.hash) assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `broken anchor ${path} -> ${a.href}`); }
    else if (!url.pathname.includes("/search")) assert.equal((await get(url.pathname)).status, 200, `broken link ${path} -> ${a.href}`);
    linkCount++;
  }
}
for (const path of ["/en", "/zh"]) {
  for (const route of ["/about", "/applications", "/manufacturing", "/quality", "/case-studies", "/faq"]) assert.ok(elements(pages.get(path), "a").some(a => a.href === path + route), `crawlable navigation ${path}${route}`);
}
const sitemap = await (await get("/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) ?? []).length, routes.length * 2);
for (const path of pages.keys()) assert.ok(sitemap.includes(`<loc>${host}${path}</loc>`), path);
assert.ok(sitemap.includes('hreflang="zh-Hant"'));
const robots = await (await get("/robots.txt")).text(); assert.ok(robots.includes("Allow: /")); assert.ok(robots.includes(`${host}/sitemap.xml`));
for (const path of ["/en/search?q=panels", "/zh/search?q=面板", "/en/administrator"]) assert.match(await (await get(path)).text(), /name="robots" content="[^"]*noindex/);
for (const path of ["/en/missing-page", "/zh/applications/missing-product"]) assert.equal((await get(path)).status, 404);
assert.equal(new URL((await get("/manufacturing", { redirect: "manual" })).headers.get("location"), origin).href, `${origin}/en/manufacturing`);
assert.equal((await get("/en?source=test", { headers: { "x-forwarded-host": "wellda.com" }, redirect: "manual" })).headers.get("location"), `${host}/en?source=test`);
for (const lang of ["en", "zh"]) {
  const index = JSON.parse(readFileSync(`public/search-index-${lang}.json`, "utf8"));
  for (const slug of slugs) assert.ok(index.some(e => e.href === `/applications/${slug}`));
}
console.log(`PASS: ${pages.size} bilingual public pages; unique SEO metadata, canonical/hreflang/OG, H1, schemas, image alt, ${linkCount} internal links/anchors, sitemap, robots, noindex, 404, redirects and search indexes.`);
