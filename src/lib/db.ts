import "server-only";

import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const host = process.env.PGHOST;
    if (!host) {
      throw new Error(
        "PGHOST is not set. Add RDS connection variables to .env.local: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD",
      );
    }
    pool = new Pool({
      host,
      port: parseInt(process.env.PGPORT || "5432", 10),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

export async function query<T extends Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
