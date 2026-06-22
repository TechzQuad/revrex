# RevRex — Signup Form + Hostinger Mailer (Next.js)

A Next.js app with a signup form (Name, Company, Email, Phone) and an API route
that emails the contact via your **Hostinger** mailbox. One repo, one deploy on
**Vercel**.

```
app/
├── page.jsx                  → renders the form
├── components/ContactForm.jsx → the form (client component)
└── api/contact/route.js      → POST handler, sends mail via Nodemailer
```

## 1. Configure Hostinger credentials

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Hostinger mailbox details (hPanel → Emails →
your mailbox → **Connect Devices**).

## 2. Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Test the API directly:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","company":"Acme","email":"jane@example.com","phone":"+15550100"}'
```

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo** (it auto-detects Next.js).
3. Add your env vars under **Settings → Environment Variables** — the same keys
   from `.env.example` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
   `SMTP_PASS`, `MAIL_FROM`, `NOTIFY_TO`, `COMPANY_NAME`).
4. Deploy. Your form is live at `https://your-project.vercel.app`.

> The mail route is pinned to the Node.js runtime (`runtime = 'nodejs'`) because
> Nodemailer can't run on Vercel's Edge runtime.

## 4. Embed on your HTML landing page

The simplest, zero-build way is an **iframe** pointing at the deployed page:

```html
<iframe
  src="https://your-project.vercel.app"
  title="Sign up"
  style="width:100%;max-width:460px;height:560px;border:0;"
></iframe>
```

(Want a borderless inline form instead of an iframe? Tell me and I'll add a
standalone embeddable bundle.)

## How the email works

On submit, `app/api/contact/route.js`:
1. Sends a **welcome email to the contact** who signed up.
2. Sends a **lead-notification email to you** (`NOTIFY_TO`, optional), with
   `reply-to` set to the contact so you can reply directly.
