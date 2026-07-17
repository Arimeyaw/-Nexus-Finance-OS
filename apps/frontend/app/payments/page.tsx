'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchBusinesses() {
  const token = window.localStorage.getItem('token');
  if (!token) throw new Error('Authentication required.');
  const res = await fetch(`${apiUrl}/businesses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unable to load businesses.');
  return res.json();
}

async function fetchPayments(businessId: number) {
  const token = window.localStorage.getItem('token');
  if (!token) throw new Error('Authentication required.');
  const res = await fetch(`${apiUrl}/businesses/${businessId}/payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unable to load payments.');
  return res.json();
}

export default function PaymentsPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError('');
    fetchBusinesses()
      .then((list) => {
        setBusinesses(list);
        setBusinessId((prevBusinessId) =>
          prevBusinessId === null && list.length ? list[0].id : prevBusinessId,
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load businesses.'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (businessId === null) {
      setPayments([]);
      return;
    }

    setLoading(true);
    setError('');
    fetchPayments(businessId)
      .then((data) => setPayments(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load payments.'))
      .finally(() => setLoading(false));
  }, [businessId]);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Payments</h1>
              <p className="mt-2 text-slate-400">
                Review recent payments, payment status, and invoice reconciliation data.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-3 text-sm text-slate-200">
                Business ID: {businessId}
              </div>
              <Link
                href="/reconciliation"
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500"
              >
                Reconciliation
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
              <label className="block text-sm text-slate-300">Business</label>
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
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <h2 className="text-2xl font-semibold">Recent payments</h2>
          {loading ? (
            <p className="mt-6 text-slate-400">Loading payments...</p>
          ) : error ? (
            <p className="mt-6 text-rose-400">{error}</p>
          ) : payments.length === 0 ? (
            <p className="mt-6 text-slate-400">No payments found for this business.</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">Payment #{payment.id}</p>
                      <p className="text-sm text-slate-400">
                        Reference: {payment.paymentReference}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {payment.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <p className="text-sm text-slate-400">Amount: {payment.amount}</p>
                    <p className="text-sm text-slate-400">
                      Customer: {payment.customer?.name || payment.customerId}
                    </p>
                    <p className="text-sm text-slate-400">
                      Invoice: #{payment.invoice?.id ?? payment.invoiceId}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Payment ID: {payment.moolrePaymentId}
                  </p>
                  <a
                    href={payment.paymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Open payment link
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
