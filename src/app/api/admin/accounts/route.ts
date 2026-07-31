import { type NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { validateSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { ADMIN_ROLES, type AdminRole } from "@/lib/auth/types";

export async function GET() {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "root") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const accounts = await query<{
      id: number;
      username: string;
      role: string;
      display_name: string | null;
      created_at: string;
      last_login_at: string | null;
      is_active: boolean;
    }>(
      `SELECT id, username, role, display_name, created_at, last_login_at, is_active
       FROM admin_users
       ORDER BY created_at DESC`,
    );

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Admin accounts list error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "root") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const username = (body.username ?? "").trim();
    const password = (body.password ?? "") as string;
    const role = (body.role ?? "").trim();
    const displayName = (body.displayName ?? "").trim() || null;

    // Validate input
    if (!username || username.length < 3 || username.length > 255) {
      return NextResponse.json(
        { success: false, error: "Username must be 3-255 characters." },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!ADMIN_ROLES.includes(role as AdminRole)) {
      return NextResponse.json(
        { success: false, error: "Invalid role." },
        { status: 400 },
      );
    }

    // Check uniqueness
    const existing = await queryOne(
      `SELECT id FROM admin_users WHERE LOWER(username) = LOWER($1)`,
      [username],
    );
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username already exists." },
        { status: 409 },
      );
    }

    // Create account
    const passwordHash = hashPassword(password);
    const newUser = await queryOne<{
      id: number; username: string; role: string; display_name: string | null;
      created_at: string;
    }>(
      `INSERT INTO admin_users (username, password_hash, role, display_name, created_by)
       VALUES ($1, $2, $3::admin_role, $4, $5)
       RETURNING id, username, role, display_name, created_at`,
      [username, passwordHash, role, displayName, user.userId],
    );

    return NextResponse.json({ success: true, account: newUser }, { status: 201 });
  } catch (error) {
    console.error("Admin account creation error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
