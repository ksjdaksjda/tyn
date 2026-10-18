// API: /api/proxy/m3u8 — HLS manifest proxy
import { guardProxyRequest } from './guard'

export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')
  if (!targetUrl) return new Response('Missing url', { status: 400 })

  const guard = guardProxyRequest(context.request, context.env)
  if (guard) return guard

  // Short-lived manifest cache — preloading and rewatching hit here (Cache API
  // still costs an invocation but skips the upstream fetch + rewrite work).
  const cache = caches.default
  const cacheKey = new Request(targetUrl)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const fetchOpts: { Referer?: string; Origin?: string }[] = [
    { Referer: 'https://vip.dytt-film.com/', Origin: 'https://vip.dytt-film.com' },
    { Referer: 'https://moontv.022340618.xyz/', Origin: 'https://moontv.022340618.xyz' },
    { Referer: 'https://www.dytt.com/', Origin: 'https://www.dytt.com' },
    { Referer: 'https://m.agedm.io/', Origin: 'https://m.agedm.io' },
    {},
  ]

  for (const opts of fetchOpts) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          ...opts,
        },
      })
      if (res.ok) {
        const text = await res.text()
        const rewritten = rewriteM3u8(text, url.origin, targetUrl)
        const response = new Response(rewritten, {
          headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=5' }
        })
        context.waitUntil(cache.put(cacheKey, response.clone(), { expirationTtl: 60 }))
        return response
      }
    } catch {}
  }

  return new Response('All sources blocked', { status: 502 })
}

function rewriteM3u8(content: string, origin: string, targetUrl: string): string {
  // Line-based rewrite. Handles: leading whitespace, extension-less segments,
  // relative URIs (resolved against the manifest URL), query strings, byte-range
  // lists. Lines starting with # (tags incl. EXT-X-KEY/EXT-X-MAP) pass through.
  try {
    return content.split('\n').map((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return line

      // First token is the URI; the rest are attributes (e.g. seg.ts?token=x #comment)
      const uri = trimmed.split(/\s+/)[0]
      // Byte-range lists or unusual constructs — leave untouched
      if (uri.includes(',')) return line

      let absolute: string
      try {
        absolute = new URL(uri, targetUrl).toString()
      } catch { return line }

      let pathname = ''
      try { pathname = new URL(absolute).pathname } catch {}
      const isManifest = pathname.toLowerCase().endsWith('.m3u8')

      const proxyBase = isManifest ? `${origin}/api/proxy/m3u8?url=` : `${origin}/api/proxy/segment?url=`
      const indent = line.slice(0, line.length - trimmed.length)
      return `${indent}${proxyBase}${encodeURIComponent(absolute)}`
    }).join('\n')
  } catch {
    // Never break playback with a bad rewrite — serve the original manifest
    return content
  }
}
