import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { AboutContent } from "@/components/about/AboutContent";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo.home;
  return pageMetadata(lang, "", meta.title, meta.description);
}
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <AboutContent dict={dict.about} locale={lang} isHomepage homepage={dict.homepage} products={dict.productPages} />;
}
