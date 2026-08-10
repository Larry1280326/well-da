import { validateSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";
import type { SessionUser } from "@/lib/auth/types";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";

export default async function AdministratorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await validateSession();

  // Not authenticated — render children directly (the login form)
  if (!session) {
    return <>{children}</>;
  }

  // Authenticated — the AdminShell ALWAYS renders the full AppShell
  const user: SessionUser = {
    userId: session.userId,
    username: session.username,
    role: session.role,
    displayName: session.displayName,
  };

  const dict = await getDictionary(lang as Locale);

  return (
    <AdminShell lang={lang} user={user} dict={dict.admin.shell}>
      {children}
    </AdminShell>
  );
}
