import React, { useEffect, useState } from 'react';

export default function App() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

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
  const accent = isDark ? 'from-cyan-400 to-sky-500' : 'from-amber-400 to-orange-500';

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${surface}`}>
      <div className={`p-8 rounded-2xl shadow-xl border transition-colors duration-300 ${card}`}>
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
          <span className={`h-2 w-8 rounded-full bg-gradient-to-r ${accent}`} />
          {isDark ? 'Dark mode' : 'Light mode'}
        </div>

        <h1 className="text-3xl font-semibold transition-colors duration-300">Tailwind Theme Toggle</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 transition-colors duration-300">
          Tap the switch to flip the whole page theme.
        </p>

        <button
          onClick={() => setIsDark((v) => !v)}
          className="mt-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-50 border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all"
          aria-label="Toggle color mode"
        >
          <span
            className="inline-flex h-5 w-10 items-center rounded-full bg-slate-300 dark:bg-slate-600 transition-colors duration-300"
          >
            <span
              className={`h-4 w-4 rounded-full bg-white dark:bg-slate-100 shadow transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </span>
          <span className="text-sm font-semibold">{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
        </button>
      </div>
    </div>
  );
}
