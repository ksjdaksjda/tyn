// API: /api/search — TMDB search proxy
export const onRequestGet = async (context: any) => {
  try {
    const { request, env } = context
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const type = url.searchParams.get('type') || 'all'
    const apiKey = env.TMDB_API_KEY || ''

    if (!q.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    let results: any[] = []

    // TMDB search
    if (apiKey && (type === 'all' || type === 'movie' || type === 'tv')) {
      try {
        const tmdbType = type === 'tv' ? 'tv' : type === 'movie' ? 'movie' : 'multi'
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=zh-CN&page=1`
        )
        const data: any = await tmdbRes.json()
        if (data.results) {
          results.push(...data.results.slice(0, 10).map((item: any) => ({
            source: 'tmdb',
            id: `tmdb-${item.id}`,
            title: item.title || item.name || '',
            originalTitle: item.original_title || item.original_name || '',
            type: item.media_type === 'tv' ? 'tv' : 'movie',
            year: item.release_date ? new Date(item.release_date).getFullYear() : item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
            coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
            description: item.overview?.slice(0, 200),
            rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
          })))
        }
      } catch (e: any) {}
    }

    // Video source search (moontv)
    if (type === 'all' || type === 'movie' || type === 'tv') {
      try {
        const upUser = env.MOONTV_USER || ''
        const upPass = env.MOONTV_PASS || ''
        const loginRes = await fetch('https://moontv.022340618.xyz/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: upUser, password: upPass })
        })
        const cookies = loginRes.headers.get('set-cookie') || ''
        const searchRes = await fetch(`https://moontv.022340618.xyz/api/search?q=${encodeURIComponent(q)}`, {
          headers: { Cookie: cookies }
        })
        const data: any = await searchRes.json()
        const moontvResults = data.results || data.list || data.data || []
        if (moontvResults.length > 0) {
          results.push(...moontvResults.slice(0, 10).map((item: any) => {
            let episodes: any[] = []
            if (item.vod_play_url) {
              episodes = item.vod_play_url.split('$$$').map((part: string) => {
                const [label, u] = part.includes('$') ? part.split('$') : [part, part]
                return { title: label, url: u }
              })
            }
            return {
              source: 'video',
              id: `video-${item.vod_id}`,
              title: item.vod_name,
              type: (item.type_name || '').includes('动漫') ? 'anime' : (item.type_name || '').includes('剧') ? 'tv' : 'movie',
              year: item.vod_year ? parseInt(item.vod_year) : undefined,
              coverUrl: item.vod_pic,
              description: item.vod_remarks,
              episodes,
            }
          }))
        }
      } catch (e: any) {}
    }

    // Deduplicate by title — prefer results with episodes (video sources)
    const titleMap = new Map<string, any>()
    for (const r of results) {
      const key = r.title?.toLowerCase().replace(/\s+/g, '')
      if (!key) continue
      const existing = titleMap.get(key)
      // Keep the one with episodes, or the first one
      if (!existing || (r.episodes?.length > 0 && !existing.episodes?.length)) {
        titleMap.set(key, r)
      }
    }
    results = Array.from(titleMap.values())

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ results: [], error: e.message, stack: e.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}
