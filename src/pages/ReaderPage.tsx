import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { useMovie, useUpdateMovie } from '@/hooks/useMovies'
import BookReader from '@/components/reader/BookReader'

export default function ReaderPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { data: item } = useMovie(itemId)
  const updateMovie = useUpdateMovie()
  const [localContent, setLocalContent] = useState('')

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setLocalContent(text)
      if (itemId) {
        updateMovie.mutate({ id: itemId, txtContent: btoa(unescape(encodeURIComponent(text))) })
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  // Decode content from item or use local upload
  let content = localContent
  if (!content && item) {
    try {
      const stored = (item as any).txtContent
      content = stored ? decodeURIComponent(escape(atob(stored))) : ''
    } catch {
      content = ''
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      {content ? (
        <BookReader
          content={content}
          title={item?.title}
          initialPosition={(item as any)?.currentPage || 0}
          onProgress={(pct) => {
            if (itemId) updateMovie.mutate({ id: itemId, currentPage: pct })
          }}
        />
      ) : (
        <div className="glass p-12 text-center text-[var(--text-muted)] space-y-4">
          <p className="text-lg">📖 {item?.title || '未知书籍'}</p>
          <p className="text-sm">还没有上传电子书文件</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            <Upload size={16} /> 上传 TXT 文件
            <input type="file" accept=".txt,.epub" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  )
}
