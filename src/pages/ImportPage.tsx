import { useState } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { useSearch } from '@/hooks/useImport'
import { useCreateMovie } from '@/hooks/useMovies'

export default function ImportPage() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { data, isFetching } = useSearch(debouncedQuery, searchType)
  const createMovie = useCreateMovie()

  const handleSearch = () => { if (query.trim()) setDebouncedQuery(query.trim()) }

  const handleImport = (result: any) => {
    createMovie.mutate({
      title: result.title, originalTitle: result.originalTitle, type: result.type||'movie',
      year: result.year, coverUrl: result.coverUrl, description: result.description,
      rating: result.rating||0, director: result.director, genres: result.genres, author: result.author,
      playUrls: result.episodes?[{name:'默认源',url:result.episodes[0]?.url||'',episodes:result.episodes}]:undefined,
    })
  }

  const sourceLabel: Record<string,string> = { tmdb:'TMDB', douban:'豆瓣', novel:'小说站', video:'视频源' }
  const sourceColor: Record<string,string> = { tmdb:'#4dbfd8', douban:'#68a858', novel:'#e89850', video:'#a080e0' }

  return (
    <div>
      <h1 className="section-title">🔍 搜索导入</h1>
      <p className="text-[0.85rem] mb-4" style={{color:'var(--text-muted)'}}>从 TMDB、豆瓣、小说站和视频源搜索并导入影视/书籍</p>

      {/* Search bar */}
      <div className="flex gap-2 mb-5 flex-wrap items-center p-3 rounded-xl" style={{background:'var(--bg-card)',border:'1px solid var(--border)',backdropFilter:'blur(8px)'}}>
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&handleSearch()}
          placeholder="搜索电影、电视剧、书籍..."
          className="flex-1 min-w-[200px] px-3 py-2.5 rounded-[10px] border text-[0.85rem] font-[inherit] outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_12px_var(--shadow)]"
          style={{borderColor:'var(--border)',background:'var(--input-bg)',color:'var(--text)'}} />
        <select value={searchType} onChange={e=>setSearchType(e.target.value)}
          className="px-3 py-2.5 rounded-[10px] border text-[0.85rem] font-[inherit] outline-none"
          style={{borderColor:'var(--border)',background:'var(--input-bg)',color:'var(--text)'}}>
          <option value="all">全部</option><option value="movie">影视</option><option value="book">书籍</option></select>
        <button onClick={handleSearch} disabled={!query.trim()||isFetching}
          className="btn btn-primary flex items-center gap-1.5 disabled:opacity-50">
          {isFetching?<Loader2 size={16} className="animate-spin"/>:<Search size={16}/>} 搜索</button>
      </div>

      {/* Results */}
      {isFetching && <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" style={{color:'var(--accent)'}}/></div>}

      {data?.results && data.results.length>0 && (
        <div className="space-y-3">
          <p className="text-[0.8rem]" style={{color:'var(--text-muted)'}}>找到 {data.results.length} 条结果</p>
          {data.results.map((result:any,idx:number)=>(
            <div key={idx} className="flex gap-3.5 p-3.5 items-start" style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,backdropFilter:'blur(8px)'}}>
              <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden flex items-center justify-center text-2xl" style={{background:'var(--tag-bg)'}}>
                {result.coverUrl?<img src={result.coverUrl} alt={result.title} className="w-full h-full object-cover"/>:result.type==='book'?'📖':'🎬'}</div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-[0.9rem]" style={{color:'var(--text)'}}>{result.title}</h3>
                  <span className="px-1.5 py-0.5 text-[0.6rem] rounded-full text-white" style={{background:sourceColor[result.source]||'#888'}}>{sourceLabel[result.source]||result.source}</span>
                  {result.type&&<span className="text-[0.65rem]" style={{color:'var(--text-muted)'}}>{result.type}</span>}</div>
                {result.originalTitle&&result.originalTitle!==result.title&&<p className="text-[0.72rem]" style={{color:'var(--text-muted)'}}>{result.originalTitle}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.7rem]" style={{color:'var(--text-muted)'}}>
                  {result.year&&<span>📅 {result.year}</span>}{result.rating&&<span>⭐ {result.rating}</span>}
                  {result.director&&<span>🎬 {result.director}</span>}{result.author&&<span>✍️ {result.author}</span>}</div>
                {result.description&&<p className="text-[0.72rem] line-clamp-2" style={{color:'var(--text-muted)'}}>{result.description}</p>}
                {result.genres&&result.genres.length>0&&<div className="flex flex-wrap gap-1">
                  {result.genres.map((g:string)=>(<span key={g} className="px-1.5 py-0.5 text-[0.62rem] rounded" style={{background:'var(--tag-bg)',color:'var(--accent)'}}>{g}</span>))}</div>}
              </div>
              <button onClick={()=>handleImport(result)} className="btn btn-primary btn-sm flex items-center gap-1 shrink-0"><Plus size={14}/> 导入</button>
            </div>))}
        </div>)}

      {data?.results&&data.results.length===0&&debouncedQuery&&!isFetching&&(
        <div className="text-center p-12 glass"><p className="text-lg" style={{color:'var(--text-muted)'}}>🔍 未找到 "{debouncedQuery}" 的结果</p>
          <p className="text-sm mt-2" style={{color:'var(--text-muted)'}}>试试不同的关键词或手动添加</p></div>)}
    </div>
  )
}
