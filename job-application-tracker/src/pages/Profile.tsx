import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { isDark as themeIsDark } from '../lib/theme'

export default function Profile() {
  const { user } = useAuth()
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
    <div className="max-w-4xl mx-auto">
      <div className={`rounded-xl border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300 text-slate-950'}`}>
        <h1 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
            <div className="mt-1 text-lg font-medium">{user?.email ?? '—'}</div>
          </div>

          <div>
            <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name</label>
            <div className="mt-1 text-lg">{user?.user_metadata?.full_name ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
