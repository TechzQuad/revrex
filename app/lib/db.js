import { neon } from '@neondatabase/serverless';

// Lazily create the SQL client so the module can be imported even when
// DATABASE_URL isn't set (e.g. local dev without a database) — in that case
// persistence is simply skipped instead of crashing the request.
let sql;
function getSql() {
  if (sql) return sql;
  if (!process.env.DATABASE_URL) return null;
  sql = neon(process.env.DATABASE_URL);
  return sql;
}

// Create the table on first use. `IF NOT EXISTS` makes this safe to run on
// every cold start; Neon's HTTP driver runs it as a single round-trip.
let ensured;
async function ensureTable(db) {
  if (ensured) return ensured;
  ensured = db`
    CREATE TABLE IF NOT EXISTS leads (
      id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name        TEXT NOT NULL,
      company     TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT NOT NULL,
      learn_more  BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return ensured;
}

/**
 * Persist a form submission. Returns the inserted row, or null if no database
 * is configured. Throws on a genuine database error so the caller can decide
 * how to handle it.
 */
export async function saveLead(lead) {
  const db = getSql();
  if (!db) return null;

  await ensureTable(db);

  const [row] = await db`
    INSERT INTO leads (name, company, email, phone, learn_more)
    VALUES (${lead.name}, ${lead.company}, ${lead.email}, ${lead.phone}, ${lead.learnMore})
    RETURNING id, created_at
  `;
  return row;
}

/** Every form submission, newest first. Returns [] if no database is configured. */
export async function listLeads() {
  const db = getSql();
  if (!db) return [];
  await ensureTable(db);
  return db`
    SELECT id, name, company, email, phone, learn_more, created_at
    FROM leads
    ORDER BY created_at DESC
  `;
}

// ── Admin users ───────────────────────────────────────────────────────

let adminEnsured;
async function ensureAdminTable(db) {
  if (adminEnsured) return adminEnsured;
  adminEnsured = db`
    CREATE TABLE IF NOT EXISTS admin_users (
      email         TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return adminEnsured;
}

export async function getAdminByEmail(email) {
  const db = getSql();
  if (!db) return null;
  await ensureAdminTable(db);
  const [row] = await db`
    SELECT email, password_hash FROM admin_users WHERE email = ${email.toLowerCase()}
  `;
  return row || null;
}

/** Insert or update an admin's credentials (used by the seed script). */
export async function upsertAdmin(email, passwordHash) {
  const db = getSql();
  if (!db) throw new Error('DATABASE_URL is not set');
  await ensureAdminTable(db);
  await db`
    INSERT INTO admin_users (email, password_hash)
    VALUES (${email.toLowerCase()}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
}
