// 树洞本地播放代理 — 从你家宽带出口抓取片源（家庭 IP 不被片源站封锁）
// 用法：node proxy-server.mjs   （默认端口 9090）
// 可选环境变量：PORT、PROXY_TOKEN（设置了 token 则请求必须带 ?t=<token>）
import http from 'node:http'

const PORT = parseInt(process.env.PORT || '9090', 10)
const TOKEN = process.env.PROXY_TOKEN || ''

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const fetchOptsList = [
  { Referer: 'https://vip.dytt-film.com/', Origin: 'https://vip.dytt-film.com' },
  { Referer: 'https://moontv.022340618.xyz/', Origin: 'https://moontv.022340618.xyz' },
  { Referer: 'https://www.dytt.com/', Origin: 'https://www.dytt.com' },
  { Referer: 'https://m.agedm.io/', Origin: 'https://m.agedm.io' },
  {},
]

async function fetchUpstream(targetUrl) {
  for (const opts of fetchOptsList) {
    try {
      const res = await fetch(targetUrl, {
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'zh-CN,zh;q=0.9', ...opts },
      })
      if (res.ok) return res
    } catch { /* try next */ }
  }
  return null
}

function rewriteM3u8(content, origin, targetUrl) {
  try {
    return content.split('\n').map((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return line
      const uri = trimmed.split(/\s+/)[0]
      if (uri.includes(',')) return line
      let absolute
      try { absolute = new URL(uri, targetUrl).toString() } catch { return line }
      let pathname = ''
      try { pathname = new URL(absolute).pathname } catch {}
      const isManifest = pathname.toLowerCase().endsWith('.m3u8')
      const proxyBase = isManifest ? `${origin}/m3u8?url=` : `${origin}/segment?url=`
      const tokenPart = TOKEN ? `&t=${encodeURIComponent(TOKEN)}` : ''
      const indent = line.slice(0, line.length - trimmed.length)
      return `${indent}${proxyBase}${encodeURIComponent(absolute)}${tokenPart}`
    }).join('\n')
  } catch {
    return content
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    ...headers,
  })
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (req.method === 'OPTIONS') return send(res, 204, null)

  if (url.pathname === '/ping') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' })

  if (TOKEN && url.searchParams.get('t') !== TOKEN) return send(res, 403, 'Forbidden')

  if (url.pathname === '/m3u8') {
    const targetUrl = url.searchParams.get('url')
    if (!targetUrl) return send(res, 400, 'Missing url')
    const upstream = await fetchUpstream(targetUrl)
    if (!upstream) return send(res, 502, 'All sources blocked')
    const text = await upstream.text()
    const rewritten = rewriteM3u8(text, `http://127.0.0.1:${PORT}`, targetUrl)
    return send(res, 200, rewritten, { 'Content-Type': 'application/vnd.apple.mpegurl' })
  }

  if (url.pathname === '/segment') {
    const targetUrl = url.searchParams.get('url')
    if (!targetUrl) return send(res, 400, 'Missing url')
    const upstream = await fetchUpstream(targetUrl)
    if (!upstream) return send(res, 502, 'Blocked')
    const buf = Buffer.from(await upstream.arrayBuffer())
    return send(res, 200, buf, { 'Content-Type': upstream.headers.get('Content-Type') || 'video/mp2t' })
  }

  send(res, 404, 'Not found')
})

server.listen(PORT, () => {
  console.log(`🌳 树洞本地代理已启动: http://127.0.0.1:${PORT}`)
  console.log('   前端会自动检测并走这个代理（播放页），保持窗口开启即可')
})
