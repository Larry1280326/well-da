import { type NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // Rate limit: max 5 login attempts per 15 minutes per IP
    if (!checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const username = (body.username ?? "").trim();
    const password = (body.password ?? "") as string;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 },
      );
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
      `SELECT * FROM admin_users
       WHERE LOWER(username) = LOWER($1) AND is_active = TRUE`,
      [username],
    );

    // Constant-time-ish: always verify against something, even if user not found.
    // Use a dummy hash when user not found to avoid timing-based user enumeration.
    const dummyHash =
      "0".repeat(16) + ":" + "a".repeat(128);
    const storedHash = user ? user.password_hash : dummyHash;
    const passwordValid = await verifyPassword(password, storedHash);

    if (!user || !passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const userAgent = request.headers.get("user-agent") || undefined;
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
      clientIp,
      userAgent,
    );
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.display_name,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
