import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../utils/useTheme'

export default function Home() {
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-950'}`}>
      <div className="max-w-4xl mx-auto px-6 pt-20">
        <h1 className="text-4xl font-extrabold text-center mb-8">Jobs Dashboard</h1>

        <div className="flex items-center justify-center gap-6 mb-8">
          <Link to="/login" className="px-8 py-3 rounded-lg bg-indigo-600 text-white text-lg hover:bg-indigo-700">Sign in</Link>
          <Link to="/signup" className={`px-8 py-3 rounded-lg text-lg ${isDark ? 'border border-slate-600 text-slate-100' : 'border text-slate-900'}`}>Get started</Link>
        </div>

        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} text-center`}>
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
