const { Pool } = require("pg");
const fs = require("fs");

// Load .env.local
const env = fs.readFileSync(".env.local", "utf-8");
for (const line of env.split("\n")) {
  const m = line.trim().match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const pool = new Pool({
  host: process.env.PGHOST,
  port: 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const r = await pool.query(
      "DELETE FROM admin_users WHERE username = $1 RETURNING id, username, role",
      ["owner2"],
    );
    if (r.rowCount && r.rowCount > 0) {
      console.log(`Deleted: id=${r.rows[0].id}, username=${r.rows[0].username}, role=${r.rows[0].role}`);
    } else {
      console.log('User "owner2" not found.');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
  }
  await pool.end();
})();
