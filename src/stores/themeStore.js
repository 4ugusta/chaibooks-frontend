import { create } from 'zustand'

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
  } catch (e) {}
  return 'system'
}

const applyTheme = (theme) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const isDark = document.documentElement.classList.contains('dark')
      const next = isDark ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      applyTheme(next)
      return { theme: next }
    }),
}))
