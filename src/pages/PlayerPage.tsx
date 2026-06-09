import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMovie } from '@/hooks/useMovies'
import VideoPlayer from '@/components/player/VideoPlayer'
import type { Episode } from '@/types'

export default function PlayerPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { data: item } = useMovie(itemId)
  const [currentSrc, setCurrentSrc] = useState('')
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!item) return
    setError('')

    let playUrls: any[] = []
    try {
      playUrls = typeof item.playUrls === 'string' ? JSON.parse(item.playUrls) : (item.playUrls || [])
    } catch { playUrls = [] }

    if (playUrls.length === 0) {
      setError('没有可用的播放源。请去搜索导入添加播放源。')
      return
    }

    const source = playUrls[0]
    let episodes: Episode[] = []

    if (source.episodes && source.episodes.length > 0) {
      episodes = source.episodes.map((ep: any, i: number) => {
        if (typeof ep === 'string') return { title: `第${i + 1}集`, url: ep }
        return { title: ep.title || `第${i + 1}集`, url: ep.url || '' }
      })
      setCurrentEpisodes(episodes)

      // Get first episode URL
      const firstEp = episodes[0]
      if (firstEp?.url) {
        const proxyUrl = firstEp.url.includes('/api/proxy') ? firstEp.url :
          `/api/proxy/m3u8?url=${encodeURIComponent(firstEp.url)}`
        setCurrentSrc(proxyUrl)
      } else {
        setError('播放源链接无效')
      }
    } else if (source.url) {
      setCurrentEpisodes([{ title: '正片', url: source.url }])
      const proxyUrl = source.url.includes('/api/proxy') ? source.url :
        `/api/proxy/m3u8?url=${encodeURIComponent(source.url)}`
      setCurrentSrc(proxyUrl)
    } else {
      setError('没有可用的播放链接')
    }
  }, [item])

  const handleEpisodeChange = (ep: Episode) => {
    const proxyUrl = ep.url.includes('/api/proxy') ? ep.url :
      `/api/proxy/m3u8?url=${encodeURIComponent(ep.url)}`
    setCurrentSrc(proxyUrl)
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-4 hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> 返回
      </button>

      {currentSrc ? (
        <VideoPlayer
          src={currentSrc}
          episodes={currentEpisodes}
          title={item?.title}
          poster={item?.coverUrl}
          onEpisodeChange={handleEpisodeChange}
        />
      ) : (
        <div className="text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, backdropFilter: 'blur(8px)' }}>
          <p className="text-lg" style={{ color: 'var(--text)' }}>🎬 {item?.title || '未知影片'}</p>
          <p className="text-sm mt-2" style={{ color: error ? 'var(--danger)' : 'var(--text-muted)' }}>{error || '加载中...'}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => navigate('/import')} className="btn btn-primary btn-sm">🔍 搜索播放源</button>
            <button onClick={() => navigate(-1)} className="btn btn-sm">返回</button>
          </div>
        </div>
      )}
    </div>
  )
}
