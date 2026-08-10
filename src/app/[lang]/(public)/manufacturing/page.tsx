import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/i18n/dictionaries";
import { ManufacturingContent, type ManufacturingDict } from "@/components/manufacturing/ManufacturingContent";

export default async function ManufacturingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <ManufacturingContent dict={dict.manufacturing as ManufacturingDict} />;
}
