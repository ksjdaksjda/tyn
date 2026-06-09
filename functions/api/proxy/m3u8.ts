// API: /api/proxy/m3u8 — HLS manifest proxy
export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')
  if (!targetUrl) return new Response('Missing url', { status: 400 })

  const fetchOpts = [
    { Referer: 'https://vip.dytt-film.com/', Origin: 'https://vip.dytt-film.com' },
    { Referer: 'https://moontv.022340618.xyz/', Origin: 'https://moontv.022340618.xyz' },
    { Referer: 'https://www.dytt.com/', Origin: 'https://www.dytt.com' },
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
        const rewritten = rewriteM3u8(text, url.origin)
        return new Response(rewritten, {
          headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=5' }
        })
      }
    } catch {}
  }

  return new Response('All sources blocked', { status: 502 })
}

function rewriteM3u8(content: string, origin: string): string {
  return content
    .replace(/^(?!#)(.+\.ts.*)$/gm, (m) => `${origin}/api/proxy/segment?url=${encodeURIComponent(m.trim())}`)
    .replace(/^(?!#)(.+\.m3u8.*)$/gm, (m) => `${origin}/api/proxy/m3u8?url=${encodeURIComponent(m.trim())}`)
}
