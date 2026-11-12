import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export function pageMetadata(lang: string, path: string, title: string, description: string, image = "/images/case-study-electrical-panel.jpg"): Metadata {
  const url = `${SITE_URL}/${lang}${path}`;
  return {
    title, description,
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en${path}`, "zh-Hant": `${SITE_URL}/zh${path}`, "x-default": `${SITE_URL}/en${path}` },
    },
    openGraph: {
      type: "website", siteName: "Well Da Factory Limited", title, description, url,
      locale: lang === "zh" ? "zh_HK" : "en_US",
      alternateLocale: lang === "zh" ? "en_US" : "zh_HK",
      images: [{ url: `${SITE_URL}${image}`, alt: title }],
    },
  };
}
