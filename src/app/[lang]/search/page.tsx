import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { SearchContent } from "@/components/search/SearchContent";

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
