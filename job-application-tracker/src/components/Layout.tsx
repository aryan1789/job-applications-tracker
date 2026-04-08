import { useEffect, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import { isDark as themeIsDark } from '../lib/theme'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => themeIsDark())

  useEffect(() => {
    function onTheme(e: Event) {
      try {
        // @ts-ignore - custom event detail is boolean
        setIsDark(!!(e as CustomEvent).detail)
      } catch (err) {
        setIsDark(themeIsDark())
      }
    }
    window.addEventListener('themechange', onTheme as EventListener)
    return () => window.removeEventListener('themechange', onTheme as EventListener)
  }, [])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-950'}`}>
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="md:pl-64">
        <header className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-300 bg-slate-200/70'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className={`p-2 rounded-md md:hidden ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <h2
              className={`!m-0 !text-lg !font-semibold !leading-snug tracking-tight ${
                isDark ? '!text-slate-100' : '!text-slate-950'
              }`}
            >
              App Tracker
            </h2>
          </div>

          <div className="text-sm text-slate-500"> </div>
        </header>

        <main className="p-3">{children}</main>
      </div>
    </div>
  )
}
