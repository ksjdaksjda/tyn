// Round 3: Try HTML-based search + desktop API
export const onRequestGet = async () => {
  const q = '辉夜'
  const encoded = encodeURIComponent(q)
  const results: any[] = []
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

  // Try desktop domain
  for (const domain of ['m.agedm.io', 'www.agedm.io', 'agedm.io']) {
    try {
      const r = await fetch(`https://${domain}/`, { headers: { 'User-Agent': ua } })
      results.push({ domain, status: r.status, body: (await r.text()).slice(0, 300) })
    } catch (e: any) { results.push({ domain, error: e.message }) }
  }

  // Try to find API from main page JS
  try {
    const r = await fetch('https://m.agedm.io/', { headers: { 'User-Agent': ua } })
    const html = await r.text()
    // Look for any config or API reference
    const matches = html.match(/(?:api|baseURL|domain|host|server)['"]?\s*[:=]\s*['"]([^'"]+)['"]/gi) || []
    const scriptSrcs = html.match(/<script[^>]*src="([^"]*)"[^>]*>/gi)?.map((s: string) => s.match(/src="([^"]*)"/)?.[1]) || []
    results.push({ source: 'main-page', apiRefs: matches.slice(0, 10), scripts: scriptSrcs.slice(0, 10) })
  } catch (e: any) {}

  // Try alternate search paths
  const searchPaths = [
    `/index/search?keyword=${encoded}`,
    `/vod/search?keyword=${encoded}`,
    `/index.php/search?keyword=${encoded}`,
    `/api.php?action=search&keyword=${encoded}`,
    `/search.php?keyword=${encoded}`,
  ]
  for (const path of searchPaths) {
    try {
      const r = await fetch(`https://m.agedm.io${path}`, { headers: { 'User-Agent': ua, 'Accept': 'application/json, text/html' } })
      results.push({ path, status: r.status, type: r.headers.get('content-type')?.slice(0, 50) })
      if (r.status === 200) {
        const t = await r.text()
        results[results.length-1].body = t.slice(0, 400)
      }
    } catch (e: any) {}
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
