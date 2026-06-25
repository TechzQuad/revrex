import { cookies } from 'next/headers';
import { listLeads } from '@/app/lib/db';
import { verifySessionToken, SESSION_COOKIE } from '@/app/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLUMNS = ['id', 'name', 'company', 'email', 'phone', 'learn_more', 'created_at'];

// Wrap every field in quotes and escape embedded quotes — keeps commas,
// newlines and leading symbols intact when opened in Excel/Sheets.
function csvCell(value) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const leads = await listLeads();
  const rows = [
    COLUMNS.join(','),
    ...leads.map((lead) =>
      COLUMNS.map((col) =>
        csvCell(col === 'created_at' ? new Date(lead[col]).toISOString() : lead[col])
      ).join(',')
    ),
  ];
  // Prepend a UTF-8 BOM so Excel detects the encoding correctly.
  const csv = '﻿' + rows.join('\r\n');

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="form-submissions-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
