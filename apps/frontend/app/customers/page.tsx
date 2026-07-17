'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchCustomers(businessId: number) {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/businesses/${businessId}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Unable to load customers.');
  return res.json();
}

async function createCustomer(
  businessId: number,
  data: { name: string; email: string; phone?: string; address?: string; currency?: string },
) {
  const token = window.localStorage.getItem('token');
  if (!token) throw new Error('Authentication required.');
  const res = await fetch(`${apiUrl}/businesses/${businessId}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to create customer.');
  }
  return res.json();
}

export default function CustomersPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'NGN',
  });
  const [status, setStatus] = useState({ loading: false, saving: false, error: '' });

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const loadBusinesses = async () => {
      setStatus((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const res = await fetch(`${apiUrl}/businesses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Unable to load businesses.');
        const data = await res.json();
        setBusinesses(data);
        if (data.length && businessId === null) {
          setBusinessId(data[0].id);
        }
      } catch (err) {
        setStatus((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unable to load businesses.',
        }));
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    loadBusinesses();
  }, [businessId, router]);

  useEffect(() => {
    if (businessId === null) {
      setCustomers([]);
      return;
    }

    setStatus((prev) => ({ ...prev, loading: true, error: '' }));
    fetchCustomers(businessId)
      .then((data) => setCustomers(data))
      .catch(() => setStatus((prev) => ({ ...prev, error: 'Unable to load customers.' })))
      .finally(() => setStatus((prev) => ({ ...prev, loading: false })));
  }, [businessId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (businessId === null) {
      setStatus((prev) => ({
        ...prev,
        error: 'Please choose a business before creating a customer.',
      }));
      return;
    }

    setStatus((prev) => ({ ...prev, saving: true, error: '' }));
    try {
      const customer = await createCustomer(businessId, form);
      setCustomers((prev) => [customer, ...prev]);
      setForm({ name: '', email: '', phone: '', address: '', currency: 'NGN' });
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unable to create customer.',
        saving: false,
      }));
      return;
    }
    setStatus((prev) => ({ ...prev, saving: false }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Customer management</h1>
              <p className="mt-2 text-slate-400">
                Track your customer directory for the selected business.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-3 text-sm text-slate-200">
              Business
              <select
                value={businessId ?? ''}
                onChange={(event) => setBusinessId(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
              >
                <option value="" disabled>
                  Select a business
                </option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Currency</span>
                <select
                  value={form.currency}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-300">Address</span>
              <textarea
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                rows={3}
              />
            </label>

            {status.error ? <p className="text-sm text-rose-400">{status.error}</p> : null}

            <button
              type="submit"
              disabled={status.saving}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.saving ? 'Saving customer...' : 'Add customer'}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <h2 className="text-2xl font-semibold">Customer list</h2>
          {status.loading ? (
            <p className="mt-6 text-slate-400">Loading customers...</p>
          ) : customers.length === 0 ? (
            <p className="mt-6 text-slate-400">No customers yet. Add one above.</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{customer.name}</p>
                      <p className="text-sm text-slate-400">{customer.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {customer.currency}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{customer.phone ?? 'No phone'}</p>
                  <p className="mt-1 text-sm text-slate-500">{customer.address ?? 'No address'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
