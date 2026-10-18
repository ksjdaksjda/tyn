import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---- Source ranking — used to prefer higher-clarity play sources ----

// Score a source name by clarity markers (higher = clearer)
export function rankSourceName(name?: string): number {
  const n = (name || '').toLowerCase()
  if (/4k|2160|uhd|超高清/.test(n)) return 4
  if (/1080|蓝光|bd|blu-?ray|超清|fhd/.test(n)) return 3
  if (/720|高清|hd/.test(n)) return 2
  if (/标清|sd|480|360/.test(n)) return 0
  return 1 // unknown — treat as plain
}

// Stable sort: clarity first, keep original order within the same score
export function sortSources<T extends { name?: string }>(sources: T[]): T[] {
  return sources
    .map((s, i) => ({ s, i, score: rankSourceName(s.name) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ s }) => s)
}
