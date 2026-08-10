import { query } from "@/lib/db";

interface ServiceStatus {
  status: "ok" | "error" | "missing-config";
  message?: string;
}

interface HealthResponse {
  timestamp: string;
  environment: string;
  services: {
    database: ServiceStatus;
    s3: ServiceStatus;
    ses: ServiceStatus;
  };
  missingVariables: string[];
}

const REQUIRED_VARS: Record<string, string[]> = {
  database: ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"],
  s3: ["S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"],
  ses: ["SES_ACCESS_KEY_ID", "SES_SECRET_ACCESS_KEY", "SES_SENDER_EMAIL", "SES_REGION"],
} as const;

function checkMissingVars(keys: string[]): string[] {
  return keys.filter((key) => !process.env[key]);
}

export async function GET(): Promise<Response> {
  const missing: string[] = [];
  const services: HealthResponse["services"] = {
    database: { status: "missing-config" },
    s3: { status: "missing-config" },
    ses: { status: "missing-config" },
  };

  // ---- Database ----
  const missingDb = checkMissingVars(REQUIRED_VARS.database);
  if (missingDb.length > 0) {
    services.database = {
      status: "missing-config",
      message: `Missing: ${missingDb.join(", ")}`,
    };
    missing.push(...missingDb);
  } else {
    try {
      await query("SELECT 1");
      services.database = { status: "ok" };
    } catch (err) {
      services.database = {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown database error",
      };
    }
  }

  // ---- S3 ----
  const missingS3 = checkMissingVars(REQUIRED_VARS.s3);
  if (missingS3.length > 0) {
    services.s3 = {
      status: "missing-config",
      message: `Missing: ${missingS3.join(", ")}`,
    };
    missing.push(...missingS3);
  } else {
    // S3 client is lazily created; presence of env vars is a reasonable check
    // without incurring an actual network call to S3 on every health ping.
    services.s3 = { status: "ok", message: "credentials present" };
  }

  // ---- SES ----
  const missingSes = checkMissingVars(REQUIRED_VARS.ses);
  if (missingSes.length > 0) {
    services.ses = {
      status: "missing-config",
      message: `Missing: ${missingSes.join(", ")} (optional — submissions succeed without email)`,
    };
    // SES is optional — do NOT add to missing[]
  } else {
    services.ses = { status: "ok", message: "credentials present" };
  }

  const overallOk =
    services.database.status === "ok" && services.s3.status === "ok";

  return Response.json(
    {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? "unknown",
      services,
      missingVariables: missing,
    } satisfies HealthResponse,
    { status: overallOk ? 200 : 503 },
  );
}
