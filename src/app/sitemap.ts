import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

const routes = [
  "",
  "/about",
  "/applications",
  "/manufacturing",
  "/quality",
  "/case-studies",
  "/quotation",
  "/faq",
] as const;

const locales = ["en", "zh"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => {
      const url = `${SITE_URL}/${locale}${route}`;
      const englishUrl = `${SITE_URL}/en${route}`;
      const chineseUrl = `${SITE_URL}/zh${route}`;

      return {
        url,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.8,
        alternates: {
          languages: {
            en: englishUrl,
            "zh-Hant": chineseUrl,
            "x-default": englishUrl,
          },
        },
      };
    }),
  );
}
