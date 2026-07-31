import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { RfqDetail } from "@/components/admin/RfqDetail";

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

  return <RfqDetail rfqId={id} role={session.role} lang={lang} />;
}
