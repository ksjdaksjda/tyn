import { useState, useEffect } from 'react'
import type { MovieItem, ItemType, ItemStatus } from '@/types'
import StarRating from './StarRating'

interface MovieFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<MovieItem>) => void
  initialData?: Partial<MovieItem>
}

const TYPES: { value: ItemType; label: string }[] = [
  { value: 'movie', label: '🎬 电影' }, { value: 'tv', label: '📺 电视剧' },
  { value: 'anime', label: '🎨 动漫' }, { value: 'book', label: '📖 书籍' },
]
const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: 'want', label: '想看' }, { value: 'watching', label: '在看' },
  { value: 'watched', label: '已看' }, { value: 'paused', label: '暂停' }, { value: 'dropped', label: '弃了' },
]

export default function MovieForm({ open, onClose, onSubmit, initialData }: MovieFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ItemType>('movie')
  const [status, setStatus] = useState<ItemStatus>('want')
  const [rating, setRating] = useState(0)
  const [year, setYear] = useState('')
  const [director, setDirector] = useState('')
  const [author, setAuthor] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [description, setDescription] = useState('')
  const [watchDate, setWatchDate] = useState('')
  const [tags, setTags] = useState('')
  const [genres, setGenres] = useState('')

  useEffect(() => { if (open) {
    setTitle(initialData?.title||''); setType(initialData?.type||'movie'); setStatus(initialData?.status||'want')
    setRating(initialData?.rating||0); setYear(initialData?.year?.toString()||''); setDirector(initialData?.director||'')
    setAuthor(initialData?.author||''); setCoverUrl(initialData?.coverUrl||''); setDescription(initialData?.description||'')
    setWatchDate(initialData?.watchDate?.split('T')[0]||''); setTags(initialData?.tags?.join(', ')||'')
    setGenres(initialData?.genres?.join(', ')||'')
  }}, [open, initialData])

  if (!open) return null

  const isBook = type === 'book'
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault()
    onSubmit({ title:title.trim(), type, status, rating, year:year?parseInt(year):undefined, director:director.trim()||undefined,
      author:author.trim()||undefined, coverUrl:coverUrl.trim()||undefined, description:description.trim()||undefined,
      tags:tags.split(/[,，、]/).map(t=>t.trim()).filter(Boolean), genres:genres.split(/[,，、]/).map(t=>t.trim()).filter(Boolean),
      watchDate:watchDate||undefined })
  }

  const inputClass = "w-full px-2.5 py-2 rounded-[10px] border text-[0.85rem] font-[inherit] outline-none transition-all duration-[0.3s] focus:border-[var(--accent)] focus:shadow-[0_0_12px_var(--shadow)]"
  const inputStyle = { borderColor:'var(--border)', background:'var(--input-bg)', color:'var(--text)' }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 opacity-100 pointer-events-all" onClick={onClose}
      style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', transition:'opacity 0.3s ease' }}>
      <form onSubmit={handleSubmit} className="relative w-full max-h-[88vh] overflow-y-auto p-6 transition-transform duration-[0.3s]"
        style={{ background:'var(--modal-bg)', border:'1px solid var(--border)', borderRadius:18, maxWidth:520, backdropFilter:'blur(20px)', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e=>e.stopPropagation()}>

        <div className="flex justify-between items-center mb-[18px]">
          <h2 className="text-[1.15rem] font-semibold tracking-[2px] text-[var(--text)]">{initialData?'编辑':'添加'}作品</h2>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] rounded-full border-0 flex items-center justify-center text-[1rem] cursor-pointer transition-all duration-[0.2s]"
            style={{ background:'var(--tag-bg)', color:'var(--text-muted)' }}>✕</button>
        </div>

        <div className="flex gap-2 mb-3">
          {TYPES.map(t=>(<button key={t.value} type="button" onClick={()=>setType(t.value)}
            className="flex-1 py-1.5 text-[0.8rem] rounded-[18px] border transition-all duration-[0.25s]"
            style={{ borderColor:type===t.value?'var(--accent2)':'var(--border)', background:type===t.value?'var(--accent2)':'var(--input-bg)', color:type===t.value?'#fff':'var(--text-muted)' }}>
            {t.label}</button>))}
        </div>

        <div className="mb-3"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>标题 *</label>
          <input required value={title} onChange={e=>setTitle(e.target.value)} className={inputClass} style={inputStyle} placeholder={isBook?'书名':'片名'}/></div>

        <div className="flex gap-2.5 mb-3"><div className="flex-1"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>年份</label>
          <input type="number" value={year} onChange={e=>setYear(e.target.value)} className={inputClass} style={inputStyle}/></div>
        <div className="flex-1"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>{isBook?'作者':'导演'}</label>
          <input value={isBook?author:director} onChange={e=>isBook?setAuthor(e.target.value):setDirector(e.target.value)} className={inputClass} style={inputStyle}/></div></div>

        <div className="flex gap-2.5 mb-3"><div className="flex-1"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>状态</label>
          <select value={status} onChange={e=>setStatus(e.target.value as ItemStatus)} className={inputClass} style={inputStyle}>
            {STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
        <div className="flex-1"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>评分</label>
          <div className="pt-1.5"><StarRating value={rating} onChange={setRating} size="lg"/></div></div></div>

        <div className="mb-3"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>封面图片URL</label>
          <input value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} className={inputClass} style={inputStyle} placeholder="https://..."/>
          {coverUrl&&<img src={coverUrl} alt="预览" className="mt-2 w-24 h-36 object-cover rounded-lg"/>}</div>

        <div className="flex gap-2.5 mb-3"><div className="flex-1"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>类型标签</label>
          <input value={genres} onChange={e=>setGenres(e.target.value)} className={inputClass} style={inputStyle} placeholder="科幻, 动作"/></div>
        <div className="flex-1"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>个人标签</label>
          <input value={tags} onChange={e=>setTags(e.target.value)} className={inputClass} style={inputStyle} placeholder="催泪, 必看"/></div></div>

        <div className="mb-3"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>简介</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className={`${inputClass} resize-y`} style={inputStyle}/></div>

        <div className="mb-3"><label className="block text-[0.78rem] mb-1" style={{color:'var(--text-muted)'}}>观看日期</label>
          <input type="date" value={watchDate} onChange={e=>setWatchDate(e.target.value)} className={inputClass} style={inputStyle}/></div>

        <button type="submit" className="w-full py-2.5 rounded-[24px] text-white font-[inherit] text-[0.85rem] cursor-pointer transition-all duration-[0.3s]"
          style={{ background:'linear-gradient(135deg, var(--accent), var(--accent2))', border:'none', boxShadow:'0 4px 18px var(--glow)' }}>
          {initialData?'💾 保存修改':'✨ 添加作品'}</button>
      </form>
    </div>
  )
}
