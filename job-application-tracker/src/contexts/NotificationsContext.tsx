import { createContext, useContext, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { SyncSuggestion } from '../lib/types'

type NotificationsState = {
  suggestions: SyncSuggestion[]
  addSuggestions: (incoming: SyncSuggestion[]) => void
  acceptSuggestion: (s: SyncSuggestion) => Promise<void>
  declineSuggestion: (s: SyncSuggestion) => void
  refreshTrigger: number
}

const NotificationsContext = createContext<NotificationsState | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<SyncSuggestion[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function addSuggestions(incoming: SyncSuggestion[]) {
    setSuggestions(prev => {
      const existing = new Set(prev.map(s => s.id))
      return [...prev, ...incoming.filter(s => !existing.has(s.id))]
    })
  }

  async function acceptSuggestion(s: SyncSuggestion) {
    await supabase.from('applications').update({ status: s.new_status }).eq('id', s.id)
    setSuggestions(prev => prev.filter(n => n.id !== s.id))
    setRefreshTrigger(t => t + 1)
  }

  function declineSuggestion(s: SyncSuggestion) {
    setSuggestions(prev => prev.filter(n => n.id !== s.id))
  }

  return (
    <NotificationsContext.Provider value={{ suggestions, addSuggestions, acceptSuggestion, declineSuggestion, refreshTrigger }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
