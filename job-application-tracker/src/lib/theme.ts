export function isDark(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
  } catch (e) {
    // ignore
  }
  if (document.documentElement.classList.contains('dark')) return true
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch (e) {
    return false
  }
}

export function setDark(dark: boolean) {
  if (typeof document !== 'undefined') {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }
  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    // notify other listeners in this window
    try {
      // dispatch a custom event so components can sync
      window.dispatchEvent(new CustomEvent('themechange', { detail: dark }))
    } catch (err) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
}

export function toggle() {
  setDark(!isDark())
}
