import { type NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { validateSession } from "@/lib/auth/session";
import { RFQ_STATUSES } from "@/lib/auth/types";

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

    // Per-column filter params
    const referenceFilter = searchParams.get("reference") || null;
    const projectNameFilter = searchParams.get("projectName") || null;
    const materialFilter = searchParams.get("material") || null;
    const companyFilter = searchParams.get("company") || null;
    const statusParam = searchParams.get("status") || null;
    const status =
      statusParam &&
      RFQ_STATUSES.includes(statusParam as (typeof RFQ_STATUSES)[number])
        ? statusParam
        : null;
    const sortDir = searchParams.get("sort") === "asc" ? "ASC" : "DESC";

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

    // ----- Dynamic WHERE clause (per-column AND logic) -----
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 0;

    if (referenceFilter && referenceFilter.trim()) {
      idx++;
      const pattern = `%${referenceFilter.trim()}%`;
      params.push(pattern);
      conditions.push(
        `(r.id::text ILIKE $${idx} OR EXTRACT(YEAR FROM r.created_at)::text ILIKE $${idx})`,
      );
    }

    if (projectNameFilter && projectNameFilter.trim()) {
      idx++;
      const pattern = `%${projectNameFilter.trim()}%`;
      params.push(pattern);
      conditions.push(`pi.project_name ILIKE $${idx}`);
    }

    if (companyFilter && companyFilter.trim()) {
      if (!isEngineer) {
        idx++;
        const pattern = `%${companyFilter.trim()}%`;
        params.push(pattern);
        conditions.push(`c.company_name ILIKE $${idx}`);
      }
    }

    if (materialFilter && materialFilter.trim()) {
      idx++;
      const pattern = `%${materialFilter.trim()}%`;
      params.push(pattern);
      conditions.push(`mnr.material::text ILIKE $${idx}`);
    }

    if (status) {
      idx++;
      params.push(status);
      conditions.push(`r.status = $${idx}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // ----- Count query (WHERE params only, no limit/offset) -----
    const whereParams = [...params];
    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*)::int AS total ${fromClause} ${whereClause}`,
      whereParams,
    );
    const total = countRow?.total ?? 0;

    // ----- Main data query -----
    idx++;
    params.push(limit);
    const limitIdx = idx;
    idx++;
    params.push(offset);
    const offsetIdx = idx;

    const rfqs = await query<{
      id: number;
      status: string;
      submittedAt: string;
      projectName: string;
      material: string;
      companyName?: string;
    }>(
      `${selectClause} ${fromClause} ${whereClause} ORDER BY r.created_at ${sortDir} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return NextResponse.json({ rfqs, total, page, limit });
  } catch (error) {
    console.error("Admin RFQ list error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
