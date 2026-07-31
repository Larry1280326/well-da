import { validateSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";
import { Dashboard } from "@/components/admin/Dashboard";

export default async function AdministratorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await validateSession();

  if (!session) {
    return <LoginForm lang={lang} />;
  }

  return <Dashboard role={session.role} lang={lang} />;
}
