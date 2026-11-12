import { productSlugs } from "@/config/products";

const routes = ["", "/about", "/applications", "/manufacturing", "/quality", "/case-studies", "/faq", "/quotation", "/search", ...productSlugs.map(s => `/applications/${s}`)];
// Only known public paths are stored. Queries, hashes and arbitrary URLs can contain private data.
export function sourcePage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.split(/[?#]/)[0].replace(/\/$/, "");
  return ["en", "zh"].some(lang => routes.some(route => path === `/${lang}${route}`)) ? path : null;
}

export function parseQuantity(raw: string): number | null {
  const value = raw.trim();
  if (!/^(?:[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)$/.test(value)) return null;
  const n = Number(value.replace(/,/g, ""));
  return Number.isInteger(n) && n <= 2147483647 ? n : null;
}
