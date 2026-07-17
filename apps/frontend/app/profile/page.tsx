'use client';

import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchProfile() {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Unable to load profile.');
  return res.json();
}

async function updateProfile(data: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
}) {
  const token = window.localStorage.getItem('token');
  const res = await fetch(`${apiUrl}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to update profile.');
  }
  return res.json();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', avatarUrl: '', bio: '', timezone: '' });
  const [status, setStatus] = useState({ loading: true, saving: false, error: '' });

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name ?? '',
          phone: data.phone ?? '',
          avatarUrl: data.avatarUrl ?? '',
          bio: data.bio ?? '',
          timezone: data.timezone ?? '',
        });
      })
      .catch(() => setStatus((prev) => ({ ...prev, error: 'Unable to load profile.' })))
      .finally(() => setStatus((prev) => ({ ...prev, loading: false })));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, saving: true, error: '' }));
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      setStatus((prev) => ({ ...prev, saving: false }));
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Update failed.',
      }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          <h1 className="text-3xl font-semibold">Profile</h1>
          <p className="mt-2 text-slate-400">
            Manage your account details and contact information.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 shadow-soft">
          {status.loading ? (
            <p className="text-slate-400">Loading profile...</p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Phone</span>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-slate-300">Avatar URL</span>
                <input
                  value={form.avatarUrl}
                  onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  rows={4}
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Timezone</span>
                <input
                  value={form.timezone}
                  onChange={(event) => setForm({ ...form, timezone: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>

              {status.error ? <p className="text-sm text-rose-400">{status.error}</p> : null}

              <button
                type="submit"
                disabled={status.saving}
                className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.saving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
