// API: /api/items/:id/reviews — Reviews for a specific item

export const onRequestGet = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'

  // Extract item ID from URL: /api/items/{id}/reviews
  const parts = url.pathname.split('/')
  const itemId = parts[parts.length - 2]

  const { results } = await db.prepare(
    'SELECT * FROM reviews WHERE item_id = ? AND user_id = ? ORDER BY created_at DESC'
  ).bind(itemId, userId).all()

  return new Response(JSON.stringify({ reviews: results }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'
  const body = await request.json()

  const parts = url.pathname.split('/')
  const itemId = parts[parts.length - 2]

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.prepare(`
    INSERT INTO reviews (id, item_id, user_id, title, content, rating, is_public, is_archived, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `).bind(id, itemId, userId, body.title, body.content || '', body.rating || 0, now, now).run()

  return new Response(JSON.stringify({ id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPut = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'
  const body = await request.json()

  const parts = url.pathname.split('/')
  const reviewId = parts[parts.length - 1]
  const now = new Date().toISOString()

  await db.prepare(`
    UPDATE reviews SET title=?, content=?, rating=?, updated_at=? WHERE id=? AND user_id=?
  `).bind(body.title, body.content, body.rating || 0, now, reviewId, userId).run()

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestDelete = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'

  const parts = url.pathname.split('/')
  const reviewId = parts[parts.length - 1]

  await db.prepare('DELETE FROM reviews WHERE id = ? AND user_id = ?').bind(reviewId, userId).run()

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
