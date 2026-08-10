import { validateSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";
import { Dashboard } from "@/components/admin/Dashboard";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";

export default async function AdministratorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await validateSession();
  const dict = await getDictionary(lang as Locale);

  if (!session) {
    return <LoginForm lang={lang} dict={dict.admin.login} />;
  }

  return <Dashboard role={session.role} lang={lang} dict={dict.admin.dashboard} />;
}
