import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { ApplicationsContent } from "@/components/applications/ApplicationsContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo["applications"];
  return { ...pageMetadata(lang, "/applications", meta.title, meta.description) };
}

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <ApplicationsContent dict={dict.applications} locale={lang} products={dict.productPages} />;
}
