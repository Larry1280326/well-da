import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.userId,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Admin session error:", error);
    return NextResponse.json(
      { authenticated: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
