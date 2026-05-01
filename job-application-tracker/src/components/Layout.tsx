import { useEffect, useRef, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import { CgSidebarOpen } from 'react-icons/cg'
import { IoMdNotifications, IoMdNotificationsOutline } from 'react-icons/io'
import { FiCheck, FiX } from 'react-icons/fi'
import { useTheme } from '../utils/useTheme'
import { useNotifications } from '../contexts/NotificationsContext'
import { STATUS_LABELS, type JobStatus } from '../lib/types'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { isDark } = useTheme()
  const { suggestions, acceptSuggestion, declineSuggestion } = useNotifications()
  const notifRef = useRef<HTMLDivElement>(null)
  const hasNotifs = suggestions.length > 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen(v => !v)}
              className={`relative p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300'}`}
            >
              {hasNotifs ? <IoMdNotifications size={22} className="text-indigo-400" /> : <IoMdNotificationsOutline size={22} />}
              {hasNotifs && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {suggestions.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`px-4 py-3 border-b text-sm font-semibold ${isDark ? 'border-slate-700 text-slate-100' : 'border-slate-200 text-slate-800'}`}>
                  Email sync suggestions
                </div>

                {suggestions.length === 0 ? (
                  <p className={`px-4 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No pending suggestions.
                  </p>
                ) : (
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-700/30">
                    {suggestions.map(s => (
                      <div key={s.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.company}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.role}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                              {STATUS_LABELS[s.old_status as JobStatus]}
                            </span>
                            {' → '}
                            <span className="font-semibold text-indigo-400">
                              {STATUS_LABELS[s.new_status as JobStatus]}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => acceptSuggestion(s)}
                            title="Accept"
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          >
                            <FiCheck size={13} />
                          </button>
                          <button
                            onClick={() => declineSuggestion(s)}
                            title="Decline"
                            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isDark ? 'bg-slate-600 hover:bg-slate-500 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="p-2">{children}</main>
      </div>
    </div>
  )
}
