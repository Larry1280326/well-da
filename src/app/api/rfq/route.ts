import { type NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/s3";
import { validateRfqInput } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  let client;
  let s3Key: string | null = null;

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
      // Silently appear to succeed so bots don't know they were caught
      return NextResponse.json(
        { success: true, rfqId: 0 },
        { status: 201 },
      );
    }

    // Extract all text fields
    const fields: Record<string, string> = {};
    const fieldNames = [
      "company_name",
      "contact_name",
      "email",
      "phone",
      "project_name",
      "material",
      "quantity",
      "tolerance",
      "surface_finish",
      "target_delivery_date",
      "notes",
    ];

    for (const name of fieldNames) {
      fields[name] = (formData.get(name) as string) ?? "";
    }

    // Extract the file
    const file = formData.get("file") as File | null;

    // Validate
    const validation = validateRfqInput(fields, file);
    if (!validation.ok) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 },
      );
    }

    const { fields: validFields, file: fileInfo } = validation.data;

    // Convert File to Buffer
    const arrayBuffer = await file!.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Begin DB transaction first
    client = await getClient();
    await client.query("BEGIN");

    try {
      // Upload to S3 (inside transaction window — if this fails, we rollback)
      const uploadResult = await uploadFile(
        buffer,
        fileInfo.fileName,
        fileInfo.contentType,
      );
      s3Key = uploadResult.key;

      // Insert file record
      const fileResult = await client.query(
        `INSERT INTO rfq_files (file_name, file_url, file_type, file_size_bytes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          fileInfo.fileName,
          uploadResult.url,
          fileInfo.contentType,
          fileInfo.size,
        ],
      );
      const fileId: number = fileResult.rows[0].id;

      // Insert customer
      const customerResult = await client.query(
        `INSERT INTO customers (company_name, contact_name, email, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          validFields.company_name,
          validFields.contact_name,
          validFields.email,
          validFields.phone,
        ],
      );
      const customerId: number = customerResult.rows[0].id;

      // Insert RFQ
      const rfqResult = await client.query(
        `INSERT INTO rfqs
           (customer_id, file_id, project_name, material, quantity,
            tolerance, surface_finish, target_delivery_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          customerId,
          fileId,
          validFields.project_name,
          validFields.material,
          validFields.quantity,
          validFields.tolerance || null,
          validFields.surface_finish || null,
          validFields.target_delivery_date || null,
          validFields.notes || null,
        ],
      );
      const rfqId: number = rfqResult.rows[0].id;

      // Commit — everything succeeded
      await client.query("COMMIT");

      return NextResponse.json(
        { success: true, rfqId },
        { status: 201 },
      );
    } catch (innerError) {
      // Rollback DB — any partial inserts are undone
      await client.query("ROLLBACK");

      // Best-effort S3 cleanup if we uploaded before the failure
      if (s3Key) {
        try {
          await deleteFile(s3Key);
        } catch (cleanupError) {
          console.error("Failed to clean up S3 file after rollback:", cleanupError);
        }
      }

      throw innerError;
    }
  } catch (error) {
    // Log a helpful diagnostic message for common connection issues
    const err = error as Error & { code?: string };
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      console.error(
        `RFQ submission error: ${err.code} - Database connection failed. ` +
          "Check that PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD in .env.local point to your RDS instance.",
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
