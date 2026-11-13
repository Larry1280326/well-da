import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { FaqContent } from "@/components/faq/FaqContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo["faq"];
  return { ...pageMetadata(lang, "/faq", meta.title, meta.description) };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <FaqContent dict={dict.faq} />;
}
