import "server-only";
import { queryOne } from "@/lib/db";

/**
 * Generates an RFQ reference number in the format: RFQ-YYYY-NNNNNN
 * Uses a PostgreSQL sequence for the auto-incrementing numeric portion.
 * The sequence is transaction-safe — no race conditions under concurrent submissions.
 */
export async function generateRfqReference(): Promise<string> {
  const row = await queryOne<{ ref: string }>(
    `SELECT CONCAT('RFQ-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(NEXTVAL('rfq_reference_seq')::TEXT, 6, '0')) AS ref`,
  );
  if (!row) {
    throw new Error("Failed to generate RFQ reference number");
  }
  return row.ref;
}
