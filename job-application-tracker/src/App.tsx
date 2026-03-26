import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './contexts/AuthProvider';

export default function App() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  let user = null;
  let loading = true;
  let signOut: (() => void) | undefined = undefined;
  const [authError, setAuthError] = useState<string | null>(null);
  try {
    const auth = useAuth();
    user = auth.user;
    loading = auth.loading;
    signOut = auth.signOut;
  } catch (err: any) {
    setAuthError(err?.message ?? String(err));
  }

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const surface = isDark
    ? 'bg-slate-900 text-slate-100'
    : 'bg-slate-50 text-slate-900';

  const card = isDark
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-slate-200';

  const accent = isDark
    ? 'from-cyan-400 to-sky-500'
    : 'from-amber-400 to-orange-500';

  const mutedText = isDark ? 'text-slate-300' : 'text-slate-600';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${surface}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl border transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
            <span className={`h-2 w-8 rounded-full bg-gradient-to-r ${accent}`} />
            {isDark ? 'Dark mode' : 'Light mode'}
          </div>

          <h1 className="text-3xl font-semibold transition-colors duration-300">Supabase Auth</h1>
          <p className={`mt-3 transition-colors duration-300 ${mutedText}`}>
            {authError ? `Auth error: ${authError}` : 'Loading session...'}
          </p>

          <button
            onClick={() => setIsDark((v) => !v)}
            className="mt-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-50 border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all"
            aria-label="Toggle color mode"
          >
            <span className="inline-flex h-5 w-10 items-center rounded-full bg-slate-300 dark:bg-slate-600 transition-colors duration-300">
              <span
                className={`h-4 w-4 rounded-full bg-white dark:bg-slate-100 shadow transform transition-transform duration-300 ${
                  isDark ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </span>
            <span className="text-sm font-semibold">
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${surface}`}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className={`p-8 rounded-2xl shadow-xl border transition-colors duration-300 ${card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                <span className={`h-2 w-8 rounded-full bg-gradient-to-r ${accent}`} />
                {isDark ? 'Dark mode' : 'Light mode'}
              </div>

              <h1 className="text-3xl font-semibold transition-colors duration-300">
                Supabase Auth
              </h1>
              <p className={`mt-3 transition-colors duration-300 ${mutedText}`}>
                Email/password and Google OAuth test page.
              </p>
            </div>

            <button
              onClick={() => setIsDark((v) => !v)}
              className="inline-flex items-center gap-3 rounded-full border px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-50 border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all"
              aria-label="Toggle color mode"
            >
              <span className="inline-flex h-5 w-10 items-center rounded-full bg-slate-300 dark:bg-slate-600 transition-colors duration-300">
                <span
                  className={`h-4 w-4 rounded-full bg-white dark:bg-slate-100 shadow transform transition-transform duration-300 ${
                    isDark ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </span>
              <span className="text-sm font-semibold">
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </span>
            </button>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h2 className="text-xl font-semibold mb-2">You are signed in</h2>
                <p className={mutedText}>
                  Signed in as: <span className="font-medium">{user.email}</span>
                </p>
              </div>

              <button
                onClick={() => signOut?.()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 hover:bg-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Login />
              </div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Signup />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}