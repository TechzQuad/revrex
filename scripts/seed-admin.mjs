// Seeds (or updates) the admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
// Run with:  npm run seed:admin
import { readFileSync } from 'node:fs';
import { hashPassword } from '../app/lib/auth.js';
import { upsertAdmin } from '../app/lib/db.js';

// Load .env.local manually (no dotenv dependency in this project).
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // No .env.local — rely on the real environment (e.g. on Vercel).
}

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.');
  process.exit(1);
}

await upsertAdmin(email, hashPassword(password));
console.log(`✓ Admin seeded: ${email.toLowerCase()}`);
