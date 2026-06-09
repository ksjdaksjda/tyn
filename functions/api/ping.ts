// Health check + debug endpoint
export const onRequestGet = (context: any) => {
  const env = context.env || {}
  return new Response(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    version: '1.0.0',
    env: {
      tmdb: !!env.TMDB_API_KEY,
      moontv_user: !!env.MOONTV_USER,
      moontv_pass: !!env.MOONTV_PASS,
    }
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
