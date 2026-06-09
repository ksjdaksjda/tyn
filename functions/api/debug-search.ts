// Debug endpoint to test search APIs directly
export const onRequestGet = async (context: any) => {
  const env = context.env || {}
  const q = 'Inception'
  const debug: any = { env_ok: !!env.TMDB_API_KEY, steps: [] }

  // Step 1: TMDB
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${env.TMDB_API_KEY}&query=${q}&language=zh-CN`
    )
    const data: any = await res.json()
    debug.steps.push({ api: 'tmdb', status: res.status, count: data.results?.length || 0, first: data.results?.[0]?.title || 'none' })
  } catch (e: any) {
    debug.steps.push({ api: 'tmdb', error: e.message })
  }

  // Step 2: moontv
  try {
    const loginRes = await fetch('https://moontv.022340618.xyz/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: env.MOONTV_USER || '', password: env.MOONTV_PASS || '' })
    })
    debug.steps.push({ api: 'moontv_login', status: loginRes.status })
    const cookies = loginRes.headers.get('set-cookie') || ''
    const searchRes = await fetch(`https://moontv.022340618.xyz/api/search?q=${q}`, {
      headers: { Cookie: cookies }
    })
    const sData: any = await searchRes.json()
    debug.steps.push({ api: 'moontv_search', status: searchRes.status, count: sData.results?.length || sData.list?.length || 0 })
  } catch (e: any) {
    debug.steps.push({ api: 'moontv', error: e.message })
  }

  return new Response(JSON.stringify(debug, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
