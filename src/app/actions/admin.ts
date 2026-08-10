"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { queryOne } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie, deleteSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";

export async function login(
  prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString() ?? "";
  const lang = formData.get("lang")?.toString() ?? "en";
  const dict = await getDictionary(lang as Locale);

  if (!username || !password) {
    return { error: dict.admin.login.errors.required };
  }

  // Rate limit: 5 attempts per 15 minutes per IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: dict.admin.login.errors.tooManyAttempts };
  }

  const user = await queryOne<{
    id: number;
    username: string;
    password_hash: string;
    role: string;
    display_name: string | null;
    created_by: number | null;
    created_at: string;
    last_login_at: string | null;
    is_active: boolean;
  }>(
    `SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) AND is_active = TRUE`,
    [username],
  );

  if (!user) {
    return { error: dict.admin.login.errors.invalidCredentials };
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    return { error: dict.admin.login.errors.invalidCredentials };
  }

  const token = await createSession(
    {
      id: user.id,
      username: user.username,
      password_hash: user.password_hash,
      role: user.role as "root" | "owner" | "engineer",
      display_name: user.display_name,
      created_by: user.created_by,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      is_active: user.is_active,
    },
    ip,
  );
  await setSessionCookie(token);

  redirect(`/${lang}/administrator`);
}

export async function logout() {
  await deleteSession();
  redirect("/en/administrator");
}
