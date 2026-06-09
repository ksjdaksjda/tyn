// Movie / Book item types
export type ItemType = 'movie' | 'tv' | 'anime' | 'book'
export type ItemStatus = 'want' | 'watching' | 'watched' | 'paused' | 'dropped'

export interface MovieItem {
  id: string
  userId: string
  title: string
  originalTitle?: string
  type: ItemType
  year?: number
  coverUrl?: string
  backdropUrl?: string
  description?: string
  director?: string
  cast?: string[]
  genres?: string[]
  country?: string
  language?: string
  runtime?: number
  rating: number
  tmdbId?: number
  doubanId?: string
  status: ItemStatus
  watchDate?: string
  notes?: string
  tags?: string[]
  // Book-specific
  author?: string
  publisher?: string
  pageCount?: number
  currentPage?: number
  // Video-specific
  playUrls?: PlaySource[]
  currentEpisode?: number
  playbackPosition?: number
  createdAt: string
  updatedAt: string
}

export interface PlaySource {
  name: string
  url: string
  episodes?: Episode[]
}

export interface Episode {
  title: string
  url: string
}

// Review types
export interface Review {
  id: string
  itemId: string
  userId: string
  title: string
  content: string
  rating: number
  isPublic: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  item?: MovieItem
}

// Journal page types
export interface JournalPage {
  id: string
  itemId: string
  userId: string
  title?: string
  elementsJson: string
  paperMode: 'solid' | 'lined' | 'grid' | 'none'
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface JournalElement {
  id: string
  type: 'text' | 'image' | 'drawing'
  x: number
  y: number
  w: number
  h: number
  rotation: number
  zIndex: number
  content?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  bold?: boolean
  italic?: boolean
  src?: string
  imgFilter?: string
}

// Quote types
export interface Quote {
  id: string
  itemId: string
  userId: string
  content: string
  sourceInfo?: string
  createdAt: string
}

// Watch log types
export interface WatchLog {
  id: string
  itemId: string
  userId: string
  watchDate: string
  note?: string
  createdAt: string
}

// Search/Import types
export interface SearchResult {
  source: 'tmdb' | 'douban' | 'novel' | 'video'
  id: string
  title: string
  originalTitle?: string
  type: ItemType
  year?: number
  coverUrl?: string
  description?: string
  rating?: number
  director?: string
  cast?: string[]
  genres?: string[]
  author?: string
  url?: string
}

// User stats
export interface UserStats {
  totalItems: number
  totalMovies: number
  totalTV: number
  totalAnime: number
  totalBooks: number
  totalReviews: number
  totalHours: number
  avgRating: number
  monthlyCounts: Record<string, number>
  genreCounts: Record<string, number>
}
