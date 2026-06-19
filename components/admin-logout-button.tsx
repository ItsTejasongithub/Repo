'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  );
}

