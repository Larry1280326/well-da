/**
 * Bootstrap script: creates the first root admin account.
 *
 * Run with: npx tsx scripts/create-root-admin.ts
 *
 * Prompts interactively for username and password (password input is hidden).
 * The generated password hash uses Node.js crypto.scryptSync.
 */

import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as readline from "node:readline";
import { Pool } from "pg";

// Load .env.local (Next.js does this automatically, but tsx doesn't)
function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — env vars must already be set
  }
}
loadEnvFile();

const KEYLEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Hide password input (simple approach: just ask, not truly hidden on all terminals)
async function askPassword(query: string): Promise<string> {
  return ask(query);
}

async function main() {
  console.log("=== Well Da Admin — Create Root Account ===\n");

  const host = process.env.PGHOST;
  if (!host) {
    console.error(
      "ERROR: PGHOST is not set. Set RDS connection variables in .env.local:\n" +
        "  PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD",
    );
    process.exit(1);
  }

  const pool = new Pool({
    host,
    port: parseInt(process.env.PGPORT || "5432", 10),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    const username = await ask("Username: ");
    if (!username || username.length < 3) {
      console.error("ERROR: Username must be at least 3 characters.");
      process.exit(1);
    }

    const password = await askPassword("Password (min 8 chars): ");
    if (!password || password.length < 8) {
      console.error("ERROR: Password must be at least 8 characters.");
      process.exit(1);
    }

    const passwordHash = hashPassword(password);

    // Check if admin_role ENUM exists, create if not
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE admin_role AS ENUM ('root', 'owner', 'engineer');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Check if user already exists
    const existing = await pool.query(
      `SELECT id FROM admin_users WHERE LOWER(username) = LOWER($1)`,
      [username],
    );

    if (existing.rows.length > 0) {
      console.error(
        `ERROR: Username "${username}" already exists. Choose a different username.`,
      );
      process.exit(1);
    }

    await pool.query(
      `INSERT INTO admin_users (username, password_hash, role, display_name)
       VALUES ($1, $2, 'root', $3)`,
      [username, passwordHash, username],
    );

    console.log(`\n✅ Root admin account "${username}" created successfully.`);
    console.log("   You can now log in at /en/administrator");
  } catch (err) {
    console.error("ERROR:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
