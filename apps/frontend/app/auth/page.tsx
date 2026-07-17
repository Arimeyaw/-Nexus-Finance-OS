import Link from 'next/link';

export default function AuthIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl">
        <h1 className="text-3xl font-bold">Authentication</h1>
        <div className="mt-8 space-y-4">
          <Link
            href="/auth/login"
            className="block rounded-2xl bg-sky-500 px-4 py-3 text-center font-semibold text-slate-950 hover:bg-sky-400"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="block rounded-2xl border border-slate-700 px-4 py-3 text-center text-white hover:bg-slate-900"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
