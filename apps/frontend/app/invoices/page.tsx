'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchBusinesses() {
  const token = window.localStorage.getItem('token');
  if (!token) throw new Error('Authentication required.');
  const res = await fetch(`${apiUrl}/businesses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Unable to load businesses.');
  return res.json();
}

async function fetchInvoices(businessId: number) {
  const token = window.localStorage.getItem('token');
  if (!token) throw new Error('Authentication required.');
  const res = await fetch(`${apiUrl}/businesses/${businessId}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Unable to load invoices.');
  return res.json();
}

async function createInvoice(
  businessId: number,
  data: {
    customerId: number;
    amount: number;
    dueDate: string;
    description?: string;
  },
) {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/businesses/${businessId}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to create invoice.');
  }
  return res.json();
}

async function createPaymentLink(
  businessId: number,
  payload: { invoiceId: number; amount: number; currency: string; description?: string },
) {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/businesses/${businessId}/payments/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to create payment link.');
  }
  return res.json();
}

export default function InvoicesPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState(0);
  const [amount, setAmount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [status, setStatus] = useState({ loading: false, saving: false, error: '' });
  const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);

  const pendingInvoiceCount = useMemo(
    () =>
      invoices.filter(
        (invoice) => invoice.status !== 'PAID' && invoice.payments?.[0]?.status === 'PENDING',
      ).length,
    [invoices],
  );

  const loadInvoices = useCallback(async () => {
    if (businessId === null) {
      setInvoices([]);
      return;
    }

    setStatus((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await fetchInvoices(businessId);
      setInvoices(data);
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unable to load invoices.',
      }));
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [businessId]);

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const loadBusinesses = async () => {
      setStatus((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const data = await fetchBusinesses();
        setBusinesses(data);
        if (businessId === null && data.length) {
          setBusinessId(data[0].id);
        }
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unable to load businesses.',
        }));
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    loadBusinesses();
  }, [businessId, router]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    if (!invoices.length || pendingInvoiceCount === 0) {
      return;
    }

    const interval = window.setInterval(loadInvoices, 10000);
    return () => window.clearInterval(interval);
  }, [invoices, pendingInvoiceCount, loadInvoices]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (businessId === null) {
      setStatus({ loading: false, saving: false, error: 'Please select a business first.' });
      return;
    }

    setStatus({ loading: false, saving: true, error: '' });

    try {
      const invoice = await createInvoice(businessId, {
        customerId,
        amount: Number(amount),
        dueDate,
        description: description || undefined,
      });
      setInvoices((prev) => [invoice, ...prev]);
      setCustomerId(0);
      setAmount('0');
      setDueDate('');
      setDescription('');
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Unable to create invoice.',
      }));
      return;
    }

    setStatus((prev) => ({ ...prev, saving: false }));
  };

  const handlePayInvoice = async (invoice: any) => {
    if (invoice.status === 'PAID') {
      return;
    }

    if (businessId === null) {
      setStatus((prev) => ({
        ...prev,
        error: 'Please select a business before initiating a payment.',
      }));
      return;
    }

    setPayingInvoiceId(invoice.id);
    try {
      if (invoice.payments?.[0]?.status === 'PENDING' && invoice.payments[0].paymentLink) {
        window.location.href = invoice.payments[0].paymentLink;
        return;
      }

      const payment = await createPaymentLink(businessId, {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.business?.currency ?? 'NGN',
        description: invoice.description || `Invoice payment #${invoice.id}`,
      });
      window.location.href = payment.paymentLink;
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unable to initiate payment.',
      }));
    } finally {
      setPayingInvoiceId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Invoice management</h1>
              <p className="mt-2 text-slate-400">
                Create invoices and send customers to Moolre for payment.
              </p>
            </div>
            <div className="flex items-center gap-3">
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
              <Link
                href="/payments"
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500"
              >
                View payments
              </Link>
            </div>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Customer ID</span>
                <input
                  type="number"
                  value={customerId}
                  onChange={(event) => setCustomerId(Number(event.target.value))}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Amount</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Due date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Description</span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>
            </div>

            {status.error ? <p className="text-sm text-rose-400">{status.error}</p> : null}

            <button
              type="submit"
              disabled={status.saving}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.saving ? 'Saving invoice...' : 'Create invoice'}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">Invoices</h2>
            <p className="text-sm text-slate-400">Latest invoices and payment status.</p>
          </div>

          {status.loading ? (
            <p className="mt-6 text-slate-400">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="mt-6 text-slate-400">No invoices yet. Create one above.</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {invoices.map((invoice) => {
                const latestPayment = invoice.payments?.[0];
                return (
                  <div
                    key={invoice.id}
                    className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">Invoice #{invoice.id}</p>
                        <p className="text-sm text-slate-400">
                          Customer: {invoice.customer?.name || invoice.customerId}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          Invoice: {invoice.status}
                        </span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          Payment: {latestPayment?.status ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <p className="text-sm text-slate-400">Amount: {invoice.amount}</p>
                      <p className="text-sm text-slate-400">Due: {invoice.dueDate?.slice(0, 10)}</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {invoice.description || 'No description provided.'}
                    </p>
                    {latestPayment ? (
                      <p className="mt-3 text-sm text-slate-400">
                        Reference: {latestPayment.paymentReference}
                      </p>
                    ) : null}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-400">
                        Currency: {invoice.business?.currency ?? 'NGN'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePayInvoice(invoice)}
                        disabled={payingInvoiceId === invoice.id || invoice.status === 'PAID'}
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {invoice.status === 'PAID'
                          ? 'Already paid'
                          : payingInvoiceId === invoice.id
                            ? 'Redirecting...'
                            : latestPayment?.status === 'PENDING'
                              ? 'Complete payment'
                              : 'Pay invoice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
