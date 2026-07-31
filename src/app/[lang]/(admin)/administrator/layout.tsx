import { validateSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";
import type { SessionUser } from "@/lib/auth/types";

export default async function AdministratorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await validateSession();

  // Convert to a plain object that can be passed to a client component
  const initialUser: SessionUser | null = session
    ? {
        userId: session.userId,
        username: session.username,
        role: session.role,
        displayName: session.displayName,
      }
    : null;

  return (
    <AdminShell lang={lang} initialUser={initialUser}>
      {children}
    </AdminShell>
  );
}
