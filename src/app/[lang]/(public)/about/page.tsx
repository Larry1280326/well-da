import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { AboutContent } from "@/components/about/AboutContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo["about"];
  return { ...pageMetadata(lang, "/about", meta.title, meta.description) };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <AboutContent dict={dict.about} locale={lang} />;
}
