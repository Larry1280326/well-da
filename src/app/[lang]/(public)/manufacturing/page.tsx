import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { ManufacturingContent, type ManufacturingDict } from "@/components/manufacturing/ManufacturingContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo["manufacturing"];
  return { ...pageMetadata(lang, "/manufacturing", meta.title, meta.description) };
}

export default async function ManufacturingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <ManufacturingContent dict={dict.manufacturing as ManufacturingDict} locale={lang} guide={dict.manufacturingGuide} products={dict.productPages} quoteLabel={dict.about.getQuote} />;
}
