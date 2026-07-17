'use client';

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

export default function ReconciliationPage() {
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
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load reconciliation data.'),
      )
      .finally(() => setLoading(false));
  }, [businessId]);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Reconciliation</h1>
              <p className="mt-2 text-slate-400">
                Match invoice payments to invoices and confirm settled amounts.
              </p>
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
          <h2 className="text-2xl font-semibold">Payment reconciliation</h2>
          {loading ? (
            <p className="mt-6 text-slate-400">Loading reconciliation data...</p>
          ) : error ? (
            <p className="mt-6 text-rose-400">{error}</p>
          ) : payments.length === 0 ? (
            <p className="mt-6 text-slate-400">No payments found for this business.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 rounded-3xl border border-slate-800 bg-slate-950/80">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Reconciliation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payments.map((payment) => {
                    const reconciled =
                      payment.invoice?.status === 'PAID' && payment.status === 'COMPLETED';
                    return (
                      <tr key={payment.id} className="hover:bg-slate-900/60">
                        <td className="px-6 py-4 text-sm text-slate-200">
                          #{payment.invoice?.id ?? payment.invoiceId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200">
                          {payment.paymentReference}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200">{payment.amount}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">
                          {payment.customer?.name || payment.customerId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200">{payment.status}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-100">
                          {reconciled ? 'Matched' : 'Pending'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
