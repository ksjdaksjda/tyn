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
        const moontvResults = data?.list || data?.results || data?.data || []
        if (moontvResults.length > 0) {
          results.push(...moontvResults.slice(0, 10).map((item: any) => {
            // moontv new API format: title, poster, episodes[], source, year, desc, type_name, douban_id
            let episodes: {title:string,url:string}[] = []
            if (Array.isArray(item.episodes)) {
              episodes = item.episodes.map((ep: any, i: number) => {
                if (typeof ep === 'string') return { title: `第${i+1}集`, url: ep }
                return { title: ep.title || ep.name || `第${i+1}集`, url: ep.url || ep }
              })
            } else if (item.vod_play_url) {
              episodes = item.vod_play_url.split('$$$').map((part: string) => {
                const [label, u] = part.includes('$') ? part.split('$') : [part, part]
                return { title: label, url: u }
              })
            }
            const vidTitle = item.title || item.vod_name || item.name || ''
            const vidType = (item.type_name || item.class || '').includes('动漫') ? 'anime' :
                           (item.type_name || item.class || '').includes('剧') ? 'tv' : 'movie'
            const totalEps = episodes.length
            const chunkSize = 75
            const chunks = totalEps > chunkSize
              ? Array.from({ length: Math.ceil(totalEps / chunkSize) }, (_, i) => ({
                  label: `第${i * chunkSize + 1}-${Math.min((i + 1) * chunkSize, totalEps)}集`,
                  episodes: episodes.slice(i * chunkSize, (i + 1) * chunkSize),
                }))
              : null

            return {
              source: 'video',
              id: `video-${item.id || item.vod_id || ''}`,
              title: vidTitle,
              type: vidType,
              year: item.year || (item.vod_year ? parseInt(item.vod_year) : undefined),
              coverUrl: item.poster || item.cover || item.pic || item.vod_pic || item.img,
              description: item.desc || item.description || item.vod_remarks || item.remarks,
              episodes,
              totalEpisodes: totalEps,
              chunks, // null if ≤75, array of {label, episodes} if >75
            }
          }))
        }
      } catch (e: any) {}
    }

    // Anime source search (agedm.io — try multiple API patterns)
    if (type === 'all' || type === 'movie' || type === 'tv' || type === 'anime') {
      const apiPatterns = [
        `https://m.agedm.io/api/search?keyword=${encodeURIComponent(q)}`,
        `https://m.agedm.io/api/v1/search?keyword=${encodeURIComponent(q)}`,
        `https://m.agedm.io/search?keyword=${encodeURIComponent(q)}`,
      ]
      for (const apiUrl of apiPatterns) {
        try {
          const agedmRes = await fetch(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://m.agedm.io/', 'Accept': 'application/json' }
          })
          if (!agedmRes.ok) continue
          const agedmData: any = await agedmRes.json()
          // Try all possible data paths
          const animeList = agedmData?.data?.list || agedmData?.data?.results || agedmData?.data
            || agedmData?.list || agedmData?.results || agedmData || []
          if (Array.isArray(animeList) && animeList.length > 0) {
            results.push(...animeList.slice(0, 20).map((item: any) => {
              const episodes = (item.playList || item.episodes || item.list || []).map((ep: any, i: number) => ({
                title: ep.title || ep.name || `第${i + 1}集`,
                url: ep.url || ep.src || ep.link || ep.playUrl || '',
              }))
              const totalEps = episodes.length || item.totalEpisodes || item.epCount || 0
              return {
                source: 'agedm',
                id: `agedm-${item.id || item.aid || item.animeId || ''}`,
                title: item.title || item.name || item.animeTitle || '',
                type: 'anime',
                year: item.year ? parseInt(item.year) : undefined,
                coverUrl: item.pic || item.cover || item.img || item.poster || item.image || '',
                description: (item.desc || item.description || item.summary || '').slice(0, 200),
                genres: item.tags || item.types || item.genres || [],
                episodes,
                totalEpisodes: totalEps > 0 ? totalEps : episodes.length,
                chunks: null,
              }
            }))
            break // Found results, stop trying other patterns
          }
        } catch (e: any) { /* continue to next pattern */ }
      }
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
