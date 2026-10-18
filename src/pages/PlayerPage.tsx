import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useMovie } from '@/hooks/useMovies'
import { useRefetchSources } from '@/hooks/useImport'
import VideoPlayer from '@/components/player/VideoPlayer'
import { itemsApi } from '@/lib/api'
import { sortSources } from '@/lib/utils'
import { resolveProxyBase, proxyUrl } from '@/lib/proxy'
import type { Episode, PlaySource } from '@/types'

const SOURCE_STALE_MS = 7 * 24 * 3600 * 1000 // 7 days

function parsePlayUrls(raw: any): PlaySource[] {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw || [])
  } catch { return [] }
}

function getEpisodes(source: PlaySource): Episode[] {
  const eps = source.episodes
  if (eps && eps.length > 0) {
    return eps.map((ep: any, i: number) => {
      if (typeof ep === 'string') return { title: `第${i + 1}集`, url: ep }
      return { title: ep.title || `第${i + 1}集`, url: ep.url || ep }
    })
  }
  if (source.url) return [{ title: '正片', url: source.url }]
  return []
}

// Direct mode only works on Safari (native HLS, no CORS requirement).
// Desktop Chrome/Firefox have no native m3u8 support — direct is a guaranteed dead end there.
function isNativeHlsPlatform(): boolean {
  const ua = navigator.userAgent
  return /^((?!chrome|android).)*safari/i.test(ua)
}

export default function PlayerPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading } = useMovie(itemId)
  const refetchSources = useRefetchSources()
  const [mode, setMode] = useState<'loading' | 'proxy' | 'direct' | 'error'>('loading')
  const [currentSrc, setCurrentSrc] = useState('')
  const [sources, setSources] = useState<PlaySource[]>([])
  const [sourceIdx, setSourceIdx] = useState(0)
  const [activeEpIdx, setActiveEpIdx] = useState(0)
  const [pendingSeekTime, setPendingSeekTime] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [proxyLabel, setProxyLabel] = useState('云端代理')

  const lastTimeRef = useRef(0)
  const activeEpIdxRef = useRef(0)
  const sourceIdxRef = useRef(0)
  const failedTriesRef = useRef(0)
  const autoRefetchRef = useRef(false)
  const proxyBaseRef = useRef('')
  activeEpIdxRef.current = activeEpIdx
  sourceIdxRef.current = sourceIdx

  const saveProgress = useCallback((position?: number) => {
    if (!itemId) return
    const pos = Math.floor(position ?? lastTimeRef.current)
    itemsApi.update(itemId, {
      currentEpisode: activeEpIdxRef.current + 1,
      playbackPosition: pos,
    })
  }, [itemId])

  // Reset per-item auto-refetch guard when switching items
  useEffect(() => {
    autoRefetchRef.current = false
  }, [itemId])

  // Persist backend progress on unload (localStorage already saved synchronously)
  useEffect(() => {
    const handler = () => {
      if (!itemId || lastTimeRef.current <= 0) return
      const base = import.meta.env.VITE_API_URL || ''
      const body = JSON.stringify({
        currentEpisode: activeEpIdxRef.current + 1,
        playbackPosition: Math.floor(lastTimeRef.current),
      })
      try { fetch(`${base}/api/items/${itemId}`, { method: 'PUT', body, headers: { 'Content-Type': 'application/json', 'X-User-Id': 'local' }, keepalive: true }).catch(() => {}) } catch {}
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [itemId])

  // Initialize from item: resolve proxy base, restore episode + position, sort sources
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      if (isLoading) return
      if (!item) {
        // Never leave the page stuck on "loading" — surface a clear error instead
        setMode('error')
        setErrorMsg('影片数据不存在，可能已被删除。请返回列表重新打开。')
        return
      }
      setMode('loading')
      setErrorMsg('')
      failedTriesRef.current = 0

      const playUrls = parsePlayUrls(item.playUrls)
      if (playUrls.length === 0) {
        setMode('error')
        setErrorMsg('没有播放源。请先去「搜索导入」添加播放源。')
        return
      }

      const validSources = playUrls.filter((s: any) => s && (s.episodes?.length > 0 || s.url))
      if (validSources.length === 0) {
        setMode('error')
        setErrorMsg('播放源数据格式错误')
        return
      }

      // Resolve which proxy to use: local proxy (home IP, not blocked) or Cloudflare
      const base = await resolveProxyBase()
      if (cancelled) return
      proxyBaseRef.current = base
      setProxyLabel(base ? '本地代理' : '云端代理')

      const sorted = sortSources(validSources)
      setSources(sorted)
      setSourceIdx(0)
      const episodes = getEpisodes(sorted[0])
      const savedEp = item.currentEpisode || 1
      const epIdx = Math.max(0, Math.min(savedEp - 1, episodes.length - 1))
      setActiveEpIdx(epIdx)
      setPendingSeekTime(item.playbackPosition || 0)
      setCurrentSrc(proxyUrl(episodes[epIdx].url, base))
      setMode('proxy')

      // B2 freshness check: only when at least one source carries fetchedAt and
      // the oldest one is older than 7 days → refresh in background (doesn't block
      // playback). Legacy data without fetchedAt is never auto-refreshed.
      const now = Date.now()
      const hasFetchedAt = sorted.some((s: any) => typeof s.fetchedAt === 'number')
      const oldest = sorted.reduce((min, s: any) =>
        typeof s.fetchedAt === 'number' ? Math.min(min, s.fetchedAt) : min, Infinity)
      if (hasFetchedAt && oldest < now - SOURCE_STALE_MS && !autoRefetchRef.current) {
        autoRefetchRef.current = true
        setTimeout(() => {
          refetchSources.mutate(item, { onError: () => {} })
        }, 1500)
      }
    }
    init()
    return () => { cancelled = true }
  }, [item, isLoading])

  const currentEpisodes = sources.length > 0 ? getEpisodes(sources[Math.min(sourceIdx, sources.length - 1)]) : []

  const setSource = (idx: number, newMode: 'proxy' | 'direct') => {
    if (idx < 0 || idx >= sources.length) return
    const eps = getEpisodes(sources[idx])
    if (eps.length === 0) return
    const epIdx = Math.min(activeEpIdx, eps.length - 1)
    setPendingSeekTime(lastTimeRef.current)
    setActiveEpIdx(epIdx)
    setSourceIdx(idx)
    setCurrentSrc(newMode === 'direct' ? eps[epIdx].url : proxyUrl(eps[epIdx].url, proxyBaseRef.current))
    setMode(newMode)
  }

  // Manual line switch (UI buttons / stall hint) — keep current mode
  const switchSource = () => {
    if (sources.length <= 1) return
    saveProgress()
    const next = (sourceIdxRef.current + 1) % sources.length
    setSource(next, mode === 'direct' ? 'direct' : 'proxy')
  }

  // Automatic failover: current source failed → try next source; all failed →
  // Safari falls back to direct once, everything else goes to the error state
  const handleSourceError = () => {
    saveProgress()
    failedTriesRef.current++
    if (failedTriesRef.current < sources.length && sources.length > 1) {
      const next = (sourceIdxRef.current + 1) % sources.length
      setSource(next, 'proxy')
      return
    }
    if (mode === 'proxy' && isNativeHlsPlatform()) {
      setSource(sourceIdx, 'direct')
      return
    }
    setMode('error')
    setErrorMsg('所有线路均播放失败，片源可能已失效。点击下方「更新片源」重新获取最新片源。')
  }

  const switchToDirect = () => {
    saveProgress()
    setSource(sourceIdx, 'direct')
  }

  const switchToProxy = () => {
    saveProgress()
    setSource(sourceIdx, 'proxy')
  }

  const handleEpisodeChange = (ep: Episode, idx: number) => {
    // Save the episode we're leaving, then start the new one from 0
    saveProgress()
    lastTimeRef.current = 0
    setActiveEpIdx(idx)
    setPendingSeekTime(0)
    if (mode === 'direct') {
      setCurrentSrc(ep.url)
    } else {
      setCurrentSrc(proxyUrl(ep.url, proxyBaseRef.current))
    }
    itemsApi.update(itemId || '', { currentEpisode: idx + 1, playbackPosition: 0 })
  }

  const handleTimeThrottle = (t: number) => {
    lastTimeRef.current = t
    saveProgress(t)
  }

  // Auto-play next episode when the current one ends
  const handleEnded = () => {
    saveProgress()
    lastTimeRef.current = 0
    const eps = currentEpisodes
    const next = activeEpIdxRef.current + 1
    if (eps.length > 0 && next < eps.length) {
      handleEpisodeChange(eps[next], next)
    }
  }

  // Prefetch next episode's manifest through the proxy (warms the 60s manifest cache)
  const preloadedRef = useRef('')
  const handlePlaying = () => {
    if (mode !== 'proxy') return
    const eps = currentEpisodes
    const next = activeEpIdxRef.current + 1
    if (eps.length > 0 && next < eps.length) {
      const nextUrl = proxyUrl(eps[next].url, proxyBaseRef.current)
      if (preloadedRef.current !== nextUrl) {
        preloadedRef.current = nextUrl
        fetch(nextUrl).catch(() => {})
      }
    }
  }

  if (mode === 'loading') {
    return (
      <div className="text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
        <p style={{ color: 'var(--text-muted)' }}>⏳ 加载中...</p>
      </div>
    )
  }

  if (mode === 'error') {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-4 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> 返回
        </button>
        <div className="text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <p className="text-lg" style={{ color: 'var(--text)' }}>🎬 {item?.title || '未知影片'}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
          {!proxyBaseRef.current && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              💡 电脑观看提示：片源站封锁了云端代理，可在电脑上运行
              <code className="mx-1">node proxy-server.mjs</code>（走家庭宽带）后刷新本页重试
            </p>
          )}
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={() => refetchSources.mutate(item, { onError: (err: any) => alert(err?.message || '更新片源失败') })}
              disabled={refetchSources.isPending}
              className="btn btn-primary btn-sm disabled:opacity-50">
              <RefreshCw size={12} className={`inline mr-1 ${refetchSources.isPending ? 'animate-spin' : ''}`} />
              {refetchSources.isPending ? '更新中…' : '更新片源'}
            </button>
            <button onClick={() => navigate('/import')} className="btn btn-primary btn-sm">🔍 搜索播放源</button>
            <button onClick={() => navigate(-1)} className="btn btn-sm">返回</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-4 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> 返回
      </button>

      <VideoPlayer
        key={currentSrc}
        src={currentSrc}
        episodes={currentEpisodes}
        title={item?.title}
        poster={item?.coverUrl}
        activeEp={activeEpIdx}
        initialTime={pendingSeekTime}
        directMode={mode === 'direct'}
        onTimeThrottle={handleTimeThrottle}
        onEpisodeChange={handleEpisodeChange}
        onSwitchSource={switchSource}
        onEnded={handleEnded}
        onPlaying={handlePlaying}
        onError={handleSourceError}
      />
      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>模式: {mode === 'proxy' ? '代理加速' : '直连'}</span>
        <span>出口: {proxyLabel}</span>
        {mode === 'proxy' && isNativeHlsPlatform() && (
          <button onClick={switchToDirect} className="underline hover:text-[var(--accent)]">切换直连</button>
        )}
        {mode === 'direct' && (
          <button onClick={switchToProxy} className="underline hover:text-[var(--accent)]">切换代理</button>
        )}
        <button
          onClick={() => refetchSources.mutate(item, { onError: (err: any) => alert(err?.message || '更新片源失败') })}
          disabled={refetchSources.isPending}
          className="underline hover:text-[var(--accent)] disabled:opacity-50 flex items-center gap-1">
          <RefreshCw size={11} className={refetchSources.isPending ? 'animate-spin' : ''} />
          {refetchSources.isPending ? '更新中…' : '重新搜索片源'}
        </button>
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs self-center" style={{ color: 'var(--text-muted)' }}>线路:</span>
          {sources.map((s, i) => (
            <button key={i} onClick={() => { saveProgress(); setSource(i, mode === 'direct' ? 'direct' : 'proxy') }}
              className="px-2.5 py-1 text-xs rounded-lg border transition-all"
              style={{ borderColor: i === sourceIdx ? 'var(--accent)' : 'var(--border)', color: i === sourceIdx ? 'var(--accent)' : 'var(--text-muted)', background: i === sourceIdx ? 'var(--accent2-dim)' : 'transparent' }}>
              {s.name || `线路${i + 1}`} · {getEpisodes(s).length}集
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
