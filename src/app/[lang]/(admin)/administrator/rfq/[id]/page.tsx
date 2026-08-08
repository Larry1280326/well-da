import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { RfqDetail } from "@/components/admin/RfqDetail";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const session = await validateSession();

  if (!session) {
    redirect(`/${lang}/administrator`);
  }

  const dict = await getDictionary(lang as Locale);

  return <RfqDetail rfqId={id} role={session.role} lang={lang} dict={dict.admin.rfqDetail} />;
}
