// API client — wraps fetch with auth and error handling
// In development, calls go to local Cloudflare Functions (port 8788)
// In production, relative URLs (same origin) or configured API URL

const API_BASE = import.meta.env.VITE_API_URL || ''

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth-token') || ''
  const userId = localStorage.getItem('user-id') || ''
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {}),
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

// Items API
export const itemsApi = {
  list: (params?: { type?: string; status?: string; q?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.q) searchParams.set('q', params.q)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    return request<{ items: any[] }>(`/api/items?${searchParams.toString()}`)
  },

  get: (id: string) => request<any>(`/api/items/${id}`),

  create: (data: any) =>
    request<{ id: string }>('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<{ success: boolean }>(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/items/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: string) =>
    request<{ success: boolean }>(`/api/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Search API
export const searchApi = {
  search: (q: string, type = 'all') =>
    request<{ results: any[] }>(`/api/search?q=${encodeURIComponent(q)}&type=${type}`),

  tmdb: (q: string) =>
    request<{ results: any[] }>(`/api/search/tmdb?q=${encodeURIComponent(q)}`),

  douban: (q: string, type = 'movie') =>
    request<{ results: any[] }>(`/api/search/douban?q=${encodeURIComponent(q)}&type=${type}`),

  novel: (q: string) =>
    request<{ results: any[] }>(`/api/search/novel?q=${encodeURIComponent(q)}`),

  video: (q: string) =>
    request<{ results: any[] }>(`/api/search/video?q=${encodeURIComponent(q)}`),
}

// Reviews API
export const reviewsApi = {
  list: (params?: { archived?: number }) => {
    const sp = new URLSearchParams()
    if (params?.archived !== undefined) sp.set('archived', String(params.archived))
    return request<{ reviews: any[] }>(`/api/reviews?${sp.toString()}`)
  },

  forItem: (itemId: string) =>
    request<{ reviews: any[] }>(`/api/items/${itemId}/reviews`),

  create: (itemId: string, data: any) =>
    request<{ id: string }>(`/api/items/${itemId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<{ success: boolean }>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/reviews/${id}`, {
      method: 'DELETE',
    }),

  toggleArchive: (id: string) =>
    request<{ success: boolean }>(`/api/reviews/${id}/archive`, { method: 'PATCH' }),

  batchArchive: () =>
    request<{ success: boolean }>('/api/reviews/batch-archive', { method: 'PATCH' }),

  batchRestore: () =>
    request<{ success: boolean }>('/api/reviews/batch-restore', { method: 'PATCH' }),
}

// Stats API
export const statsApi = {
  get: () => request<any>('/api/user/stats'),
}

// Data export/import
export const dataApi = {
  export: () => request<any>('/api/user/export'),
  import: (data: any) =>
    request<any>('/api/user/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
