// PATCH /api/reviews/batch-archive — Batch archive all non-archived reviews
// PATCH /api/reviews/batch-restore — Batch restore all archived reviews

export const onRequest = async (context: any) => {
  const { request, env } = context
  const url = new URL(request.url)
  const db = env.DB
  const userId = request.headers.get('X-User-Id') || 'default'
  const now = new Date().toISOString()

  const isRestore = url.pathname.includes('restore')
  const newStatus = isRestore ? 0 : 1

  await db.prepare(
    'UPDATE reviews SET is_archived = ?, updated_at = ? WHERE user_id = ? AND is_archived = ?'
  ).bind(newStatus, now, userId, isRestore ? 1 : 0).run()

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
