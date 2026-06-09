import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/lib/api'

export function useSearch(query: string, type = 'all') {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchApi.search(query, type),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 min cache
  })
}
