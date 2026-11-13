import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { QualityContent } from "@/components/quality/QualityContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo["quality"];
  return { ...pageMetadata(lang, "/quality", meta.title, meta.description) };
}

export default async function QualityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <QualityContent dict={dict.quality} />;
}
