'use client';

import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchDashboard() {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Unable to load dashboard.');
  return res.json();
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard()
      .then((data) => setDashboard(data))
      .catch(() => setError('Unable to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Executive cockpit
              </p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Finance overview for your African SME
              </h1>
              <p className="mt-3 max-w-2xl text-slate-400">
                Track your operating rhythm, plan ahead, and stay in control of receivables,
                expenses, and payroll.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              Currency default: <span className="font-semibold text-white">GHS</span>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
            <p className="text-slate-400">Loading dashboard...</p>
          </section>
        ) : error ? (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
            <p className="text-rose-400">{error}</p>
          </section>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Active businesses
                </p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {dashboard.summary.activeBusinesses}
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Recent activity
                </p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {dashboard.businessList.length}
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {dashboard.user?.name || dashboard.user?.email}
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft sm:p-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold">Latest businesses</h2>
                <p className="text-sm text-slate-400">Updated most recently first</p>
              </div>
              <div className="mt-6 grid gap-4">
                {dashboard.businessList.length === 0 ? (
                  <p className="text-slate-400">
                    No businesses yet. Create one to start tracking finances.
                  </p>
                ) : (
                  dashboard.businessList.map((business: any) => (
                    <div
                      key={business.id}
                      className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xl font-semibold text-white">{business.name}</p>
                          <p className="text-sm text-slate-400">
                            {business.industry || 'Industry not set'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                            {business.currency || 'GHS'}
                          </span>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {business.slug}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
