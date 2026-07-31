import { validateSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { AccountManager } from "@/components/admin/AccountManager";

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

  return <AccountManager />;
}
