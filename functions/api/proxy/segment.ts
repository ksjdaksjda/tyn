// API: /api/proxy/segment — TS segment proxy with caching
export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  const targetOrigin = new URL(targetUrl).origin

  // Try Cloudflare cache first
  const cache = caches.default
  const cacheKey = new Request(targetUrl, { method: 'GET' })
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const fetchWithRetry = async (referer: string) => {
    return fetch(targetUrl, {
      headers: {
        'Referer': referer,
        'Origin': targetOrigin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
  }

  // Try with target origin as referer
  let res = await fetchWithRetry(targetOrigin)

  // Retry with alternative referers
  if (!res.ok) {
    res = await fetchWithRetry('https://moontv.022340618.xyz/')
  }
  if (!res.ok) {
    res = await fetchWithRetry('https://vip.dytt-film.com/')
  }

  const response = new Response(res.body, {
    status: res.ok ? 200 : res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'video/mp2t',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })

  if (res.ok) {
    context.waitUntil(cache.put(cacheKey, response.clone()))
  }

  return response
}
