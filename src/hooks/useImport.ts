import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchApi, itemsApi } from '@/lib/api'
import { sortSources } from '@/lib/utils'

export function useSearch(query: string, type = 'all') {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchApi.search(query, type),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 min cache
  })
}

const MAX_SOURCES = 3
const MAX_EPISODES_PER_SOURCE = 100

function parsePlayUrls(raw: any): any[] {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw || [])
  } catch { return [] }
}

// Re-search sources by item title and merge fresh playUrls into the item.
// Merge policy: replace the line with the same name, append new lines,
// sort by clarity, cap at 3. Progress fields (currentEpisode etc.) untouched.
export function useRefetchSources() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: any) => {
      const q = item.title || ''
      const type = item.type === 'anime' ? 'anime' : 'movie'
      const { results } = await searchApi.search(q, type)
      const candidates = (results || []).filter((r: any) => r && r.episodes?.length > 0)
      if (candidates.length === 0) throw new Error('未找到新片源')

      const target = q.toLowerCase()
      const best = candidates.reduce((best: any, r: any) => {
        const rt = (r.title || '').toLowerCase()
        const score = rt === target ? 3 : rt.includes(target) || target.includes(rt) ? 2 : 1
        return score > (best._score || 0) ? { ...r, _score: score } : best
      }, { _score: 0 })
      if (!best.episodes) throw new Error('未找到新片源')

      const newSource = {
        name: best.source === 'agedm' ? 'agedm' : best.source === 'video' ? '视频源' : '新源',
        episodes: best.episodes.slice(0, MAX_EPISODES_PER_SOURCE),
        fetchedAt: Date.now(),
      }
      const old = parsePlayUrls(item.playUrls).filter((s: any) => s && s.name !== newSource.name)
      const merged = sortSources([newSource, ...old]).slice(0, MAX_SOURCES)
      await itemsApi.update(item.id, { playUrls: merged })
      return merged
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
