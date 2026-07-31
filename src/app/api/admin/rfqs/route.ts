import { type NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { validateSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const isEngineer = user.role === "engineer";

    // Build role-specific query — engineer NEVER joins customers
    const selectClause = isEngineer
      ? `SELECT r.id, r.status, r.created_at AS "submittedAt",
                pi.project_name AS "projectName",
                mnr.material AS "material"`
      : `SELECT r.id, r.status, r.created_at AS "submittedAt",
                pi.project_name AS "projectName",
                mnr.material AS "material",
                c.company_name AS "companyName"`;

    const fromClause = isEngineer
      ? `FROM rfqs r
         JOIN project_info pi ON r.project_info_id = pi.id
         JOIN material_n_manu_req mnr ON r.material_n_manu_req_id = mnr.id`
      : `FROM rfqs r
         JOIN project_info pi ON r.project_info_id = pi.id
         JOIN material_n_manu_req mnr ON r.material_n_manu_req_id = mnr.id
         JOIN customers c ON r.customer_id = c.id`;

    const countFrom = isEngineer
      ? `FROM rfqs r`
      : `FROM rfqs r JOIN customers c ON r.customer_id = c.id`;

    const rfqs = await query<{
      id: number;
      status: string;
      submittedAt: string;
      projectName: string;
      material: string;
      companyName?: string;
    }>(
      `${selectClause} ${fromClause} ORDER BY r.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*)::int AS total ${countFrom}`,
    );
    const total = countRow?.total ?? 0;

    return NextResponse.json({ rfqs, total, page, limit });
  } catch (error) {
    console.error("Admin RFQ list error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
