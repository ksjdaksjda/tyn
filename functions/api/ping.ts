// Health check endpoint
export const onRequestGet = () => {
  return new Response(JSON.stringify({ ok: true, time: new Date().toISOString(), version: '1.0.0' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
