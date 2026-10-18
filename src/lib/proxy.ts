// Proxy base resolution — Cloudflare proxy by default, optional local proxy override.
// The video-source CDNs block Cloudflare datacenter IPs; a local proxy
// (node proxy-server.mjs, port 9090) exits from the home IP which is not blocked.

const LS_PROXY_BASE = 'treehole_proxy_base'

function normalizeBase(base: string): string {
  return base.trim().replace(/\/+$/, '')
}

// Explicit override (e.g. "https://xxx.trycloudflare.com" or "http://192.168.1.5:9090")
export function setProxyBase(base: string) {
  try { localStorage.setItem(LS_PROXY_BASE, base) } catch {}
}
export function getProxyBase(): string {
  try { return normalizeBase(localStorage.getItem(LS_PROXY_BASE) || '') } catch { return '' }
}

// Resolve the proxy base to use for playback:
// 1. localStorage override wins
// 2. auto-detect a local proxy on 127.0.0.1:9090 (fast fail, ~1.5s)
// 3. fall back to Cloudflare ('' → same-origin /api/proxy)
export async function resolveProxyBase(): Promise<string> {
  const override = getProxyBase()
  if (override) return override
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 1500)
    const res = await fetch('http://127.0.0.1:9090/ping', { signal: ctrl.signal })
    clearTimeout(timer)
    if (res.ok) return 'http://127.0.0.1:9090'
  } catch { /* no local proxy running */ }
  return ''
}

export function proxyUrl(raw: string, base: string): string {
  if (base) return `${base}/m3u8?url=${encodeURIComponent(raw)}`
  return `/api/proxy/m3u8?url=${encodeURIComponent(raw)}`
}
