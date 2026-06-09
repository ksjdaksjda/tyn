// API client — offline-first with localStorage
// All localStorage access is wrapped in try/catch to prevent data corruption crashes

const API_BASE = import.meta.env.VITE_API_URL || ''
const LS_ITEMS = 'treehole_items'
const LS_REVIEWS = 'treehole_reviews'
const MAX_ITEMS = 500
const MAX_EPISODES = 100

// ---- Safe localStorage helpers ----
function safeGet(key: string, fallback: any = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    // Validate it's the right type
    if (key === LS_ITEMS && !Array.isArray(parsed)) return fallback
    if (key === LS_REVIEWS && !Array.isArray(parsed)) return fallback
    return parsed
  } catch {
    // Corrupted data — clear and recover
    try { localStorage.removeItem(key) } catch {}
    return fallback
  }
}

function safeSet(key: string, value: any) {
  try {
    const json = JSON.stringify(value)
    localStorage.setItem(key, json)
  } catch {
    // Quota exceeded — try trimming
    try {
      if (key === LS_ITEMS && Array.isArray(value)) {
        localStorage.setItem(key, JSON.stringify(value.slice(0, Math.floor(value.length / 2))))
      }
    } catch {}
  }
}

// ---- Trim helpers ----
function trimItemForStorage(item: any): any {
  const trimmed = { ...item }
  // Limit episodes
  if (trimmed.playUrls && Array.isArray(trimmed.playUrls)) {
    trimmed.playUrls = trimmed.playUrls.map((src: any) => ({
      ...src,
      episodes: (src.episodes || []).slice(0, MAX_EPISODES),
    }))
  }
  return trimmed
}

// ---- Items API ----
function getLocalItems(): any[] { return safeGet(LS_ITEMS, []) }
function saveLocalItems(items: any[]) {
  safeSet(LS_ITEMS, items.slice(0, MAX_ITEMS))
}

function getAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'X-User-Id': 'local' }
}

async function request<T>(path: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options?.headers },
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch {
    if (fallback !== undefined) return fallback
    throw new Error('Backend unavailable')
  }
}

export const itemsApi = {
  list: (params?: { type?: string; status?: string; q?: string }): Promise<{ items: any[] }> => {
    let items = getLocalItems()
    if (params?.type) items = items.filter((i: any) => i.type === params.type)
    if (params?.status) items = items.filter((i: any) => i.status === params.status)
    if (params?.q) items = items.filter((i: any) => (i.title || '').toLowerCase().includes(params.q!.toLowerCase()))
    items.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    return request('/api/items', {}, { items }) as any
  },

  get: (id: string) => {
    const item = getLocalItems().find((i: any) => i.id === id) || null
    return request(`/api/items/${id}`, {}, item)
  },

  create: (data: any) => {
    const trimmed = trimItemForStorage(data)
    const items = getLocalItems()
    const newItem = { ...trimmed, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    items.unshift(newItem)
    saveLocalItems(items)
    return request('/api/items', { method: 'POST', body: JSON.stringify(trimmed) }, { id: newItem.id } as any) as any
  },

  update: (id: string, data: any) => {
    const trimmed = trimItemForStorage(data)
    const items = getLocalItems()
    const idx = items.findIndex((i: any) => i.id === id)
    if (idx >= 0) { items[idx] = { ...items[idx], ...trimmed, updatedAt: new Date().toISOString() }; saveLocalItems(items) }
    return request(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(trimmed) }, { success: true } as any) as any
  },

  delete: (id: string) => {
    saveLocalItems(getLocalItems().filter((i: any) => i.id !== id))
    return request(`/api/items/${id}`, { method: 'DELETE' }, { success: true } as any) as any
  },

  updateStatus: (id: string, status: string) => {
    const items = getLocalItems()
    const idx = items.findIndex((i: any) => i.id === id)
    if (idx >= 0) { items[idx].status = status; items[idx].updatedAt = new Date().toISOString(); saveLocalItems(items) }
    return request(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, { success: true } as any) as any
  },
}

// ---- Reviews API ----
function getLocalReviews(): any[] { return safeGet(LS_REVIEWS, []) }
function saveLocalReviews(reviews: any[]) { safeSet(LS_REVIEWS, reviews.slice(0, MAX_ITEMS)) }

export const reviewsApi = {
  list: (params?: { archived?: number }) => {
    let reviews = getLocalReviews()
    if (params?.archived === 1) reviews = reviews.filter((r: any) => r.isArchived)
    else if (params?.archived === 0) reviews = reviews.filter((r: any) => !r.isArchived)
    reviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return request('/api/reviews', {}, { reviews }) as any
  },

  forItem: (itemId: string) => {
    const reviews = getLocalReviews().filter((r: any) => r.itemId === itemId)
    return request(`/api/items/${itemId}/reviews`, {}, { reviews }) as any
  },

  create: (itemId: string, data: any) => {
    const reviews = getLocalReviews()
    const newReview = { ...data, id: crypto.randomUUID(), itemId, userId: 'local', isPublic: false, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    reviews.unshift(newReview)
    saveLocalReviews(reviews)
    return request(`/api/items/${itemId}/reviews`, { method: 'POST', body: JSON.stringify(data) }, { id: newReview.id } as any) as any
  },

  update: (id: string, data: any) => {
    const reviews = getLocalReviews()
    const idx = reviews.findIndex((r: any) => r.id === id)
    if (idx >= 0) { reviews[idx] = { ...reviews[idx], ...data, updatedAt: new Date().toISOString() }; saveLocalReviews(reviews) }
    return request(`/api/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }, { success: true } as any) as any
  },

  delete: (id: string) => {
    saveLocalReviews(getLocalReviews().filter((r: any) => r.id !== id))
    return request(`/api/reviews/${id}`, { method: 'DELETE' }, { success: true } as any) as any
  },

  toggleArchive: (id: string) => {
    const reviews = getLocalReviews()
    const idx = reviews.findIndex((r: any) => r.id === id)
    if (idx >= 0) { reviews[idx].isArchived = !reviews[idx].isArchived; saveLocalReviews(reviews) }
    return request(`/api/reviews/${id}/archive`, { method: 'PATCH' }, { success: true } as any) as any
  },

  batchArchive: () => {
    const reviews = getLocalReviews()
    reviews.forEach((r: any) => { if (!r.isArchived) r.isArchived = true })
    saveLocalReviews(reviews)
    return request('/api/reviews/batch-archive', { method: 'PATCH' }, { success: true } as any) as any
  },

  batchRestore: () => {
    const reviews = getLocalReviews()
    reviews.forEach((r: any) => { if (r.isArchived) r.isArchived = false })
    saveLocalReviews(reviews)
    return request('/api/reviews/batch-restore', { method: 'PATCH' }, { success: true } as any) as any
  },
}

export const searchApi = {
  search: (q: string, type = 'all') => request('/api/search?q=' + encodeURIComponent(q) + '&type=' + type, {}, { results: [] }) as any,
}

export const statsApi = { get: () => request('/api/user/stats', {}, {}) }
export const dataApi = {
  export: () => request('/api/user/export', {}),
  import: (data: any) => request('/api/user/import', { method: 'POST', body: JSON.stringify(data) }),
}
