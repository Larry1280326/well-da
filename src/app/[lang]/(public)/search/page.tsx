import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { SearchContent } from "@/components/search/SearchContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const meta = (await getDictionary(lang)).seo["search"];
  return { ...pageMetadata(lang, "/search", meta.title, meta.description), robots: { index: false, follow: true } };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { q } = await searchParams;
  return (
    <SearchContent
      dict={dict.search}
      locale={lang}
      initialQuery={q || ""}
    />
  );
}
