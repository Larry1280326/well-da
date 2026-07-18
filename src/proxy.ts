import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "zh"] as const;

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

  // Check if pathname already has a known locale
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  // Redirect to locale-prefixed URL
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Exclude static files, _next internals, and common public assets
    "/((?!_next|favicon\\.ico|logo\\.jpg|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff2?)).*)",
  ],
};
