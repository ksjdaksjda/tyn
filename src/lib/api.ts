// API client — wraps fetch with auth and error handling
// Offline-first: falls back to localStorage when no backend

const API_BASE = import.meta.env.VITE_API_URL || ''

// localStorage keys
const LS_ITEMS = 'treehole_items'
const LS_REVIEWS = 'treehole_reviews'

function getAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'X-User-Id': 'local' }
}

// Generic request with localStorage fallback
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

// --- Items API (localStorage fallback) ---
function getLocalItems(): any[] {
  try { return JSON.parse(localStorage.getItem(LS_ITEMS) || '[]') } catch { return [] }
}
function saveLocalItems(items: any[]) { localStorage.setItem(LS_ITEMS, JSON.stringify(items)) }

export const itemsApi = {
  list: (params?: { type?: string; status?: string; q?: string }): Promise<{ items: any[] }> => {
    let items = getLocalItems()
    if (params?.type) items = items.filter(i => i.type === params.type)
    if (params?.status) items = items.filter(i => i.status === params.status)
    if (params?.q) items = items.filter(i => i.title?.toLowerCase().includes(params.q!.toLowerCase()))
    items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    return request(`/api/items`, {}, { items }) as any
  },

  get: (id: string) => {
    const item = getLocalItems().find(i => i.id === id) || null
    return request(`/api/items/${id}`, {}, item)
  },

  create: (data: any) => {
    const items = getLocalItems()
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    items.unshift(newItem)
    saveLocalItems(items)
    return request('/api/items', { method: 'POST', body: JSON.stringify(data) }, { id: newItem.id })
  },

  update: (id: string, data: any) => {
    const items = getLocalItems()
    const idx = items.findIndex(i => i.id === id)
    if (idx >= 0) { items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() }; saveLocalItems(items) }
    return request(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }, { success: true })
  },

  delete: (id: string) => {
    saveLocalItems(getLocalItems().filter(i => i.id !== id))
    return request(`/api/items/${id}`, { method: 'DELETE' }, { success: true })
  },

  updateStatus: (id: string, status: string) => {
    const items = getLocalItems()
    const idx = items.findIndex(i => i.id === id)
    if (idx >= 0) { items[idx].status = status; items[idx].updatedAt = new Date().toISOString(); saveLocalItems(items) }
    return request(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, { success: true })
  },
}

// --- Reviews API (localStorage fallback) ---
function getLocalReviews(): any[] {
  try { return JSON.parse(localStorage.getItem(LS_REVIEWS) || '[]') } catch { return [] }
}
function saveLocalReviews(reviews: any[]) { localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews)) }

export const reviewsApi = {
  list: (params?: { archived?: number }) => {
    let reviews = getLocalReviews()
    if (params?.archived === 1) reviews = reviews.filter(r => r.isArchived)
    else if (params?.archived === 0) reviews = reviews.filter(r => !r.isArchived)
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return request('/api/reviews', {}, { reviews })
  },

  forItem: (itemId: string) => {
    const reviews = getLocalReviews().filter(r => r.itemId === itemId)
    return request(`/api/items/${itemId}/reviews`, {}, { reviews })
  },

  create: (itemId: string, data: any) => {
    const reviews = getLocalReviews()
    const newReview = { ...data, id: crypto.randomUUID(), itemId, userId: 'local', isPublic: false, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    reviews.unshift(newReview)
    saveLocalReviews(reviews)
    return request(`/api/items/${itemId}/reviews`, { method: 'POST', body: JSON.stringify(data) }, { id: newReview.id })
  },

  update: (id: string, data: any) => {
    const reviews = getLocalReviews()
    const idx = reviews.findIndex(r => r.id === id)
    if (idx >= 0) { reviews[idx] = { ...reviews[idx], ...data, updatedAt: new Date().toISOString() }; saveLocalReviews(reviews) }
    return request(`/api/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }, { success: true })
  },

  delete: (id: string) => {
    saveLocalReviews(getLocalReviews().filter(r => r.id !== id))
    return request(`/api/reviews/${id}`, { method: 'DELETE' }, { success: true })
  },

  toggleArchive: (id: string) => {
    const reviews = getLocalReviews()
    const idx = reviews.findIndex(r => r.id === id)
    if (idx >= 0) { reviews[idx].isArchived = !reviews[idx].isArchived; saveLocalReviews(reviews) }
    return request(`/api/reviews/${id}/archive`, { method: 'PATCH' }, { success: true })
  },

  batchArchive: () => {
    const reviews = getLocalReviews()
    reviews.forEach(r => { if (!r.isArchived) r.isArchived = true })
    saveLocalReviews(reviews)
    return request('/api/reviews/batch-archive', { method: 'PATCH' }, { success: true })
  },

  batchRestore: () => {
    const reviews = getLocalReviews()
    reviews.forEach(r => { if (r.isArchived) r.isArchived = false })
    saveLocalReviews(reviews)
    return request('/api/reviews/batch-restore', { method: 'PATCH' }, { success: true })
  },
}

export const searchApi = {
  search: (q: string, type = 'all') => request(`/api/search?q=${encodeURIComponent(q)}&type=${type}`, {}, { results: [] }),
}

export const statsApi = { get: () => request('/api/user/stats', {}, {}) }
export const dataApi = {
  export: () => request('/api/user/export', {}),
  import: (data: any) => request('/api/user/import', { method: 'POST', body: JSON.stringify(data) }),
}
