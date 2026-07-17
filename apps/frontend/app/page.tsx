import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-emerald-500/15 px-4 py-1 text-sm font-semibold text-emerald-300">
                Finance OS for African SMEs
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Build smarter payments, payroll, and billing workflows.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                A modern, launch-ready platform combining next-gen frontend UX
                with a secure NestJS backend, PostgreSQL, Prisma, and JWT
                authentication.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  Go to dashboard
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
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Monthly revenue
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    $124.8k
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Invoices
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">42</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-6 sm:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-slate-900/65 p-6">
            <h2 className="text-lg font-semibold text-white">Secure auth</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              JWT login, registration, and session protection with NestJS and
              Prisma.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-slate-900/65 p-6">
            <h2 className="text-lg font-semibold text-white">Fast UI</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Next.js 15 app router with Tailwind CSS and reusable UI
              primitives.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-slate-900/65 p-6">
            <h2 className="text-lg font-semibold text-white">
              Postgres + Prisma
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Database-first data modeling, migrations, and client generation
              ready to run.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
