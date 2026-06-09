import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Loader2, Check, ChevronDown } from 'lucide-react'
import { useSearch } from '@/hooks/useImport'
import { useCreateMovie } from '@/hooks/useMovies'

export default function ImportPage() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { data, isFetching } = useSearch(debouncedQuery, searchType)
  const createMovie = useCreateMovie()
  const navigate = useNavigate()
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set())

  const handleSearch = () => { if (query.trim()) setDebouncedQuery(query.trim()) }

  const handleImport = (result: any, chunk?: any) => {
    const episodes = chunk ? chunk.episodes : result.episodes || []
    const suffix = chunk ? ` (${chunk.label})` : ''
    createMovie.mutate({
      title: result.title + suffix,
      originalTitle: result.originalTitle,
      type: result.type || 'movie',
      year: result.year,
      coverUrl: result.coverUrl,
      description: result.description,
      rating: result.rating || 0,
      director: result.director,
      genres: result.genres,
      author: result.author,
      playUrls: episodes.length > 0 ? [{ name: '默认源', episodes }] : undefined,
      status: 'want',
    }, {
      onSuccess: () => {
        const key = chunk ? `${result.id}-${chunk.label}` : result.id
        setImportedIds(prev => new Set(prev).add(key))
      }
    })
  }

  const sourceLabel: Record<string, string> = { tmdb: 'TMDB', douban: '豆瓣', novel: '小说站', video: '视频源', agedm: '动漫' }
  const sourceColor: Record<string, string> = { tmdb: '#4dbfd8', douban: '#68a858', novel: '#e89850', video: '#a080e0', agedm: '#f08080' }
  const typeIcon: Record<string, string> = { movie: '🎬', tv: '📺', anime: '🎨', book: '📖' }

  return (
    <div>
      <h1 className="section-title">🔍 搜索导入</h1>
      <p className="text-[0.85rem] mb-4" style={{ color: 'var(--text-muted)' }}>从 TMDB、视频源和动漫站搜索影视资源</p>

      {/* Search bar */}
      <div className="flex gap-2 mb-5 flex-wrap items-center p-3 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="搜索电影、电视剧、动漫..."
          className="flex-1 min-w-[200px] px-3 py-2.5 rounded-[10px] border text-[0.85rem] font-[inherit] outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }} />
        <select value={searchType} onChange={e => setSearchType(e.target.value)}
          className="px-3 py-2.5 rounded-[10px] border text-[0.85rem] font-[inherit] outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}>
          <option value="all">全部</option><option value="movie">影视</option></select>
        <button onClick={handleSearch} disabled={!query.trim() || isFetching}
          className="btn btn-primary flex items-center gap-1.5 disabled:opacity-50">
          {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} 搜索</button>
      </div>

      {isFetching && (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
      )}

      {data?.results && data.results.length > 0 && (
        <div className="space-y-3">
          <p className="text-[0.8rem]" style={{ color: 'var(--text-muted)' }}>找到 {data.results.length} 条结果</p>
          {data.results.map((result: any, idx: number) => {
            const hasChunks = result.chunks && result.chunks.length > 0
            const chunkKey = result.id
            const showChunks = expandedChunks.has(chunkKey)
            return (
              <div key={idx}>
                <div className="flex gap-3.5 p-3.5 items-start"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, backdropFilter: 'blur(8px)' }}>
                  <div className="w-16 h-[96px] shrink-0 rounded-lg overflow-hidden flex items-center justify-center text-2xl" style={{ background: 'var(--tag-bg)' }}>
                    {result.coverUrl ? <img src={result.coverUrl} alt="" className="w-full h-full object-cover" /> : <span>{typeIcon[result.type] || '🎬'}</span>}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-[0.9rem]" style={{ color: 'var(--text)' }}>{result.title}</h3>
                      <span className="px-1.5 py-0.5 text-[0.6rem] rounded-full text-white" style={{ background: sourceColor[result.source] || '#888' }}>
                        {sourceLabel[result.source] || result.source}</span>
                      {result.year && <span className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>{result.year}</span>}
                      {result.totalEpisodes > 0 && (
                        <span className="text-[0.7rem] font-medium" style={{ color: 'var(--accent)' }}>📺 {result.totalEpisodes}集</span>
                      )}
                    </div>
                    {result.originalTitle && result.originalTitle !== result.title && (
                      <p className="text-[0.72rem]" style={{ color: 'var(--text-muted)' }}>{result.originalTitle}</p>)}
                    <div className="flex flex-wrap gap-x-3 text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
                      {result.rating && <span>⭐ {result.rating}</span>}
                      {result.director && <span>🎬 {result.director}</span>}
                    </div>
                    {result.description && <p className="text-[0.72rem] line-clamp-2" style={{ color: 'var(--text-muted)' }}>{result.description}</p>}
                  </div>

                  <div className="shrink-0 flex flex-col gap-1">
                    {hasChunks ? (
                      <button onClick={() => setExpandedChunks(prev => {
                        const next = new Set(prev)
                        next.has(chunkKey) ? next.delete(chunkKey) : next.add(chunkKey)
                        return next
                      })}
                        className="btn btn-primary btn-sm flex items-center gap-1">
                        <ChevronDown size={14} style={{ transform: showChunks ? 'rotate(180deg)' : '' }} />
                        选择集数
                      </button>
                    ) : (
                      <button onClick={() => handleImport(result)} disabled={importedIds.has(result.id) || createMovie.isPending}
                        className={`btn btn-sm ${importedIds.has(result.id) ? '' : 'btn-primary'} flex items-center gap-1 shrink-0`}>
                        {importedIds.has(result.id) ? <Check size={14} /> : createMovie.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        {importedIds.has(result.id) ? '已导入' : '导入'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Chunk selector */}
                {hasChunks && showChunks && (
                  <div className="mt-2 ml-4 p-3 rounded-xl space-y-1" style={{ background: 'var(--accent2-dim)', border: '1px solid var(--border)' }}>
                    <p className="text-[0.75rem] mb-2" style={{ color: 'var(--text-muted)' }}>
                      📺 共 {result.totalEpisodes} 集，每块最多 75 集，选择要导入的部分：
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[200px] overflow-y-auto">
                      {result.chunks.map((chunk: any) => {
                        const key = `${result.id}-${chunk.label}`
                        const imported = importedIds.has(key)
                        return (
                          <button key={chunk.label} onClick={() => !imported && handleImport(result, chunk)}
                            disabled={imported}
                            className="px-2 py-1.5 text-xs rounded-lg border transition-all text-left"
                            style={{
                              borderColor: imported ? 'var(--accent2)' : 'var(--border)',
                              color: imported ? 'var(--accent2)' : 'var(--text)',
                              background: imported ? 'var(--accent2-dim)' : 'var(--input-bg)',
                              cursor: imported ? 'default' : 'pointer',
                            }}>
                            {imported ? <Check size={10} className="inline mr-1" /> : <Plus size={10} className="inline mr-1" />}
                            {chunk.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {data?.results && data.results.length === 0 && debouncedQuery && !isFetching && (
        <div className="text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>🔍 未找到 "{debouncedQuery}"</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-6">
        <button onClick={() => navigate('/shelf')} className="btn">📚 去观影架</button>
        <button onClick={() => navigate('/watchlist')} className="btn">📌 想看清单</button>
      </div>
    </div>
  )
}
