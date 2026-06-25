'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.replace('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Login failed.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Admin Login</h1>
        <label style={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={styles.input}
          />
        </label>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: '1.5rem',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    background: '#fff',
    borderRadius: 12,
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: { margin: 0, fontSize: '1.4rem', color: '#0f172a' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#334155', fontWeight: 600 },
  input: {
    padding: '0.6rem 0.7rem',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: '1rem',
    color: '#0f172a',
  },
  error: { margin: 0, color: '#dc2626', fontSize: '0.85rem' },
  button: {
    marginTop: '0.25rem',
    padding: '0.7rem',
    border: 'none',
    borderRadius: 8,
    background: '#2563eb',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
