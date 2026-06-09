import { useState } from 'react'
import { Search, ExternalLink, Plus, Loader2, Film, Tv, Palette, BookOpen } from 'lucide-react'
import { useSearch } from '@/hooks/useImport'
import { useCreateMovie } from '@/hooks/useMovies'
import MovieForm from '@/components/movie/MovieForm'

const TYPE_ICONS: Record<string, any> = { movie: Film, tv: Tv, anime: Palette, book: BookOpen }

export default function ImportPage() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [importing, setImporting] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [importData, setImportData] = useState<any>(null)

  const { data, isLoading, isFetching } = useSearch(debouncedQuery, searchType)
  const createMovie = useCreateMovie()

  const handleSearch = () => {
    if (query.trim()) setDebouncedQuery(query.trim())
  }

  const handleImport = (result: any) => {
    const movieData = {
      title: result.title,
      originalTitle: result.originalTitle,
      type: result.type || 'movie',
      year: result.year,
      coverUrl: result.coverUrl,
      description: result.description,
      rating: result.rating || 0,
      director: result.director,
      genres: result.genres,
      author: result.author,
      playUrls: result.episodes ? [{ name: '默认源', url: result.episodes[0]?.url || '', episodes: result.episodes }] : undefined,
    }
    createMovie.mutate(movieData)
  }

  const sourceColors: Record<string, string> = {
    tmdb: 'bg-blue-100 text-blue-700',
    douban: 'bg-green-100 text-green-700',
    novel: 'bg-amber-100 text-amber-700',
    video: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text)]">🔍 搜索导入</h1>
      <p className="text-sm text-[var(--text-muted)]">从 TMDB、豆瓣、小说站和视频源搜索并导入影视/书籍</p>

      {/* Search bar */}
      <div className="glass p-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索电影、电视剧、书籍..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)]"
        >
          <option value="all">全部</option>
          <option value="movie">影视</option>
          <option value="book">书籍</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          <span className="ml-1">搜索</span>
        </button>
      </div>

      {/* Results */}
      {isFetching && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      )}

      {data?.results && data.results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">找到 {data.results.length} 条结果</p>
          {data.results.map((result: any, idx: number) => (
            <div key={idx} className="glass p-4 flex gap-4 items-start">
              {/* Cover */}
              <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {result.coverUrl ? (
                  <img src={result.coverUrl} alt={result.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {result.type === 'book' ? '📖' : '🎬'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm text-[var(--text)]">{result.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${sourceColors[result.source] || 'bg-gray-100'}`}>
                    {result.source.toUpperCase()}
                  </span>
                  {result.type && (
                    <span className="text-[10px] text-[var(--text-muted)] capitalize">{result.type}</span>
                  )}
                </div>
                {result.originalTitle && result.originalTitle !== result.title && (
                  <p className="text-xs text-[var(--text-muted)]">{result.originalTitle}</p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--text-muted)]">
                  {result.year && <span>📅 {result.year}</span>}
                  {result.rating && <span>⭐ {result.rating}</span>}
                  {result.director && <span>🎬 {result.director}</span>}
                  {result.author && <span>✍️ {result.author}</span>}
                </div>
                {result.description && (
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{result.description}</p>
                )}
                {result.genres && result.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.genres.map((g: string) => (
                      <span key={g} className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'var(--tag-bg)', color: 'var(--accent)' }}>{g}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => handleImport(result)}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
              >
                <Plus size={14} /> 导入
              </button>
            </div>
          ))}
        </div>
      )}

      {data?.results && data.results.length === 0 && debouncedQuery && !isFetching && (
        <div className="glass p-12 text-center text-[var(--text-muted)]">
          <p className="text-lg">🔍 未找到 "{debouncedQuery}" 的结果</p>
          <p className="text-sm mt-2">试试不同的关键词或手动添加</p>
          <button
            onClick={() => { setImportData({ title: debouncedQuery }); setShowForm(true) }}
            className="mt-4 px-4 py-2 rounded-lg text-sm border border-[var(--accent)] text-[var(--accent)]"
          >
            ✏️ 手动添加
          </button>
        </div>
      )}

      <MovieForm
        open={showForm}
        onClose={() => { setShowForm(false); setImportData(null) }}
        onSubmit={(data) => {
          createMovie.mutate(data)
          setShowForm(false)
        }}
        initialData={importData}
      />
    </div>
  )
}
