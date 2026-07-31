import { type NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { validateSession } from "@/lib/auth/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "root") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const accountId = parseInt(id, 10);
    if (isNaN(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
    }

    // Cannot delete self
    if (accountId === user.userId) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account." },
        { status: 400 },
      );
    }

    // Check account exists
    const target = await queryOne(
      `SELECT id FROM admin_users WHERE id = $1`,
      [accountId],
    );
    if (!target) {
      return NextResponse.json(
        { success: false, error: "Account not found." },
        { status: 404 },
      );
    }

    // Soft-delete: deactivate
    await queryOne(
      `UPDATE admin_users SET is_active = FALSE WHERE id = $1`,
      [accountId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin account deletion error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
