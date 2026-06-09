// PATCH /api/reviews/:id/archive — Toggle archive status

export const onRequest = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'

  const parts = url.pathname.split('/')
  const reviewId = parts[parts.length - 2] // reviews/{id}/archive

  // Toggle archived status
  const review = await db.prepare('SELECT is_archived FROM reviews WHERE id = ? AND user_id = ?').bind(reviewId, userId).first()
  if (!review) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }

  const newStatus = review.is_archived ? 0 : 1
  await db.prepare('UPDATE reviews SET is_archived = ?, updated_at = ? WHERE id = ? AND user_id = ?')
    .bind(newStatus, new Date().toISOString(), reviewId, userId).run()

  return new Response(JSON.stringify({ success: true, isArchived: !!newStatus }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
