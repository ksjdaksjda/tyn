import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, ExternalLink } from 'lucide-react'
import { useMovie } from '@/hooks/useMovies'
import VideoPlayer from '@/components/player/VideoPlayer'
import type { Episode } from '@/types'

export default function PlayerPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { data: item } = useMovie(itemId)
  const [mode, setMode] = useState<'loading' | 'proxy' | 'direct' | 'error'>('loading')
  const [currentSrc, setCurrentSrc] = useState('')
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!item) return
    setMode('loading')
    setErrorMsg('')

    // Parse playUrls
    let playUrls: any[] = []
    try {
      playUrls = typeof item.playUrls === 'string' ? JSON.parse(item.playUrls) : (item.playUrls || [])
    } catch { playUrls = [] }

    if (playUrls.length === 0) {
      setMode('error')
      setErrorMsg('没有播放源。请先去「搜索导入」添加播放源。')
      return
    }

    const source = playUrls[0]
    let episodes: Episode[] = []

    if (source.episodes?.length > 0) {
      episodes = source.episodes.map((ep: any, i: number) => {
        if (typeof ep === 'string') return { title: `第${i + 1}集`, url: ep }
        return { title: ep.title || `第${i + 1}集`, url: ep.url || ep }
      })
    } else if (source.url) {
      episodes = [{ title: '正片', url: source.url }]
    }

    if (episodes.length === 0) {
      setMode('error')
      setErrorMsg('播放源数据格式错误')
      return
    }

    setCurrentEpisodes(episodes)
    // Start with proxy mode
    const firstUrl = episodes[0].url
    setCurrentSrc(`/api/proxy/m3u8?url=${encodeURIComponent(firstUrl)}`)
    setMode('proxy')
  }, [item])

  const switchToDirect = () => {
    if (currentEpisodes.length > 0) {
      setCurrentSrc(currentEpisodes[0].url)
      setMode('direct')
    }
  }

  const handleEpisodeChange = (ep: Episode) => {
    if (mode === 'direct') {
      setCurrentSrc(ep.url)
    } else {
      setCurrentSrc(`/api/proxy/m3u8?url=${encodeURIComponent(ep.url)}`)
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-4 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> 返回
      </button>

      {mode === 'loading' && (
        <div className="text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <p style={{ color: 'var(--text-muted)' }}>⏳ 加载中...</p>
        </div>
      )}

      {mode === 'error' && (
        <div className="text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <p className="text-lg" style={{ color: 'var(--text)' }}>🎬 {item?.title || '未知影片'}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => navigate('/import')} className="btn btn-primary btn-sm">🔍 搜索播放源</button>
            <button onClick={() => navigate(-1)} className="btn btn-sm">返回</button>
          </div>
        </div>
      )}

      {(mode === 'proxy' || mode === 'direct') && (
        <div>
          <VideoPlayer
            key={currentSrc}
            src={currentSrc}
            episodes={currentEpisodes}
            title={item?.title}
            poster={item?.coverUrl}
            onEpisodeChange={handleEpisodeChange}
            onError={() => {
              if (mode === 'proxy') {
                switchToDirect()
              }
            }}
          />
          <div className="flex gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>模式: {mode === 'proxy' ? '代理加速' : '直连'}</span>
            {mode === 'proxy' && (
              <button onClick={switchToDirect} className="underline hover:text-[var(--accent)]">切换直连</button>
            )}
            {mode === 'direct' && (
              <button onClick={() => { setMode('proxy'); setCurrentSrc(`/api/proxy/m3u8?url=${encodeURIComponent(currentEpisodes[0]?.url||'')}`) }} className="underline hover:text-[var(--accent)]">切换代理</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
