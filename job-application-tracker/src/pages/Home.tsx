import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../utils/useTheme'

export default function Home() {
  const { isDark } = useTheme()

  const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const border = isDark ? 'border-slate-700' : 'border-slate-200'

  const features = [
    {
      icon: '📋',
      title: 'Track Every Application',
      desc: 'Log jobs you\'ve applied to and keep all the details — company, role, date, and status — in one organised list.',
    },
    {
      icon: '📊',
      title: 'Monitor Your Progress',
      desc: 'See at a glance how many applications are active, in interview, or closed so you always know where you stand.',
    },
    {
      icon: '🔔',
      title: 'Stay on Top of Follow-ups',
      desc: 'Never miss a deadline or forget to follow up with built-in reminders and status updates.',
    },
    {
      icon: '📈',
      title: 'Analytics & Insights',
      desc: 'Visualise your job search with charts that show your application activity and success rate over time.',
    },
  ]

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* Header */}
      <header className={`border-b ${border} px-6 py-4 flex items-center justify-between max-w-5xl mx-auto`}>
        <span className="font-extrabold text-xl tracking-tight">Jobs Dashboard</span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-extrabold mb-5 leading-tight">
          Track your job applications<br />
          <span className="text-indigo-500">all in one place</span>
        </h1>
        <p className={`text-lg ${muted} max-w-xl mx-auto mb-10`}>
          Jobs Dashboard is a free tool that helps job seekers organise every application, follow up at the right time, and stay on top of their entire job search — from first application to final offer.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white text-base font-semibold hover:bg-indigo-700"
          >
            Start tracking for free
          </Link>
          <Link
            to="/login"
            className={`px-8 py-3 rounded-lg text-base font-semibold border ${isDark ? 'border-slate-600 text-slate-200 hover:border-slate-400' : 'border-slate-300 text-slate-700 hover:border-slate-500'}`}
          >
            Sign in
          </Link>
        </div>
        <p className={`text-sm ${muted}`}>No credit card required · Free to use</p>
      </main>

      {/* What it does */}
      <section className={`border-t ${border} py-16`}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need to manage your job search</h2>
          <p className={`text-center ${muted} mb-12 max-w-xl mx-auto`}>
            Jobs Dashboard gives you a clear overview of every role you've applied for, so nothing falls through the cracks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`rounded-xl border ${cardBg} p-6`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                <p className={`text-sm ${muted}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your job search?</h2>
          <p className={`${muted} mb-8`}>Create a free account and start tracking your applications today.</p>
          <Link
            to="/signup"
            className="inline-block px-10 py-3 rounded-lg bg-indigo-600 text-white text-base font-semibold hover:bg-indigo-700"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${border} py-6 text-center text-sm ${muted}`}>
        <span className="font-medium">Jobs Dashboard</span>
        <span className="mx-2">·</span>
        <Link to="/privacy" className="underline hover:text-indigo-500">Privacy Policy</Link>
        <span className="mx-2">·</span>
        <Link to="/terms" className="underline hover:text-indigo-500">Terms of Use</Link>
      </footer>

    </div>
  )
}
