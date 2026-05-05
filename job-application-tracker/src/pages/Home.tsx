import { Link } from 'react-router-dom'
import { useTheme } from '../utils/useTheme'

export default function Home() {
  const { isDark } = useTheme()

  const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-950'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-lg mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-3">Jobs Dashboard</h1>
        <p className={`${muted} mb-2`}>
          A simple way to track every job you apply to — status, notes, and follow-ups all in one place.
        </p>
        <ul className={`${muted} text-sm list-disc list-inside mb-8 space-y-1`}>
          <li>Log applications and track their status</li>
          <li>Keep notes on interviews and contacts</li>
          <li>See your activity over time with analytics</li>
        </ul>

        <div className="flex gap-3">
          <Link to="/signup" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">
            Get started
          </Link>
          <Link
            to="/login"
            className={`px-5 py-2 rounded-lg text-sm ${isDark ? 'border border-slate-600 text-slate-200' : 'border text-slate-800'}`}
          >
            Sign in
          </Link>
        </div>

        <div className={`mt-16 text-xs ${muted}`}>
          <span>Jobs Dashboard</span>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="underline">Privacy</Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="underline">Terms</Link>
        </div>
      </div>
    </div>
  )
}
