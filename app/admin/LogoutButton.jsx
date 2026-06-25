'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '0.5rem 0.9rem',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        background: '#fff',
        color: '#334155',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Log out
    </button>
  );
}
