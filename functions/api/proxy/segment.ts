// API: /api/proxy/segment — TS segment proxy with caching

const UPSTREAM = 'https://moontv.022340618.xyz'

export const onRequestGet = async (context: any) => {
  const { request } = context
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // Try Cloudflare cache first
  const cache = caches.default
  const cacheKey = new Request(targetUrl, { method: 'GET' })
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  // Fetch segment
  const res = await fetch(targetUrl, {
    headers: {
      Referer: UPSTREAM,
      'User-Agent': 'Mozilla/5.0',
    },
  })

  // Try with alternative referer on failure
  let response: Response
  if (!res.ok && res.status !== 200) {
    const altRes = await fetch(targetUrl, {
      headers: {
        Referer: 'https://moontv.022340618.xyz/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Origin: UPSTREAM,
      },
    })
    response = new Response(altRes.body, {
      status: altRes.status,
      headers: {
        'Content-Type': altRes.headers.get('Content-Type') || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } else {
    response = new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  // Cache the response
  context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
