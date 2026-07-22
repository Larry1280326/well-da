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
import "../globals.css";
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
    <html lang={lang} {...mantineHtmlProps} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <LocaleProvider locale={lang as Locale} dict={clientDict}>
            <SiteHeader locale={lang as Locale} />
            <main>{children}</main>
          </LocaleProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
