import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function AdminEntry() {
  return (
    <Link
      href="/admin"
      className="fixed right-3 top-3 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-xs font-medium text-white/75 backdrop-blur-md transition hover:border-electric/50 hover:text-white sm:right-4 sm:top-4"
      aria-label="Open admin portal"
      title="Admin portal"
    >
      <ShieldCheck className="h-4 w-4 text-electric" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  );
}
