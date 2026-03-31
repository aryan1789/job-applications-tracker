import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { isDark as themeIsDark, setDark as setThemeDark } from '../lib/theme'
import trackerIcon from '../assets/2936630.png'

type Props = {
  open?: boolean
  onClose?: () => void
}

function getInitial(email?: string) {
  if (!email) return '?'
  return email.trim()[0].toUpperCase()
}

export default function Sidebar({ open = false, onClose }: Props) {
  const { user, signOut } = useAuth()
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => themeIsDark())
  const menuRef = useRef<HTMLDivElement | null>(null)

  const location = useLocation()

  

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    function onTheme(e: Event) {
      try {
        // @ts-ignore
        setIsDark(!!(e as CustomEvent).detail)
      } catch (err) {
        setIsDark(themeIsDark())
      }
    }
    window.addEventListener('themechange', onTheme as EventListener)
    return () => window.removeEventListener('themechange', onTheme as EventListener)
  }, [])

  useEffect(() => {
    setThemeDark(isDark)
  }, [isDark])

  useEffect(() => {
    onClose && onClose()
  }, [location.pathname])

  const base = 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium'
  const active = isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-300 text-slate-950'

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 shadow-md ${
        isDark
          ? 'bg-slate-900 text-slate-100 border-r border-slate-700'
          : 'bg-slate-200 text-slate-950 border-r border-slate-300'
      } ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="px-4 py-6 flex items-center gap-3">
            <div className="flex-none">
              <img
                src={trackerIcon}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-md object-cover"
              />
            </div>

            <div className="flex-1 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">App Tracker</h3>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>Manage applications</p>
              </div>

              <button
                onClick={() => setIsDark((v) => !v)}
                aria-label="Toggle theme"
                className={`inline-flex items-center gap-3 rounded-full border px-2 py-1 shadow-sm hover:shadow transition-all ${
                  isDark
                    ? 'bg-slate-700 text-slate-50 border-slate-600'
                    : 'bg-slate-100 text-slate-950 border-slate-400'
                }`}
                title={isDark ? 'Switch to light' : 'Switch to dark'}
              >
                <span className="sr-only">Toggle theme</span>
                <span className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                  <span className={`h-4 w-4 rounded-full shadow transform transition-transform duration-300 ${isDark ? 'translate-x-5 bg-slate-100' : 'translate-x-1 bg-white'}`} />
                </span>
              </button>
            </div>
          </div>

          <nav className="mt-6 px-3 space-y-1">
            <Link to="/dashboard" className={`${base} ${location.pathname === '/dashboard' ? active : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}>
              <span>Dashboard</span>
            </Link>

            <Link to="/analytics" className={`${base} ${location.pathname === '/analytics' ? active : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}>
              <span>Analytics</span>
            </Link>
          </nav>

          <div className={`mt-6 border-t px-3 pt-4 ${isDark ? 'border-slate-700/50' : 'border-slate-400'}`}>
            <Link to="/settings" className={`${base} ${location.pathname === '/settings' ? active : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}>
              Settings
            </Link>
          </div>
        </div>

        <div className={`p-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-400'}`}>
          <div className="flex items-center justify-between" ref={menuRef}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold overflow-hidden ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-300 text-slate-950'}`}>
                <span>{getInitial(user?.email)}</span>
              </div>

              <div>
                <div className="text-sm font-medium">
                  {user?.user_metadata?.full_name ?? user?.email ?? 'Guest'}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>Member</div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className={`p-1 rounded-md ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {menuOpen && (
                <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg border overflow-hidden z-50 ${
                  isDark
                    ? 'bg-slate-800 text-slate-100 border-slate-700'
                    : 'bg-slate-100 text-slate-950 border-slate-400'
                }`}>
                  <Link to="/profile" className={`block px-3 py-2 text-sm ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-300'}`}>Profile</Link>
                  <button className={`w-full text-left px-3 py-2 text-sm ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-300'}`}>Information</button>
                  <button
                    onClick={() => signOut && signOut()}
                    className={`w-full text-left px-3 py-2 text-sm ${isDark ? 'text-red-400 hover:bg-slate-700' : 'text-red-700 hover:bg-slate-300'}`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
