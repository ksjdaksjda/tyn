// API: /api/items/:id — Single item CRUD

export const onRequestGet = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'

  // Extract ID from URL path
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]

  const item = await db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?').bind(id, userId).first()

  if (!item) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }

  // Parse JSON fields
  if (item.cast) item.cast = JSON.parse(item.cast)
  if (item.genres) item.genres = JSON.parse(item.genres)
  if (item.tags) item.tags = JSON.parse(item.tags)
  if (item.play_urls) item.play_urls = JSON.parse(item.play_urls)

  return new Response(JSON.stringify(item), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPut = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'
  const body = await request.json()

  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]
  const now = new Date().toISOString()

  const existing = await db.prepare('SELECT id FROM items WHERE id = ? AND user_id = ?').bind(id, userId).first()
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }

  await db.prepare(`
    UPDATE items SET title=?, original_title=?, type=?, year=?, cover_url=?, backdrop_url=?,
      description=?, director=?, cast=?, genres=?, country=?, language=?, runtime=?,
      rating=?, tmdb_id=?, douban_id=?, status=?, watch_date=?, notes=?, tags=?,
      author=?, publisher=?, page_count=?, current_page=?, play_urls=?,
      current_episode=?, playback_position=?, updated_at=?
    WHERE id=? AND user_id=?
  `).bind(
    body.title, body.originalTitle, body.type, body.year, body.coverUrl, body.backdropUrl,
    body.description, body.director, JSON.stringify(body.cast), JSON.stringify(body.genres),
    body.country, body.language, body.runtime, body.rating || 0, body.tmdbId, body.doubanId,
    body.status, body.watchDate, body.notes, JSON.stringify(body.tags),
    body.author, body.publisher, body.pageCount, body.currentPage || 0,
    JSON.stringify(body.playUrls), body.currentEpisode || 1, body.playbackPosition || 0,
    now, id, userId,
  ).run()

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestDelete = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'

  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]

  await db.prepare('DELETE FROM items WHERE id = ? AND user_id = ?').bind(id, userId).run()

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
