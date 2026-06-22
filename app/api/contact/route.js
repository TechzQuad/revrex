import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { leadNotificationEmail, welcomeEmail } from '@/app/lib/emails';

// Nodemailer needs the Node.js runtime (not Edge), and we never want this cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COMPANY = process.env.COMPANY_NAME || 'RevRex';
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Build the transport per-request: serverless functions are short-lived, so a
// module-level singleton buys nothing and complicates cold starts.
function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: String(process.env.SMTP_SECURE) === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const lead = {
    name: (body.name || '').trim(),
    company: (body.company || '').trim(),
    email: (body.email || '').trim(),
    phone: (body.phone || '').trim(),
  };

  if (!lead.name || !lead.company || !lead.email || !lead.phone) {
    return NextResponse.json(
      { ok: false, error: 'Name, company, email and phone are all required.' },
      { status: 400 }
    );
  }
  if (!isEmail(lead.email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  // Download links for the bundle delivery email (set in .env / Vercel).
  const links = {
    deck1: process.env.DECK_1_URL || '',
    deck2: process.env.DECK_2_URL || '',
    zip: process.env.WORKFLOW_ZIP_URL || '',
  };

  try {
    const transporter = makeTransport();

    // 1) Bundle-delivery email to the contact who signed up
    const welcome = welcomeEmail(lead, COMPANY, links);
    await transporter.sendMail({
      from: MAIL_FROM,
      to: lead.email,
      subject: welcome.subject,
      text: welcome.text,
      html: welcome.html,
    });

    // 2) "New bundle signup" notification to the team (NOTIFY_TO, comma-separated)
    if (process.env.NOTIFY_TO) {
      const notify = leadNotificationEmail(lead, COMPANY);
      await transporter.sendMail({
        from: MAIL_FROM,
        to: process.env.NOTIFY_TO,
        replyTo: lead.email,
        subject: notify.subject,
        text: notify.text,
        html: notify.html,
      });
    }

    return NextResponse.json({ ok: true, message: 'Signup received — your bundle is on its way.' });
  } catch (err) {
    console.error('Email send failed:', err);
    return NextResponse.json(
      { ok: false, error: 'Could not send email. Please try again later.' },
      { status: 500 }
    );
  }
}
