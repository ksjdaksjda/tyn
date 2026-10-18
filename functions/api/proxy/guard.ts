// Shared origin/referer guard for proxy endpoints (no onRequest export → not a route)
// Prevents the proxy from being abused as an open public proxy.

export function guardProxyRequest(request: Request, env: any): Response | null {
  const allowed = (env.ALLOWED_ORIGINS || '').trim()
  // Local dev default is '*' — skip validation so Vite's proxy (Referer: localhost:5173,
  // Host: 8788) keeps working. In production set a concrete domain to enable the guard.
  if (allowed === '' || allowed === '*') return null

  const allowedList = allowed.split(',').map((s: string) => s.trim()).filter(Boolean)
  const origin = request.headers.get('Origin')
  const referer = request.headers.get('Referer')

  const inList = (value: string | null) => {
    if (!value) return false
    try {
      const u = new URL(value)
      return allowedList.some((a: string) => {
        try { return new URL(a).origin === u.origin } catch { return false }
      })
    } catch { return false }
  }

  const selfOrigin = new URL(request.url).origin
  const refererOk = referer === null || inList(referer) || (() => {
    try { return new URL(referer).origin === selfOrigin } catch { return false }
  })()

  if (origin === null && referer === null) {
    return new Response('Forbidden', { status: 403 })
  }
  if (origin !== null && !inList(origin)) {
    return new Response('Forbidden', { status: 403 })
  }
  if (!refererOk) {
    return new Response('Forbidden', { status: 403 })
  }
  return null
}
