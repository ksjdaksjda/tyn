export const THEMES = [
  { id: 'ocean', name: '海洋', icon: '🌊', colors: ['#2a9db8', '#5cc0a0'] },
  { id: 'spring', name: '春樱', icon: '🌸', colors: ['#d87898', '#c8a86a'] },
  { id: 'starry', name: '星空', icon: '🌌', colors: ['#a080e0', '#60a0d8'] },
  { id: 'dusk', name: '日落', icon: '🌅', colors: ['#c88040', '#d87860'] },
  { id: 'forest', name: '森林', icon: '🌲', colors: ['#4a8a3a', '#8a9a40'] },
  { id: 'rain', name: '静雨', icon: '🌧️', colors: ['#4878a0', '#7088a8'] },
  { id: 'autumn', name: '秋枫', icon: '🍂', colors: ['#c87830', '#a86840'] },
  { id: 'polar', name: '极光', icon: '🌌', colors: ['#5888b0', '#7898b8'] },
] as const

export type ThemeId = typeof THEMES[number]['id']

export function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem('movie-tracker-theme')
  if (stored && THEMES.some(t => t.id === stored)) {
    return stored as ThemeId
  }
  return 'ocean'
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('movie-tracker-theme', theme)
}
