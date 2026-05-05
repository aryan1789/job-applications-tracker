import { Link } from 'react-router-dom'
import { useTheme } from '../utils/useTheme'

export default function Home() {
  const { isDark } = useTheme()

  const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const border = isDark ? 'border-slate-700' : 'border-slate-200'

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>

      <header className={`border-b ${border} px-6 py-4 flex items-center justify-between`}>
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
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1" />

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
