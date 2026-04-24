import { useEffect, useRef, useState } from 'react'
import { CgSidebarOpen } from 'react-icons/cg'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { setDark as setThemeDark } from '../lib/theme'
import trackerIcon from '../assets/2936630.png'
import { useTheme } from '../utils/useTheme'

type Props = {
  open?: boolean
  collapsed?: boolean
  onClose?: () => void
  onToggleCollapse?: () => void
}

function getInitial(user?: { email?: string; user_metadata?: { full_name?: string } } | null) {
  const name = user?.user_metadata?.full_name ?? user?.email
  if (!name) return '?'
  return name.trim()[0].toUpperCase()
}

export default function Sidebar({ open = false, collapsed = false, onClose, onToggleCollapse }: Props) {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, setIsDark } = useTheme()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  const hover = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-300'
  const navItem = `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${hover}`
  const activeClass = isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-300 text-slate-950'
  const menuItem = `w-full text-left px-3 py-2.5 text-sm ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`
  const avatar = `rounded-full flex items-center justify-center font-semibold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-300 text-slate-950'}`

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => { setThemeDark(isDark) }, [isDark])
  useEffect(() => { onClose?.() }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 shadow-md
        ${isDark ? 'bg-slate-900 text-slate-100 border-r border-slate-700' : 'bg-slate-200 text-slate-950 border-r border-slate-300'}
        ${open ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'md:-translate-x-full' : 'md:translate-x-0'}`}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className={`px-3 py-3 flex justify-end border-b ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
            <button onClick={onToggleCollapse} className={`hidden md:flex p-1.5 rounded-md ${hover}`}>
              <CgSidebarOpen size={22} />
            </button>
          </div>

          <div className="px-4 py-5 flex items-center gap-3">
            <img src={trackerIcon} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-md object-cover" />
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div>
                <h3 className="text-lg font-semibold leading-tight">App Tracker</h3>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>Manage applications</p>
              </div>
              <button
                onClick={() => setIsDark(v => !v)}
                className={`inline-flex items-center rounded-full border px-2 py-1 shadow-sm ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-400'}`}
              >
                <span className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                  <span className={`h-4 w-4 rounded-full shadow transition-transform duration-300 ${isDark ? 'translate-x-5 bg-slate-100' : 'translate-x-1 bg-white'}`} />
                </span>
              </button>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            <Link to="/dashboard" className={`${navItem} ${isActive('/dashboard') ? activeClass : ''}`}>Dashboard</Link>
            <Link to="/analytics" className={`${navItem} ${isActive('/analytics') ? activeClass : ''}`}>Analytics</Link>
          </nav>

          <div className={`mt-6 border-t px-3 pt-4 ${isDark ? 'border-slate-700/50' : 'border-slate-400'}`}>
            <Link to="/settings" className={`${navItem} ${isActive('/settings') ? activeClass : ''}`}>Settings</Link>
          </div>
        </div>

        <div className={`border-t ${isDark ? 'border-slate-700/50' : 'border-slate-400'}`} ref={menuRef}>
          {menuOpen && (
            <div className={`mx-2 mb-1 rounded-lg border shadow-lg overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center gap-3 px-3 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <div className={`h-8 w-8 text-sm shrink-0 ${avatar}`}>{getInitial(user)}</div>
              )}
                <div>
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name ?? user?.email ?? 'Guest'}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Member</p>
                </div>
              </div>

              <Link to="/profile" className={`block ${menuItem}`}>Profile</Link>
              <button className={menuItem}>Settings</button>

              <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />

              <button onClick={() => signOut?.()} className={`${menuItem} ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Log out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${hover}`}
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <div className={`h-9 w-9 shrink-0 ${avatar}`}>{getInitial(user)}</div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium">{user?.user_metadata?.full_name ?? user?.email ?? 'Guest'}</p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Member</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}
