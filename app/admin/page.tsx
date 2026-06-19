import { cookies } from 'next/headers';
import Link from 'next/link';
import { AdminLoginForm } from '@/components/admin-login-form';
import { AdminLogoutButton } from '@/components/admin-logout-button';
import { getVisitorSummary } from '@/lib/visitor-store';
import { verifyAdminSession } from '@/lib/admin-auth';
import { ShieldCheck, MapPin, Globe2, Fingerprint, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get('portfolio_admin_session')?.value);

  if (!session) {
    return (
      <main className="container-pad flex min-h-screen items-center justify-center py-12 sm:py-16">
        <Link
          href="/"
          className="fixed left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-xs font-medium text-white/75 backdrop-blur-md transition hover:border-electric/50 hover:text-white sm:left-4 sm:top-4"
          aria-label="Back to portfolio"
          title="Back to portfolio"
        >
          <ArrowLeft className="h-4 w-4 text-electric" />
          Back
        </Link>
        <div className="glass metal-border w-full max-w-lg rounded-[2rem] p-5 sm:p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Restricted access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Admin portal</h1>
          <div className="mt-6 sm:mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </main>
    );
  }

  const summary = await getVisitorSummary();

  return (
    <main className="container-pad py-10">
      <Link
        href="/"
        className="fixed left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-xs font-medium text-white/75 backdrop-blur-md transition hover:border-electric/50 hover:text-white sm:left-4 sm:top-4"
        aria-label="Back to portfolio"
        title="Back to portfolio"
      >
        <ArrowLeft className="h-4 w-4 text-electric" />
        Back
      </Link>
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] glass metal-border p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Admin portal</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Visitor intelligence dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Signed in as {session.username}. This view shows only consented visitor records.
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <StatCard icon={<ShieldCheck className="h-5 w-5 text-electric" />} label="Total visits" value={summary.totalVisits} />
        <StatCard icon={<Globe2 className="h-5 w-5 text-electric" />} label="Unique countries" value={summary.uniqueCountries} />
        <StatCard icon={<Fingerprint className="h-5 w-5 text-electric" />} label="Unique IPs" value={summary.uniqueIps} />
      </div>

      <section className="mt-8 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-electric/70">Latest logs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Visitor records</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] glass metal-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Path</th>
                  <th className="px-5 py-4">IP</th>
                  <th className="px-5 py-4">Device</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Timezone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {summary.visits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-white/50">
                      No visitor data yet.
                    </td>
                  </tr>
                ) : (
                  summary.visits.map((visit) => (
                    <tr key={visit.id} className="align-top text-white/80">
                      <td className="px-5 py-4 whitespace-nowrap">{new Date(visit.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4 font-medium text-white">{visit.pathname}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{visit.ip}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-white">
                          <div>{visit.deviceType ?? 'Unknown'}</div>
                          <div className="text-xs text-white/50">
                            {[visit.os, visit.browser].filter(Boolean).join(' · ') || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
                          <span>
                            {[visit.city, visit.region, visit.country].filter(Boolean).join(', ') || 'Private / local device'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">{visit.timezone ?? 'Browser default'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="glass metal-border rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">{label}</p>
        {icon}
      </div>
      <div className="mt-5 text-3xl font-semibold text-white sm:text-4xl">{value}</div>
    </div>
  );
}
