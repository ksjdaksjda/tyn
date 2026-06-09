import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMovie } from '@/hooks/useMovies'
import VideoPlayer from '@/components/player/VideoPlayer'
import type { Episode } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function PlayerPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { data: item } = useMovie(itemId)
  const [currentSrc, setCurrentSrc] = useState('')
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([])

  useEffect(() => {
    if (!item) return

    // Parse play URLs
    let urls: any[] = []
    try {
      urls = typeof item.playUrls === 'string' ? JSON.parse(item.playUrls) : item.playUrls || []
    } catch {
      urls = []
    }

    if (urls.length > 0) {
      const firstSource = urls[0]
      if (firstSource.episodes && firstSource.episodes.length > 0) {
        setCurrentEpisodes(firstSource.episodes)
        // Proxy m3u8 through our API
        const rawUrl = firstSource.episodes[item.currentEpisode - 1 || 0]?.url || firstSource.url
        setCurrentSrc(`${API_BASE}/api/proxy/m3u8?url=${encodeURIComponent(rawUrl)}`)
      } else if (firstSource.url) {
        setCurrentSrc(`${API_BASE}/api/proxy/m3u8?url=${encodeURIComponent(firstSource.url)}`)
      }
    }
  }, [item])

  const handleEpisodeChange = (ep: Episode) => {
    setCurrentSrc(`${API_BASE}/api/proxy/m3u8?url=${encodeURIComponent(ep.url)}`)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
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
        <div className="glass p-12 text-center text-[var(--text-muted)]">
          <p className="text-lg">🎬 {item?.title || '未知影片'}</p>
          <p className="text-sm mt-2">{item ? '没有可用的播放源' : '加载中...'}</p>
          {item && (
            <button
              onClick={() => navigate('/import')}
              className="mt-4 px-4 py-2 rounded-lg text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              🔍 去搜索播放源
            </button>
          )}
        </div>
      )}
    </div>
  )
}
