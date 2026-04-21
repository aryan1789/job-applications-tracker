import { useEffect, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import { isDark as themeIsDark } from '../lib/theme'
import { CgSidebarOpen } from 'react-icons/cg'
import { IoMdNotifications, IoMdNotificationsOutline } from 'react-icons/io'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(() => themeIsDark())

  useEffect(() => {
    function onTheme(e: Event) {
      try {
        setIsDark(!!(e as CustomEvent).detail)
      } catch {
        setIsDark(themeIsDark())
      }
    }
    window.addEventListener('themechange', onTheme as EventListener)
    return () => window.removeEventListener('themechange', onTheme as EventListener)
  }, [])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-950'}`}>
      <Sidebar open={mobileOpen} collapsed={collapsed} onClose={() => setMobileOpen(false)} onToggleCollapse={() => setCollapsed(true)} />

      <div className={`transition-all duration-300 ${collapsed ? 'md:pl-0' : 'md:pl-64'}`}>
        <header className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-300 bg-slate-200/70'}`}>
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`p-2 rounded-md md:hidden ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Expand button — only visible on desktop when sidebar is collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className={`hidden md:flex p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'}`}
                aria-label="Expand sidebar"
              >
                <CgSidebarOpen size={22} style={{ transform: 'scaleX(-1)' }} />
              </button>
            )}

            <h2 className={`!m-0 !text-lg !font-semibold !leading-snug tracking-tight ${isDark ? '!text-slate-100' : '!text-slate-950'}`}>
              App Tracker
            </h2>
          </div>

          <button
            aria-label="Notifications"
            className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300'}`}
          >
            {false ? <IoMdNotifications size={22} /> : <IoMdNotificationsOutline size={22} />}
          </button>
        </header>

        <main className="p-2">{children}</main>
      </div>
    </div>
  )
}
