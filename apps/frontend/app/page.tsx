import Link from 'next/link';

const highlightCards = [
  {
    title: 'Instant payment links',
    text: 'Share branded checkout links in seconds to collect funds from customers across Ghana and beyond.',
  },
  {
    title: 'AI-ready reporting',
    text: 'Monitor revenue, expenses, and cash flow from a single executive dashboard.',
  },
  {
    title: 'Payroll built-in',
    text: 'Automate salary runs, batches, and payout visibility for your growing team.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1 text-sm font-semibold text-cyan-300">
                Premium finance OS for African SMEs
              </span>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Run your business with banking-grade clarity.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Nexus Finance OS now brings together invoicing, multi-currency payments, expense
                controls, payroll workflows, and executive reporting in one elegant platform.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Open dashboard
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft">
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                      Cash position
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">GHS 248.4k</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                    +18.2%
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Invoices</p>
                    <p className="mt-2 text-2xl font-semibold text-white">124</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Employees</p>
                    <p className="mt-2 text-2xl font-semibold text-white">18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {highlightCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-white/10 bg-slate-900/65 p-6"
            >
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{card.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
