// API: /api/items — Movie/Book CRUD operations

export const onRequestGet = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB

  // Get user ID from auth header (placeholder — will use Better Auth session)
  const userId = request.headers.get('X-User-Id') || 'default'
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')
  const query = url.searchParams.get('q')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
  const offset = (page - 1) * limit

  let sql = 'SELECT * FROM items WHERE user_id = ?'
  const params: any[] = [userId]

  if (type && type !== 'all') {
    sql += ' AND type = ?'
    params.push(type)
  }
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }
  if (query) {
    sql += ' AND (title LIKE ? OR original_title LIKE ?)'
    params.push(`%${query}%`, `%${query}%`)
  }

  sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await db.prepare(sql).bind(...params).all()

  return new Response(JSON.stringify({ items: results }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'
  const body = await request.json()

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.prepare(`
    INSERT INTO items (id, user_id, title, original_title, type, year, cover_url,
      backdrop_url, description, director, cast, genres, country, language,
      runtime, rating, tmdb_id, douban_id, status, watch_date, notes, tags,
      author, publisher, page_count, play_urls, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, userId, body.title, body.originalTitle, body.type, body.year, body.coverUrl,
    body.backdropUrl, body.description, body.director, JSON.stringify(body.cast),
    JSON.stringify(body.genres), body.country, body.language,
    body.runtime, body.rating || 0, body.tmdbId, body.doubanId,
    body.status || 'want', body.watchDate, body.notes, JSON.stringify(body.tags),
    body.author, body.publisher, body.pageCount, JSON.stringify(body.playUrls), now, now,
  ).run()

  return new Response(JSON.stringify({ id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
