// Test endpoint — probes agedm.io API patterns and returns raw responses
export const onRequestGet = async () => {
  const q = '辉夜大小姐'
  const results: any[] = []

  // Pattern 1: /api/search
  try {
    const r = await fetch(`https://m.agedm.io/api/search?keyword=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://m.agedm.io/', 'Accept': 'application/json' }
    })
    const d = await r.text()
    results.push({ pattern: '/api/search', status: r.status, type: r.headers.get('content-type'), body: d.slice(0, 300) })
  } catch (e: any) { results.push({ pattern: '/api/search', error: e.message }) }

  // Pattern 2: /search
  try {
    const r = await fetch(`https://m.agedm.io/search?keyword=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://m.agedm.io/' }
    })
    const d = await r.text()
    results.push({ pattern: '/search', status: r.status, type: r.headers.get('content-type'), body: d.slice(0, 300) })
  } catch (e: any) { results.push({ pattern: '/search', error: e.message }) }

  // Pattern 3: Just the homepage to see what framework it uses
  try {
    const r = await fetch('https://m.agedm.io/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const html = await r.text()
    // Extract API hints from HTML
    const apiHints = html.match(/(?:api|search|keyword)[^"'\s]*/gi) || []
    results.push({ pattern: 'homepage', status: r.status, apiHints: [...new Set(apiHints)].slice(0, 20), body: html.slice(0, 200) })
  } catch (e: any) { results.push({ pattern: 'homepage', error: e.message }) }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
