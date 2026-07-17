'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function createBusiness(data: {
  name: string;
  industry?: string;
  slug?: string;
  currency?: string;
}) {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/businesses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to create business.');
  }
  return res.json();
}

async function fetchBusinesses() {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/businesses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [slug, setSlug] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBusinesses().then((list) => {
      setBusinesses(list);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const business = await createBusiness({ name, industry, slug, currency });
      setBusinesses((prev) => [...prev, business]);
      setName('');
      setIndustry('');
      setSlug('');
      setCurrency('NGN');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Business onboarding</h1>
              <p className="mt-2 text-slate-400">
                Create your first business and join your tenant workspace.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-3 text-sm text-slate-200">
              Current businesses: {businesses.length}
            </div>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Business name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Industry</span>
                <input
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Slug</span>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="auto-generated"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Currency</span>
                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating business...' : 'Create business'}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <h2 className="text-2xl font-semibold">Your businesses</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-slate-400">Loading businesses...</p>
            ) : businesses.length === 0 ? (
              <p className="text-slate-400">No businesses yet. Create one to get started.</p>
            ) : (
              businesses.map((business) => (
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
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {business.slug}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
