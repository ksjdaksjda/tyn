// API: /api/proxy/segment — TS segment proxy
import { guardProxyRequest } from './guard'

export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')
  if (!targetUrl) return new Response('Missing url', { status: 400 })

  const guard = guardProxyRequest(context.request, context.env)
  if (guard) return guard

  const cache = caches.default
  const cached = await cache.match(new Request(targetUrl))
  if (cached) return cached

  const fetchOpts: { Referer?: string; Origin?: string }[] = [
    { Referer: 'https://vip.dytt-film.com/', Origin: 'https://vip.dytt-film.com' },
    { Referer: 'https://moontv.022340618.xyz/', Origin: 'https://moontv.022340618.xyz' },
    { Referer: 'https://m.agedm.io/', Origin: 'https://m.agedm.io' },
    {},
  ]

  for (const opts of fetchOpts) {
    try {
      const res = await fetch(targetUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          ...opts,
        },
      })
      if (res.ok) {
        const response = new Response(res.body, {
          headers: {
            'Content-Type': res.headers.get('Content-Type') || 'video/mp2t',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
          },
        })
        context.waitUntil(cache.put(new Request(targetUrl), response.clone()))
        return response
      }
    } catch {}
  }

  return new Response('Blocked', { status: 502 })
}
