import { create } from 'zustand'
import { type ThemeId, getStoredTheme, applyTheme } from '@/lib/themes'

interface ThemeState {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))

// Initialize theme on load
applyTheme(getStoredTheme())
