'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      body: formData,
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? 'Login failed');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <label className="sr-only" htmlFor="username">
          Login ID
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-electric/50"
          placeholder="Login ID"
        />
      </div>
      <div className="space-y-3">
        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-electric/50"
          placeholder="Password"
        />
      </div>
      <div className="space-y-3">
        <label className="sr-only" htmlFor="code">
          2FA Code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-electric/50"
          placeholder="2FA Code"
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <KeyRound className="h-4 w-4" />
        {loading ? 'Signing in...' : 'Unlock admin'}
      </button>
    </form>
  );
}
