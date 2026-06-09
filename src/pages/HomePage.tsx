import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useMovies, useCreateMovie, useDeleteMovie } from '@/hooks/useMovies'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem } from '@/types'

export default function HomePage() {
  const navigate = useNavigate()
  const { data } = useMovies()
  const createMovie = useCreateMovie()
  const deleteMovie = useDeleteMovie()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()

  const items = data?.items || []
  const watched = items.filter(i => i.status === 'watched')
  const totalHours = watched.length * 2 // rough estimate
  const avgRating = watched.length ? (watched.reduce((s,i) => s+(i.rating||0),0) / watched.length).toFixed(1) : '-'

  const statCards = [
    { icon:'🎬', num:items.filter(i=>i.type==='movie').length, label:'电影' },
    { icon:'📺', num:items.filter(i=>i.type==='tv').length, label:'电视剧' },
    { icon:'🎨', num:items.filter(i=>i.type==='anime').length, label:'动漫', sub:'部' },
    { icon:'📖', num:items.filter(i=>i.type==='book').length, label:'书籍' },
    { icon:'⭐', num:watched.length, label:'已看' },
    { icon:'⏱️', num:totalHours, label:'观影时长', sub:'小时' },
    { icon:'📊', num:avgRating, label:'平均评分' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-10 px-5">
        <h1 className="text-[2.4rem] font-light tracking-[6px] mb-2 text-shimmer">🌳 树洞</h1>
        <p className="text-[0.95rem] tracking-[2px]" style={{ color:'var(--text-muted)' }}>电子手帐观影管理系统</p>
      </div>

      {/* Quick actions */}
      <div className="flex justify-center gap-2.5 mb-6 flex-wrap">
        <button onClick={()=>{setEditingItem(undefined);setShowForm(true)}} className="btn btn-primary">+ 添加作品</button>
        <button onClick={()=>navigate('/import')} className="btn">🔍 搜索导入</button>
        <button onClick={()=>navigate('/shelf')} className="btn">📚 观影架</button>
      </div>

      {/* Enhanced stats */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {statCards.map(s=>(
          <div key={s.label} className="text-center cursor-pointer relative overflow-hidden"
            style={{ padding:'16px 20px', borderRadius:16, background:'var(--bg-card)', border:'1px solid var(--border)', minWidth:100, flex:1, backdropFilter:'blur(8px)', transition:'all 0.35s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 10px 30px var(--shadow)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
            <span className="block text-[1.6rem] mb-1.5">{s.icon}</span>
            <div className="text-[1.8rem] font-bold text-shimmer">{s.num}</div>
            <div className="text-[0.7rem] tracking-[1px] mt-1" style={{color:'var(--text-muted)'}}>{s.label}</div>
            {s.sub&&<div className="text-[0.6rem] mt-0.5 opacity-70" style={{color:'var(--text-muted)'}}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Timeline / Recent */}
      <h2 className="section-title">📌 最近添加</h2>
      {items.length===0 ? (
        <div className="text-center p-10" style={{color:'var(--text-muted)'}}>
          <p className="text-lg">📭 还没有观影记录</p>
          <p className="text-sm mt-2">去「搜索导入」添加你的第一部作品吧</p>
        </div>
      ) : (
        <div className="relative" style={{paddingLeft:30}}>
          <div className="absolute left-2.5 top-0 bottom-0 w-0.5" style={{background:'linear-gradient(180deg,var(--accent),var(--accent2),transparent)'}}/>
          {items.slice(0,12).map((item,idx)=>(
            <div key={item.id} className="relative mb-5 p-3.5 flex gap-3 items-start cursor-pointer"
              style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,backdropFilter:'blur(8px)',transition:'all 0.35s ease',animation:`timelineIn 0.4s ease backwards ${idx*0.05}s`}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateX(4px)';e.currentTarget.style.boxShadow='0 6px 20px var(--shadow)';e.currentTarget.style.borderColor='var(--accent)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='var(--border)'}}
              onClick={()=>navigate(item.type==='book'?`/reader/${item.id}`:`/player/${item.id}`)}>
              <div className="absolute -left-6 top-5 w-2.5 h-2.5 rounded-full border-2" style={{background:'var(--accent)',borderColor:'var(--bg-card)',boxShadow:'0 0 0 3px var(--border)'}}/>
              <div className="text-[0.68rem] whitespace-nowrap pt-0.5 min-w-[80px]" style={{color:'var(--text-muted)'}}>
                {item.watchDate?.split('T')[0]||item.createdAt?.split('T')[0]||'-'}</div>
              <div className="w-12 h-16 rounded-md flex items-center justify-center text-xl flex-shrink-0 overflow-hidden" style={{background:'var(--tag-bg)'}}>
                {item.coverUrl?<img src={item.coverUrl} alt="" className="w-full h-full object-cover"/>:item.type==='book'?'📖':'🎬'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[0.88rem] flex items-center gap-1.5" style={{color:'var(--text)'}}>{item.title}
                  <span className="inline-block px-2 py-0.5 rounded-lg text-[0.65rem] font-medium" style={{background:item.status==='watched'?'rgba(80,200,120,0.22)':item.status==='watching'?'rgba(74,158,255,0.22)':'rgba(255,180,60,0.22)',color:item.status==='watched'?'#388050':item.status==='watching'?'#3878c0':'#c88020'}}>
                    {{want:'想看',watching:'在看',watched:'已看',paused:'暂停',dropped:'弃了'}[item.status]||item.status}</span>
                </div>
                <div className="text-[0.7rem]" style={{color:'var(--text-muted)'}}>
                  {item.year}{item.director?` · ${item.director}`:''}{item.author?` · ${item.author}`:''}</div>
                {(item.rating||0)>0&&<div className="text-[0.72rem] tracking-[0.5px] mt-1" style={{color:'var(--star-color)'}}>{'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)}</div>}
                {item.tags&&item.tags.length>0&&<div className="flex flex-wrap gap-1 mt-1">
                  {item.tags.slice(0,3).map(t=><span key={t} className="px-1 py-0.5 text-[0.6rem] rounded-md cursor-pointer" style={{background:'var(--tag-bg)',color:'var(--text-muted)'}}>{t}</span>)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <MovieForm open={showForm} onClose={()=>{setShowForm(false);setEditingItem(undefined)}}
        onSubmit={(data)=>{if(editingItem){}else{createMovie.mutate(data)};setShowForm(false);setEditingItem(undefined)}} initialData={editingItem}/>
    </div>
  )
}
