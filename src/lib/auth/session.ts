import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { query, queryOne, getClient } from "@/lib/db";
import type { AdminUser, SessionUser, AdminRole } from "@/lib/auth/types";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(48).toString("base64url");
}

/**
 * Create a session record in the database and update last_login_at.
 * Returns the raw session token (to be set as a cookie).
 */
export async function createSession(
  user: AdminUser,
  ipAddress?: string,
  userAgent?: string,
): Promise<string> {
  const token = generateToken();
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const client = await getClient();
  try {
    await client.query(
      `INSERT INTO admin_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, hash, expiresAt, ipAddress || null, userAgent || null],
    );
    await client.query(
      `UPDATE admin_users SET last_login_at = NOW() WHERE id = $1`,
      [user.id],
    );
  } finally {
    client.release();
  }

  return token;
}

/**
 * Set the HTTP-only session cookie.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Validate the current session by checking the cookie against the database.
 * Returns SessionUser if valid, null otherwise.
 * Also checks is_active — deactivated users are immediately invalidated.
 */
export async function validateSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const hash = hashToken(token);

  const row = await queryOne<{
    user_id: number;
    username: string;
    role: AdminRole;
    display_name: string | null;
  }>(
    `SELECT u.id AS user_id, u.username, u.role, u.display_name
     FROM admin_sessions s
     JOIN admin_users u ON s.user_id = u.id
     WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active = TRUE`,
    [hash],
  );

  if (!row) return null;

  return {
    userId: row.user_id,
    username: row.username,
    role: row.role,
    displayName: row.display_name,
  };
}

/**
 * Delete the current session from the database and clear the cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const hash = hashToken(token);
    await query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [hash]);
  }
  await clearSessionCookie();
}
