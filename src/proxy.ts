import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/config/site";

const locales = ["en", "zh"] as const;
const canonicalHost = new URL(SITE_URL).host;
const SESSION_COOKIE = "admin_session";

function getLocale(request: NextRequest): string {
  // 1. Check cookie first (user's explicit choice)
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (
    cookieLocale &&
    locales.includes(cookieLocale as (typeof locales)[number])
  ) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("zh")) return "zh";

  // 3. Default to English
  return "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHost = (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? ""
  )
    .split(",")[0]
    .trim()
    .replace(/:\d+$/, "");

  // Keep one public hostname so search engines do not index duplicate pages.
  if (requestHost === "wellda.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.host = canonicalHost;
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // ---- Admin route protection (optimistic cookie check, no DB) ----
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isAdminPageRoute = pathname.includes("/administrator");
  const hasSessionCookie = !!request.cookies.get(SESSION_COOKIE)?.value;

  if (isAdminApi && !hasSessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAdminPageRoute && !hasSessionCookie) {
    const locale = getLocale(request);
    // Only redirect if NOT already on the login page
    const isLoginPage =
      pathname === `/${locale}/administrator` ||
      pathname === `/${locale}/administrator/` ||
      pathname === `/administrator` ||
      pathname === `/administrator/`;
    if (!isLoginPage) {
      const loginUrl = new URL(`/${locale}/administrator`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if pathname already has a known locale
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  // API routes do not use locale prefixes — let them through as-is
  if (pathname.startsWith("/api/")) return;

  // Redirect to locale-prefixed URL
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Exclude static files, _next internals, and common public assets
    "/((?!_next|favicon\\.ico|logo\\.jpg|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff2?|pdf)).*)",
  ],
};
