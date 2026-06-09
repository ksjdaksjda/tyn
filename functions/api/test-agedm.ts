// Round 2: Try more API patterns
export const onRequestGet = async () => {
  const q = '辉夜大小姐'
  const results: any[] = []
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://m.agedm.io/', 'Accept': 'application/json' }

  const patterns = [
    `/api/v1/search?keyword=`, `/api/v2/search?keyword=`, `/api/anime/search?keyword=`,
    `/api/anime/list?keyword=`, `/api/search/list?keyword=`, `/api/resource/search?keyword=`,
  ]
  for (const p of patterns) {
    try {
      const r = await fetch(`https://m.agedm.io${p}${encodeURIComponent(q)}`, { headers })
      results.push({ pattern: p, status: r.status })
      if (r.status === 200) {
        const d = await r.text()
        results[results.length-1].body = d.slice(0, 500)
      }
    } catch (e: any) { results.push({ pattern: p, error: e.message }) }
  }

  // Try POST search
  try {
    const r = await fetch('https://m.agedm.io/api/search', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: q })
    })
    results.push({ pattern: 'POST /api/search', status: r.status, body: (await r.text()).slice(0, 300) })
  } catch (e: any) { results.push({ pattern: 'POST /api/search', error: e.message }) }

  // Try scraping the homepage for JS bundle URLs that might reveal the API
  try {
    const r = await fetch('https://m.agedm.io/', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await r.text()
    const jsFiles = html.match(/src="([^"]+\.js[^"]*)"/g) || []
    results.push({ pattern: 'JS files', files: jsFiles.slice(0, 10) })
  } catch (e: any) {}

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
