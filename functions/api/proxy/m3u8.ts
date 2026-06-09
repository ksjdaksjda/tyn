// API: /api/proxy/m3u8 — HLS manifest proxy with URL rewriting
export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': new URL(targetUrl).origin,
    'Origin': new URL(targetUrl).origin,
  }

  // For moontv URLs, add auth
  if (targetUrl.includes('moontv') || targetUrl.includes('022340618')) {
    const env = context.env || {}
    try {
      const loginRes = await fetch('https://moontv.022340618.xyz/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: env.MOONTV_USER || '', password: env.MOONTV_PASS || '' })
      })
      const cookie = loginRes.headers.get('set-cookie') || ''
      headers['Cookie'] = cookie
    } catch {}
  }

  try {
    const res = await fetch(targetUrl, { headers })
    if (!res.ok) {
      // Retry with different referer
      const retryRes = await fetch(targetUrl, {
        headers: { ...headers, Referer: 'https://moontv.022340618.xyz/' }
      })
      if (!retryRes.ok) {
        return new Response(`Proxy error: ${retryRes.status}`, { status: 502 })
      }
      const text = await retryRes.text()
      const rewritten = rewriteM3u8(text, url.origin)
      return new Response(rewritten, {
        headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=5' }
      })
    }

    const text = await res.text()
    const rewritten = rewriteM3u8(text, url.origin)

    return new Response(rewritten, {
      headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=5' }
    })
  } catch (e: any) {
    return new Response(`Proxy error: ${e.message}`, { status: 502 })
  }
}

function rewriteM3u8(content: string, origin: string): string {
  return content
    .replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
      const trimmed = match.trim()
      const absUrl = trimmed.startsWith('http') ? trimmed : new URL(trimmed, origin).href
      return `${origin}/api/proxy/segment?url=${encodeURIComponent(absUrl)}`
    })
    .replace(/^(?!#)(.+\.m3u8.*)$/gm, (match) => {
      const trimmed = match.trim()
      const absUrl = trimmed.startsWith('http') ? trimmed : new URL(trimmed, origin).href
      return `${origin}/api/proxy/m3u8?url=${encodeURIComponent(absUrl)}`
    })
}
