import { type NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/s3";
import { validateRfqInput } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import type { FileInfo } from "@/lib/types/rfq";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function parseOptionalFloat(raw: string | null): number | null {
  if (!raw) return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

export async function POST(request: NextRequest) {
  let client: Awaited<ReturnType<typeof getClient>> | null = null;
  const uploadedS3Keys: string[] = [];

  try {
    const clientIp = getClientIp(request);

    // Rate limit: max 3 submissions per hour per IP
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const formData = await request.formData();

    // HoneyPot check — hidden field that bots fill in
    if (formData.get("website")?.toString().trim()) {
      return NextResponse.json(
        { success: true, reference: "RFQ-0000-000000" },
        { status: 201 },
      );
    }

    // ---- Extract text fields ----
    const textFieldNames = [
      "company_name", "contact_name", "email", "phone",
      "country_region", "preferred_method",
      "project_name", "part_number", "drawing_code", "drawing_revision",
      "drawing_avail",
      "material", "material_grade", "thickness", "thickness_unit",
      "surface_finish", "surface_finish_other", "finish_color",
      "critical_tolerance_req", "assembly_required", "hardware_inserts",
      "prototype_quantity", "production_quantity", "est_annual_vol",
      "required_date", "required_date_type",
      "delivery_region", "postal_code", "shipping_quote_required",
      "approx_dimensions", "protection_req_other",
      "special_req_notes", "privacy_accepted",
    ];

    const rawFields: Record<string, string> = {};
    for (const name of textFieldNames) {
      rawFields[name] = (formData.get(name) as string) ?? "";
    }

    // ---- Extract JSON array fields ----
    const arrayFieldNames = [
      "product_type",
      "printing_marking",
      "operating_env",
      "protection_req",
      "inspection_req",
      "cert_report",
      "additional_options",
    ];

    for (const name of arrayFieldNames) {
      rawFields[name] = formData.get(name)?.toString() ?? "";
    }

    // ---- Extract files ----
    const fileEntries = formData.getAll("files") as File[];
    const files: File[] = fileEntries.filter((f) => f && f.size > 0);

    const fileInfos: FileInfo[] = files.map((f) => ({
      fileName: f.name,
      contentType: f.type || "application/octet-stream",
      size: f.size,
    }));

    // ---- Validate ----
    const validation = validateRfqInput(rawFields, fileInfos);
    if (!validation.ok) {
      console.error("RFQ validation errors:", JSON.stringify(validation.errors));
      console.error("RFQ rawFields received:", JSON.stringify(rawFields));
      console.error("RFQ files count:", fileInfos.length);
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 },
      );
    }

    const { fields: validFields } = validation.data;

    // Parse array fields for DB insertion
    const product_type = parseJsonArray(rawFields.product_type);
    const printing_marking = parseJsonArray(rawFields.printing_marking);
    const operating_env = parseJsonArray(rawFields.operating_env);
    const protection_req = parseJsonArray(rawFields.protection_req);
    const inspection_req = parseJsonArray(rawFields.inspection_req);
    const cert_report = parseJsonArray(rawFields.cert_report);
    const additional_options = parseJsonArray(rawFields.additional_options);

    // ---- Pre-upload files to S3 (before DB transaction to avoid holding it open) ----
    const uploadedFiles: { key: string; url: string; fileName: string; fileType: string; fileSize: number }[] = [];

    for (const f of files) {
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadFile(buffer, f.name, f.type || "application/octet-stream");
      uploadedS3Keys.push(result.key);
      uploadedFiles.push({
        key: result.key,
        url: result.url,
        fileName: f.name,
        fileType: f.type || "application/octet-stream",
        fileSize: f.size,
      });
    }

    // ---- Database transaction ----
    client = await getClient();
    await client.query("BEGIN");

    try {
      // 1. Insert customers
      const customerResult = await client.query(
        `INSERT INTO customers (company_name, contact_name, email, phone, region, preferred_method)
         VALUES ($1, $2, $3, $4, $5, $6::contact_method)
         RETURNING id`,
        [
          validFields.company_name,
          validFields.contact_name,
          validFields.email,
          validFields.phone || null,
          validFields.country_region,
          validFields.preferred_method || null,
        ],
      );
      const customerId: number = customerResult.rows[0].id;

      // 2. Insert project_info
      const projectResult = await client.query(
        `INSERT INTO project_info (project_name, part_number, drawing_code, drawing_revision, product_type, drawing_avail)
         VALUES ($1, $2, $3, $4, $5::product_type_enum[], $6::drawing_avail_enum)
         RETURNING id`,
        [
          validFields.project_name,
          validFields.part_number || null,
          validFields.drawing_code || null,
          validFields.drawing_revision || null,
          product_type.length > 0 ? product_type : null,
          validFields.drawing_avail,
        ],
      );
      const projectInfoId: number = projectResult.rows[0].id;

      // 3. Insert material_n_manu_req
      const materialResult = await client.query(
        `INSERT INTO material_n_manu_req
           (material, material_grade, thickness, thickness_unit,
            surface_finish, finish_color, critical_tolerance_req,
            assembly_required, hardware_inserts, printing_marking)
         VALUES ($1::material_enum, $2, $3, $4::thickness_unit_enum,
                 $5, $6, $7,
                 $8::assembly_req_enum, $9, $10::printing_marking_enum[])
         RETURNING id`,
        [
          validFields.material,
          validFields.material_grade || null,
          parseOptionalFloat(rawFields.thickness),
          validFields.thickness_unit || null,
          validFields.surface_finish || validFields.surface_finish_other || null,
          validFields.finish_color || null,
          validFields.critical_tolerance_req || null,
          validFields.assembly_required || null,
          validFields.hardware_inserts || null,
          printing_marking.length > 0 ? printing_marking : null,
        ],
      );
      const materialId: number = materialResult.rows[0].id;

      // 4. Insert quantity
      const quantityResult = await client.query(
        `INSERT INTO quantity (prototype_quantity, production_quantity, est_annual_vol)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          validFields.prototype_quantity || null,
          validFields.production_quantity,
          validFields.est_annual_vol || null,
        ],
      );
      const quantityId: number = quantityResult.rows[0].id;

      // 5. Insert delivery_requirements
      const deliveryResult = await client.query(
        `INSERT INTO delivery_requirements
           (required_date, required_date_type, delivery_region, postal_code, shipping_quote_required)
         VALUES ($1, $2::required_date_type_enum, $3, $4, $5::shipping_quote_req_enum)
         RETURNING id`,
        [
          validFields.required_date || null,
          validFields.required_date_type || null,
          validFields.delivery_region,
          validFields.postal_code || null,
          validFields.shipping_quote_required || null,
        ],
      );
      const deliveryId: number = deliveryResult.rows[0].id;

      // 6. Insert additional_technical_requirements
      const techResult = await client.query(
        `INSERT INTO additional_technical_requirements
           (approx_dimensions, operating_env, protection_req, inspection_req, cert_report, special_req_notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          validFields.approx_dimensions || null,
          operating_env.length > 0 ? JSON.stringify(operating_env) : null,
          protection_req.length > 0 || validFields.protection_req_other
            ? JSON.stringify({ selected: protection_req, other: validFields.protection_req_other || null })
            : null,
          inspection_req.length > 0 ? JSON.stringify(inspection_req) : null,
          cert_report.length > 0 ? JSON.stringify(cert_report) : null,
          validFields.special_req_notes || null,
        ],
      );
      const techId: number = techResult.rows[0].id;

      // 7. Insert file records (rfq_files has no FK to rfqs; rfqs.file_id → rfq_files.id)
      //    Insert the first file to get its ID for the rfqs.file_id column.
      const firstFile = uploadedFiles[0];
      const fileResult = await client.query(
        `INSERT INTO rfq_files (file_name, file_url, file_type, file_size_bytes, additional_option)
         VALUES ($1, $2, $3, $4, $5::additional_option_enum[])
         RETURNING id`,
        [
          firstFile.fileName,
          firstFile.url,
          firstFile.fileType,
          firstFile.fileSize,
          additional_options.length > 0 ? additional_options : null,
        ],
      );
      const fileId: number = fileResult.rows[0].id;

      // Insert any remaining files (not directly linked to the RFQ row)
      for (let i = 1; i < uploadedFiles.length; i++) {
        const uf = uploadedFiles[i];
        await client.query(
          `INSERT INTO rfq_files (file_name, file_url, file_type, file_size_bytes, additional_option)
           VALUES ($1, $2, $3, $4, $5::additional_option_enum[])`,
          [
            uf.fileName,
            uf.url,
            uf.fileType,
            uf.fileSize,
            additional_options.length > 0 ? additional_options : null,
          ],
        );
      }

      // 8. Insert rfqs
      const rfqResult = await client.query(
        `INSERT INTO rfqs
           (customer_id, file_id, project_info_id, material_n_manu_req_id, quantity_id,
            delivery_requirements_id, additional_technical_requirements_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'initiated'::rfq_status)
         RETURNING id`,
        [
          customerId,
          fileId,
          projectInfoId,
          materialId,
          quantityId,
          deliveryId,
          techId,
        ],
      );
      const rfqId: number = rfqResult.rows[0].id;

      // Build reference from the auto-increment ID: RFQ-YYYY-NNNNNN
      const referenceNumber = `RFQ-${new Date().getFullYear()}-${String(rfqId).padStart(6, "0")}`;

      // Commit
      await client.query("COMMIT");

      // Build success response data
      const submittedAt = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      return NextResponse.json(
        {
          success: true,
          reference: referenceNumber,
          data: {
            reference: referenceNumber,
            projectName: validFields.project_name,
            submittedAt,
            email: validFields.email,
          },
        },
        { status: 201 },
      );
    } catch (innerError) {
      // Rollback DB
      await client.query("ROLLBACK");

      // Best-effort S3 cleanup for pre-uploaded files
      for (const key of uploadedS3Keys) {
        try {
          await deleteFile(key);
        } catch (cleanupError) {
          console.error("Failed to clean up S3 file after rollback:", cleanupError);
        }
      }

      throw innerError;
    }
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      console.error(
        `RFQ submission error: ${err.code} - Database connection failed. ` +
          "Check that PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD point to your RDS instance.",
      );
    } else if (err.code === "28000") {
      console.error(
        "RFQ submission error: 28000 - Authentication failed. " +
          "Check that your IP is allowed in the RDS security group inbound rules (port 5432).",
      );
    } else {
      console.error("RFQ submission error:", error);
    }
    return NextResponse.json(
      {
        success: false,
        error:
          "An unexpected error occurred. Please try again or contact us directly.",
      },
      { status: 500 },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
