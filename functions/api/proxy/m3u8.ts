// API: /api/proxy/m3u8 — HLS manifest proxy with URL rewriting
// Migrated from original [[path]].js

const UPSTREAM = 'https://moontv.022340618.xyz'

async function ensureLogin(env: any): Promise<string> {
  const sessionCookie = (env as any).__sessionCookie || ''
  if (sessionCookie) return sessionCookie

  const res = await fetch(`${UPSTREAM}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: env.MOONTV_USER || '', password: env.MOONTV_PASS || '' }),
  })
  const cookie = res.headers.get('set-cookie') || ''
  ;(env as any).__sessionCookie = cookie
  return cookie
}

export const onRequestGet = async (context: any) => {
  const { request } = context
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  const cookie = await ensureLogin(context.env)

  const res = await fetch(targetUrl, {
    headers: {
      Cookie: cookie,
      Referer: UPSTREAM,
      'User-Agent': 'Mozilla/5.0',
    },
  })

  if (res.status === 401) {
    context.env.__sessionCookie = ''
    const newCookie = await ensureLogin(context.env)
    const retryRes = await fetch(targetUrl, {
      headers: { Cookie: newCookie, Referer: UPSTREAM, 'User-Agent': 'Mozilla/5.0' },
    })
    const text = await retryRes.text()
    const rewritten = rewriteM3u8(text, url.origin)
    return new Response(rewritten, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const text = await res.text()
  const rewritten = rewriteM3u8(text, url.origin)

  return new Response(rewritten, {
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=10',
    },
  })
}

function rewriteM3u8(content: string, origin: string): string {
  // Rewrite segment URLs to go through our proxy
  return content.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
    const trimmed = match.trim()
    return `${origin}/api/proxy/segment?url=${encodeURIComponent(trimmed)}`
  }).replace(/^(?!#)(.+\.m3u8.*)$/gm, (match) => {
    const trimmed = match.trim()
    return `${origin}/api/proxy/m3u8?url=${encodeURIComponent(trimmed)}`
  })
}
