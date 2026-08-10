import { validateSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { AccountManager } from "@/components/admin/AccountManager";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";

export default async function AccountsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await validateSession();

  if (!session) {
    redirect(`/${lang}/administrator`);
  }

  // Only root can access account management
  if (session.role !== "root") {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return <AccountManager lang={lang} dict={dict.admin.accounts} />;
}
