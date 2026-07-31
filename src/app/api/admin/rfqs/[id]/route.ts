import { type NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { validateSession } from "@/lib/auth/session";

/**
 * Parse a PostgreSQL array string (e.g. "{val1,val2}" or "{val1}") into a JS array.
 * Returns null for empty/null/{} values.
 */
function parsePgArray(raw: unknown): string[] | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "{}") return null;
  // Strip curly braces
  const inner = trimmed.slice(1, -1);
  if (inner === "") return [];
  // Split by comma (naive — handles simple enum values without commas/quotes)
  return inner.split(",").map((s) => s.replace(/^"|"$/g, "").trim()).filter(Boolean);
}

/** Fields from DB queries that are Postgres array columns and need parsing */
const ARRAY_FIELDS = [
  "product_type",
  "printing_marking",
  "additional_option",
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rfqId = parseInt(id, 10);
    if (isNaN(rfqId)) {
      return NextResponse.json({ error: "Invalid RFQ ID" }, { status: 400 });
    }

    const isEngineer = user.role === "engineer";

    if (isEngineer) {
      // Engineer: all RFQ data EXCEPT customer contact info
      const row = await queryOne<Record<string, unknown>>(
        `SELECT
           r.id, r.status, r.created_at, r.confirmation_email_sent,
           pi.project_name, pi.part_number, pi.drawing_code, pi.drawing_revision,
           pi.product_type, pi.drawing_avail,
           mnr.material, mnr.material_grade, mnr.thickness, mnr.thickness_unit,
           mnr.surface_finish, mnr.finish_color, mnr.critical_tolerance_req,
           mnr.assembly_required, mnr.hardware_inserts, mnr.printing_marking,
           q.prototype_quantity, q.production_quantity, q.est_annual_vol,
           dr.required_date, dr.required_date_type, dr.delivery_region,
           dr.postal_code, dr.shipping_quote_required,
           atr.approx_dimensions, atr.operating_env, atr.protection_req,
           atr.inspection_req, atr.cert_report, atr.special_req_notes
         FROM rfqs r
         JOIN project_info pi ON r.project_info_id = pi.id
         JOIN material_n_manu_req mnr ON r.material_n_manu_req_id = mnr.id
         JOIN quantity q ON r.quantity_id = q.id
         JOIN delivery_requirements dr ON r.delivery_requirements_id = dr.id
         JOIN additional_technical_requirements atr ON r.additional_technical_requirements_id = atr.id
         WHERE r.id = $1`,
        [rfqId],
      );

      if (!row) {
        return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
      }

      // Fetch files
      const files = await query<Record<string, unknown>>(
        `SELECT id, file_name, file_url, file_type, file_size_bytes, additional_option
         FROM rfq_files WHERE rfq_id = $1`,
        [rfqId],
      );

      // Parse Postgres array columns in row and files
      for (const field of ARRAY_FIELDS) {
        if (field in row) (row as Record<string, unknown>)[field] = parsePgArray(row[field]);
      }
      for (const file of files) {
        if ("additional_option" in file) {
          (file as Record<string, unknown>).additional_option = parsePgArray(file.additional_option);
        }
      }

      return NextResponse.json({ rfq: { ...row, files } });
    }

    // Owner / root: full data including customer
    const row = await queryOne<Record<string, unknown>>(
      `SELECT
         r.id, r.status, r.created_at, r.confirmation_email_sent,
         c.company_name, c.contact_name, c.email, c.phone,
         c.region AS country_region, c.preferred_method,
         pi.project_name, pi.part_number, pi.drawing_code, pi.drawing_revision,
         pi.product_type, pi.drawing_avail,
         mnr.material, mnr.material_grade, mnr.thickness, mnr.thickness_unit,
         mnr.surface_finish, mnr.finish_color, mnr.critical_tolerance_req,
         mnr.assembly_required, mnr.hardware_inserts, mnr.printing_marking,
         q.prototype_quantity, q.production_quantity, q.est_annual_vol,
         dr.required_date, dr.required_date_type, dr.delivery_region,
         dr.postal_code, dr.shipping_quote_required,
         atr.approx_dimensions, atr.operating_env, atr.protection_req,
         atr.inspection_req, atr.cert_report, atr.special_req_notes
       FROM rfqs r
       JOIN customers c ON r.customer_id = c.id
       JOIN project_info pi ON r.project_info_id = pi.id
       JOIN material_n_manu_req mnr ON r.material_n_manu_req_id = mnr.id
       JOIN quantity q ON r.quantity_id = q.id
       JOIN delivery_requirements dr ON r.delivery_requirements_id = dr.id
       JOIN additional_technical_requirements atr ON r.additional_technical_requirements_id = atr.id
       WHERE r.id = $1`,
      [rfqId],
    );

    if (!row) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    // Fetch files
    const files = await query<Record<string, unknown>>(
      `SELECT id, file_name, file_url, file_type, file_size_bytes, additional_option
       FROM rfq_files WHERE rfq_id = $1`,
      [rfqId],
    );

    // Parse Postgres array columns in row and files
    for (const field of ARRAY_FIELDS) {
      if (field in row) (row as Record<string, unknown>)[field] = parsePgArray(row[field]);
    }
    for (const file of files) {
      if ("additional_option" in file) {
        (file as Record<string, unknown>).additional_option = parsePgArray(file.additional_option);
      }
    }

    return NextResponse.json({ rfq: { ...row, files } });
  } catch (error) {
    console.error("Admin RFQ detail error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
