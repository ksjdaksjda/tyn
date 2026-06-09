// API: /api/reviews — Reviews CRUD

export const onRequestGet = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'
  const archived = url.searchParams.get('archived')

  let sql = 'SELECT * FROM reviews WHERE user_id = ?'
  const params: any[] = [userId]

  if (archived !== null && archived !== undefined) {
    sql += ' AND is_archived = ?'
    params.push(archived === '1' ? 1 : 0)
  }

  sql += ' ORDER BY created_at DESC'

  const { results } = await db.prepare(sql).bind(...params).all()

  return new Response(JSON.stringify({ reviews: results }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
