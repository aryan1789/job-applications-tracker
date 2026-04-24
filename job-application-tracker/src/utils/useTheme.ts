import { useEffect, useState } from 'react'
import { isDark as themeIsDark } from '../lib/theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => themeIsDark())

  useEffect(() => {
    function onTheme(e: Event) {
      try { setIsDark(!!(e as CustomEvent).detail) }
      catch { setIsDark(themeIsDark()) }
    }
    window.addEventListener('themechange', onTheme as EventListener)
    return () => window.removeEventListener('themechange', onTheme as EventListener)
  }, [])

  return { isDark, setIsDark }
}
