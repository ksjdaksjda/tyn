// API: /api/search — Unified search (TMDB + Douban + novel sites + video sources)
// GET /api/search?q=<query>&type=movie|book|all

const TMDB_BASE = 'https://api.themoviedb.org/3'
const DOUBAN_SEARCH = 'https://www.douban.com/search'

interface SearchResult {
  source: 'tmdb' | 'douban' | 'novel' | 'video'
  id: string
  title: string
  originalTitle?: string
  type: string
  year?: number
  coverUrl?: string
  description?: string
  rating?: number
  director?: string
  cast?: string[]
  genres?: string[]
  author?: string
  url?: string
  episodes?: any[]
}

async function searchTMDB(query: string, type: string, apiKey: string): Promise<SearchResult[]> {
  if (!apiKey) return []

  const tmdbType = type === 'book' ? '' : type === 'tv' ? 'tv' : type === 'movie' ? 'movie' : 'multi'
  const endpoint = tmdbType === 'multi'
    ? `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&language=zh-CN&page=1`
    : `${TMDB_BASE}/search/${tmdbType}?query=${encodeURIComponent(query)}&language=zh-CN&page=1`

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const data = await res.json()

    return (data.results || []).slice(0, 10).map((item: any) => ({
      source: 'tmdb' as const,
      id: `tmdb-${item.id}`,
      title: item.title || item.name || '',
      originalTitle: item.original_title || item.original_name || '',
      type: item.media_type === 'tv' ? 'tv' : item.media_type === 'movie' ? 'movie' : type,
      year: item.release_date ? new Date(item.release_date).getFullYear() : item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
      coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
      description: item.overview,
      rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
    }))
  } catch {
    return []
  }
}

async function searchDouban(query: string, type: string): Promise<SearchResult[]> {
  // Douban search via page parsing (Worker proxy)
  const cat = type === 'book' ? '1001' : '1002' // 1001=book, 1002=movie
  try {
    const res = await fetch(`${DOUBAN_SEARCH}?cat=${cat}&q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    const html = await res.text()

    // Simple regex-based parsing (production would use HTMLRewriter)
    const results: SearchResult[] = []
    const itemRegex = /<div class="result"[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="title"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?<span class="rating_nums">([^<]*)<\/span>[\s\S]*?<p>([^<]*)<\/p>/g
    let match
    while ((match = itemRegex.exec(html)) !== null && results.length < 10) {
      results.push({
        source: 'douban',
        id: `douban-${match[1]}`,
        title: match[3].trim(),
        type: type === 'book' ? 'book' : 'movie',
        coverUrl: match[2],
        rating: parseFloat(match[4]) || undefined,
        description: match[5].trim().slice(0, 200),
        url: match[1],
      })
    }
    return results
  } catch {
    return []
  }
}

async function searchVideoSource(query: string): Promise<SearchResult[]> {
  // Search upstream video API (moontv)
  try {
    const upstreamUrl = 'https://moontv.022340618.xyz'
    // Login first
    const loginRes = await fetch(`${upstreamUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sond', password: '123456' }),
    })
    const cookies = loginRes.headers.get('set-cookie') || ''

    const searchRes = await fetch(`${upstreamUrl}/api/search?q=${encodeURIComponent(query)}`, {
      headers: { Cookie: cookies },
    })
    const data = await searchRes.json()

    return (data.results || []).slice(0, 10).map((item: any) => {
      // Parse episodes from vod_play_url
      let episodes: any[] = []
      if (item.vod_play_url) {
        const parts = item.vod_play_url.split('$$$')
        episodes = parts.map((part: string) => {
          const [label, url] = part.includes('$') ? part.split('$') : [part, part]
          return { title: label, url }
        })
      }

      return {
        source: 'video' as const,
        id: `video-${item.vod_id}`,
        title: item.vod_name,
        type: item.type_name?.includes('动漫') ? 'anime' : item.type_name?.includes('剧') ? 'tv' : 'movie',
        year: item.vod_year ? parseInt(item.vod_year) : undefined,
        coverUrl: item.vod_pic,
        description: item.vod_remarks,
        episodes,
      }
    })
  } catch {
    return []
  }
}

async function searchNovel(query: string): Promise<SearchResult[]> {
  // Search novel sites (69shu, biquge, etc.)
  const sources = [
    {
      name: '69书吧',
      url: `https://www.69shuba.com/search?keyword=${encodeURIComponent(query)}`,
    },
    {
      name: '全本小说网',
      url: `https://www.quanben.io/search.html?keyword=${encodeURIComponent(query)}`,
    },
  ]

  const results: SearchResult[] = []
  for (const source of sources) {
    try {
      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      })
      const html = await res.text()

      // Simple regex for common novel site patterns
      const itemRegex = /<a[^>]*href="([^"]*\/book\/[^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([^<]*)<\/p>/gi
      let match
      while ((match = itemRegex.exec(html)) !== null && results.length < 5) {
        results.push({
          source: 'novel',
          id: `novel-${match[1]}`,
          title: match[3].trim(),
          type: 'book',
          coverUrl: match[2],
          author: match[4].trim(),
          url: match[1],
        })
      }
    } catch {
      // Skip failed sources
    }
  }
  return results
}

export const onRequestGet = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''
  const type = url.searchParams.get('type') || 'all'

  if (!query.trim()) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = env.TMDB_API_KEY || ''

  // Parallel search across all sources
  const searchPromises: Promise<SearchResult[]>[] = []

  if (type === 'all' || type === 'movie' || type === 'tv') {
    searchPromises.push(searchTMDB(query, type, apiKey))
    searchPromises.push(searchDouban(query, 'movie'))
    searchPromises.push(searchVideoSource(query))
  }
  if (type === 'all' || type === 'book') {
    searchPromises.push(searchDouban(query, 'book'))
    searchPromises.push(searchNovel(query))
  }

  const allResults = await Promise.all(searchPromises)
  const results = allResults.flat()

  // Deduplicate by title similarity
  const seen = new Set<string>()
  const deduped = results.filter(r => {
    const key = r.title.toLowerCase().replace(/\s+/g, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return new Response(JSON.stringify({ results: deduped }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
