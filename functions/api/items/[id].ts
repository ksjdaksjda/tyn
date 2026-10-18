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

  // Whitelist: body key → DB column. Unknown keys (e.g. txtContent) are silently ignored.
  // JSON columns are stringified; everything else binds as-is.
  const columnMap: Record<string, { col: string; json?: boolean }> = {
    title: { col: 'title' },
    originalTitle: { col: 'original_title' },
    type: { col: 'type' },
    year: { col: 'year' },
    coverUrl: { col: 'cover_url' },
    backdropUrl: { col: 'backdrop_url' },
    description: { col: 'description' },
    director: { col: 'director' },
    cast: { col: 'cast', json: true },
    genres: { col: 'genres', json: true },
    country: { col: 'country' },
    language: { col: 'language' },
    runtime: { col: 'runtime' },
    rating: { col: 'rating' },
    tmdbId: { col: 'tmdb_id' },
    doubanId: { col: 'douban_id' },
    status: { col: 'status' },
    watchDate: { col: 'watch_date' },
    notes: { col: 'notes' },
    tags: { col: 'tags', json: true },
    author: { col: 'author' },
    publisher: { col: 'publisher' },
    pageCount: { col: 'page_count' },
    currentPage: { col: 'current_page' },
    playUrls: { col: 'play_urls', json: true },
    currentEpisode: { col: 'current_episode' },
    playbackPosition: { col: 'playback_position' },
  }

  // Dynamic SET — only update keys actually present in the body, so partial
  // updates (progress save, source refresh) never clobber other fields.
  const sets: string[] = []
  const values: any[] = []
  for (const [key, { col, json }] of Object.entries(columnMap)) {
    if (key in body && body[key] !== undefined) {
      sets.push(`${col}=?`)
      values.push(json ? JSON.stringify(body[key] ?? null) : body[key])
    }
  }
  sets.push('updated_at=?')
  values.push(now, id, userId)

  await db.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id=? AND user_id=?`).bind(...values).run()

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
