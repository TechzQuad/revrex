import { NextResponse } from 'next/server';
import { getAdminByEmail } from '@/app/lib/db';
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/app/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  const admin = email ? await getAdminByEmail(email) : null;
  // Always run a verify (even on unknown email) to avoid leaking which emails
  // exist via response timing, then reject with one generic message.
  const ok = admin
    ? verifyPassword(password, admin.password_hash)
    : verifyPassword(password, 'x:0');

  if (!admin || !ok) {
    return NextResponse.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(admin.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
