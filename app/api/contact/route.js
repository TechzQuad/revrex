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

  // Both downloads are served straight from the GitHub repo's /public folder
  // via raw.githubusercontent.com. NOTE: this requires the repo to be PUBLIC —
  // raw URLs on a private repo return 404 for anyone without a token.
  // Either env var can override these (e.g. a CDN or the deployed app's origin).
  const GH_RAW = 'https://raw.githubusercontent.com/TechzQuad/revrex/main/public';
  const PRESENTATIONS_FILE = 'RevRex_Presentations_English_Spanish_LatinoTaxFest2026.zip';
  const WORKFLOW_FILE = 'RevRex_Digital_Asset_Workflow_LatinoTaxFest2026.zip';

  // Download links for the bundle delivery email (set in .env / Vercel to override).
  const links = {
    presentations: process.env.PRESENTATIONS_URL || `${GH_RAW}/${PRESENTATIONS_FILE}`,
    workflow: process.env.WORKFLOW_ZIP_URL || `${GH_RAW}/${WORKFLOW_FILE}`,
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
