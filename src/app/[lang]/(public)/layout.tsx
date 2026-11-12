import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "@mantine/core/styles.css";
import { MantineProvider, mantineHtmlProps } from "@mantine/core";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { theme } from "@/theme/mantine-theme";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import {
  LocaleProvider,
  type Locale,
  type ClientDictionary,
} from "@/i18n/locale-context";
import "../../globals.css";
import { SITE_URL } from "@/config/site";

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: dict.metadata.title,
    description: dict.metadata.description,
    verification: {
      google: "xUXJ1A5EKDBurAe0XZt3G4ADIZew0xkWaMfaeQvdEN4",
      ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const clientDict: ClientDictionary = {
    topBar: dict.topBar,
    mainHeader: dict.mainHeader,
    mobileNav: dict.mobileNav,
    search: dict.search,
  };

  return (
    <html lang={lang === "zh" ? "zh-Hant" : "en"} {...mantineHtmlProps} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <LocaleProvider locale={lang as Locale} dict={clientDict}>
            <SiteHeader locale={lang as Locale} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "Organization",
              "@id": `${SITE_URL}/#organization`, name: "Well Da Factory Limited", url: SITE_URL,
              logo: `${SITE_URL}/logo.jpg`, email: "eng@wellda.com", telephone: "+85261515732",
            }).replace(/</g, "\\u003c") }} />
            <main>{children}</main>
          </LocaleProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
