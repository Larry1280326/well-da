import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { AboutContent } from "@/components/about/AboutContent";
import { SITE_URL } from "@/config/site";

const homepageTitle =
  "Custom Sheet Metal Fabrication & Enclosures | Well Da Metal Factory";
const homepageDescription =
  "Custom sheet metal fabrication for kiosks, control boxes, intercom panels, cabinets and equipment enclosures. Prototypes and small-to-medium production runs.";

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await props.params;

  if (lang !== "en") return {};

  return {
    title: homepageTitle,
    description: homepageDescription,
    alternates: {
      canonical: `${SITE_URL}/en`,
      languages: {
        en: `${SITE_URL}/en`,
        "zh-Hant": `${SITE_URL}/zh`,
        "x-default": `${SITE_URL}/en`,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <AboutContent dict={dict.about} locale={lang} isHomepage />;
}
