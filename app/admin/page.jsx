import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { listLeads } from '@/app/lib/db';
import { verifySessionToken, SESSION_COOKIE } from '@/app/lib/auth';
import LogoutButton from './LogoutButton';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) redirect('/admin/login');

  const leads = await listLeads();

  return (
    <main style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Form Submissions</h1>
          <p style={styles.subtitle}>
            {leads.length} {leads.length === 1 ? 'submission' : 'submissions'} · signed in as {session.email}
          </p>
        </div>
        <div style={styles.actions}>
          <a href="/api/admin/export" style={styles.exportBtn}>
            ⬇ Export CSV
          </a>
          <LogoutButton />
        </div>
      </header>

      {leads.length === 0 ? (
        <p style={styles.empty}>No submissions yet.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Date', 'Name', 'Company', 'Email', 'Phone', 'Learn more'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={styles.td}>{new Date(lead.created_at).toLocaleString()}</td>
                  <td style={styles.td}>{lead.name}</td>
                  <td style={styles.td}>{lead.company}</td>
                  <td style={styles.td}>
                    <a href={`mailto:${lead.email}`} style={styles.link}>{lead.email}</a>
                  </td>
                  <td style={styles.td}>{lead.phone}</td>
                  <td style={styles.td}>{lead.learn_more ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: { margin: 0, fontSize: '1.6rem', color: '#0f172a' },
  subtitle: { margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  exportBtn: {
    padding: '0.55rem 1rem',
    background: '#16a34a',
    color: '#fff',
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: 'none',
  },
  empty: { color: '#64748b' },
  tableWrap: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    textAlign: 'left',
    padding: '0.7rem 0.85rem',
    background: '#f8fafc',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: { padding: '0.65rem 0.85rem', borderBottom: '1px solid #f1f5f9', color: '#0f172a' },
  link: { color: '#2563eb', textDecoration: 'none' },
};
