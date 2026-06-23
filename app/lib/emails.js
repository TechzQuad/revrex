// Email templates for the RevRex Latino Tax Fest bundle.
// Built table-based with inline styles so they render in Gmail, Outlook,
// Apple Mail, etc. Palette matches the landing page (navy + gold).

const COLORS = {
  bg: '#07111f',
  panel: '#101f35',
  panelSoft: '#142843',
  text: '#f4f7fb',
  muted: '#b8c4d8',
  gold: '#e5bb65',
  gold2: '#f2d28d',
  line: 'rgba(255,255,255,0.10)',
};

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// Bulletproof, table-based button that works across email clients.
function button(href, label, { primary = true } = {}) {
  const bg = primary
    ? `background:linear-gradient(135deg,${COLORS.gold},${COLORS.gold2});color:#ffffff;`
    : `background:#142843;color:${COLORS.text};border:1px solid rgba(255,255,255,0.14);`;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
      <tr>
        <td align="center" style="border-radius:5px;${bg}">
          <a href="${esc(href)}" target="_blank"
             style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;
                    font-size:15px;font-weight:800;line-height:1;text-decoration:none;
                    color:inherit;border-radius:5px;">
            ${esc(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

// Shared shell: dark page, centered 600px card, brand header, footer.
function shell({ company, preheader, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark light" />
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:28px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="width:600px;max-width:92%;background:${COLORS.panel};border:1px solid ${COLORS.line};
                      border-radius:18px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid ${COLORS.line};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,${COLORS.gold},#9b7630);
                             text-align:center;vertical-align:middle;color:#08101c;font-weight:900;font-size:15px;">RR</td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <div style="color:${COLORS.text};font-weight:800;font-size:15px;letter-spacing:0.04em;">REVREX</div>
                    <div style="color:${COLORS.muted};font-size:12px;">Know Your Score&trade;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr><td style="padding:32px;">${bodyHtml}</td></tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${COLORS.line};color:${COLORS.muted};font-size:12px;line-height:1.6;">
              &copy; ${esc(company)} &bull; Latino Tax Fest 2026 Follow-Up Resource Bundle
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const row = (label, value) => `
  <tr>
    <td style="padding:10px 16px;border-bottom:1px solid ${COLORS.line};color:${COLORS.muted};font-size:13px;width:90px;">${esc(label)}</td>
    <td style="padding:10px 16px;border-bottom:1px solid ${COLORS.line};color:${COLORS.text};font-size:15px;font-weight:600;">${esc(value)}</td>
  </tr>`;

/**
 * Lead-notification email sent to the RevRex team.
 */
export function leadNotificationEmail(lead, company) {
  const body = `
    <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(229,187,101,0.12);
                border:1px solid rgba(229,187,101,0.32);color:${COLORS.gold2};font-size:12px;font-weight:800;
                letter-spacing:0.04em;text-transform:uppercase;margin-bottom:16px;">New Bundle Signup</div>
    <h1 style="margin:0 0 8px;color:${COLORS.text};font-size:24px;line-height:1.2;">You've got a new lead 🎉</h1>
    <p style="margin:0 0 22px;color:${COLORS.muted};font-size:15px;line-height:1.6;">
      Someone just requested the Latino Tax Fest bundle. Here are their details &mdash; reply directly to reach them.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background:${COLORS.panelSoft};border:1px solid ${COLORS.line};border-radius:14px;overflow:hidden;">
      ${row('Name', lead.name)}
      ${row('Company', lead.company)}
      ${row('Email', lead.email)}
      ${row('Phone', lead.phone)}
      ${row('Learn more?', lead.learnMore ? 'Yes — wants to learn more about RevRex' : 'No')}
    </table>
    <p style="margin:22px 0 0;color:${COLORS.muted};font-size:13px;line-height:1.6;">
      The contact has also been emailed their download links automatically.
    </p>`;

  return {
    subject: `New bundle signup: ${lead.name} (${lead.company})`,
    html: shell({
      company,
      preheader: `New lead: ${lead.name} from ${lead.company}`,
      bodyHtml: body,
    }),
    text:
      `New bundle signup\n\n` +
      `Name:    ${lead.name}\n` +
      `Company: ${lead.company}\n` +
      `Email:   ${lead.email}\n` +
      `Phone:   ${lead.phone}\n` +
      `Learn more? ${lead.learnMore ? 'Yes' : 'No'}\n\n` +
      `The contact has been emailed their download links automatically.`,
  };
}

/**
 * Bundle-delivery email sent to the contact who signed up.
 * `links` = { presentations, workflow } (any may be empty — buttons are conditional).
 */
export function welcomeEmail(lead, company, links = {}) {
  const buttons =
    (links.presentations
      ? button(links.presentations, '📊  Download Presentations (English and Spanish)')
      : '') +
    (links.workflow ? button(links.workflow, '📦  Download Crypto Workflow Toolkit (ZIP)') : '');

  const fallback = !buttons
    ? `<p style="margin:0 0 8px;color:${COLORS.muted};font-size:14px;">Your download links are being prepared and will arrive shortly.</p>`
    : '';

  const body = `
    <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(229,187,101,0.12);
                border:1px solid rgba(229,187,101,0.32);color:${COLORS.gold2};font-size:12px;font-weight:800;
                letter-spacing:0.04em;text-transform:uppercase;margin-bottom:16px;">Your Bundle Is Ready</div>
    <h1 style="margin:0 0 8px;color:${COLORS.text};font-size:24px;line-height:1.2;">Thanks, ${esc(lead.name)} 👋</h1>
    <p style="margin:0 0 22px;color:${COLORS.muted};font-size:15px;line-height:1.6;">
      Here's your Latino Tax Fest follow-up bundle &mdash; both presentation decks in
      <strong style="color:${COLORS.text};">English &amp; Spanish</strong> (4 files) plus the updated
      <strong style="color:${COLORS.text};">Crypto Workflow Toolkit</strong>. Grab everything below.
    </p>
    ${buttons}${fallback}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin:18px 0 0;background:${COLORS.panelSoft};border:1px solid ${COLORS.line};border-radius:14px;">
      <tr><td style="padding:16px 18px;">
        <div style="color:${COLORS.gold2};font-size:13px;font-weight:800;margin-bottom:8px;">Inside the toolkit</div>
        <div style="color:${COLORS.muted};font-size:14px;line-height:1.7;">
          ✓ Welcome / start-here guide<br/>
          ✓ Updated client intake questionnaire<br/>
          ✓ Documentation workbook<br/>
          ✓ File organization template<br/>
          ✓ Legislative quick reference<br/>
          ✓ Annual review calendar
        </div>
      </td></tr>
    </table>
    <p style="margin:22px 0 0;color:${COLORS.muted};font-size:13px;line-height:1.6;">
      Questions? Just reply to this email &mdash; a real person at ${esc(company)} will get back to you.
    </p>`;

  return {
    subject: `Your Latino Tax Fest bundle is here, ${lead.name}`,
    html: shell({
      company,
      preheader: 'Your presentation decks + Crypto Workflow Toolkit are ready to download.',
      bodyHtml: body,
    }),
    text:
      `Hi ${lead.name},\n\n` +
      `Thanks for signing up with ${company}. Here's your Latino Tax Fest bundle:\n\n` +
      (links.presentations
        ? `Presentations (English & Spanish, 4 files): ${links.presentations}\n`
        : '') +
      (links.workflow ? `Crypto Workflow Toolkit (ZIP): ${links.workflow}\n` : '') +
      `\nInside the toolkit: welcome guide, intake questionnaire, documentation workbook, ` +
      `file organization template, legislative quick reference, and annual review calendar.\n\n` +
      `Questions? Just reply to this email.\n\n${company}`,
  };
}
