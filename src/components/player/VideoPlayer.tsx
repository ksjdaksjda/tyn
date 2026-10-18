import { useRef, useEffect, useState } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Maximize, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'

interface Episode { title: string; url: string }

interface VideoPlayerProps {
  src: string
  episodes?: Episode[]
  title?: string
  poster?: string
  activeEp?: number
  initialTime?: number
  directMode?: boolean
  onEpisodeChange?: (ep: Episode, idx: number) => void
  onTimeThrottle?: (t: number) => void
  onSwitchSource?: () => void
  onEnded?: () => void
  onPlaying?: () => void
  onError?: () => void
}

const EPISODES_PER_PAGE = 50

export default function VideoPlayer({ src, episodes, title, poster, activeEp = 0, initialTime = 0, directMode = false, onEpisodeChange, onTimeThrottle, onSwitchSource, onEnded, onPlaying, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [epPage, setEpPage] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const [stallHint, setStallHint] = useState(false)
  const [levels, setLevels] = useState<{ height: number; bitrate: number }[]>([])
  const [qualityMode, setQualityMode] = useState<'auto' | 'highest' | number>('auto')

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setLoading(true)
    setError('')
    let hls: Hls | null = null
    let destroyed = false

    const setup = async () => {
      const isM3u8 = src.includes('.m3u8') || src.includes('m3u8')
      let seekApplied = false

      const applyInitialTime = () => {
        if (seekApplied || initialTime <= 0) return
        seekApplied = true
        video.currentTime = initialTime
      }

      if (isM3u8 && Hls.isSupported()) {
        /* hls mode */
        hls = new Hls({
          enableWorker: true,
          maxBufferLength: 120,
          maxMaxBufferLength: 180,
          backBufferLength: 60,
          enableWebVTT: false,
          renderTextTracksNatively: false,
          ...(initialTime > 0 ? { startPosition: initialTime } : {}),
        })
        hls.loadSource(src)
        hls.attachMedia(video)
        hlsRef.current = hls

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!destroyed) {
            setLoading(false)
            // Collect quality levels (dedupe by height)
            const seen = new Map<number, number>()
            const lv: { height: number; bitrate: number }[] = []
            hls?.levels.forEach((l: any) => {
              const h = l.height || 0
              if (!seen.has(h)) { seen.set(h, l.bitrate || 0); lv.push({ height: h, bitrate: l.bitrate || 0 }) }
            })
            setLevels(lv)
            video.play().catch(() => {})
          }
        })

        hls.on(Hls.Events.ERROR, (_ev, data) => {
          if (!destroyed && data.fatal) {
            setError('HLS加载失败，尝试切换线路...')
            if (hls) { hls.destroy(); hls = null }
            // Fallback: try native
            video.src = src
            video.load()
            video.play().catch(() => {})
          }
        })
      } else {
        // Native playback
        video.src = src
        video.load()
      }

      const onReady = () => {
        if (!destroyed) {
          setLoading(false)
          setError('') // 直连播放成功时清除错误提示，避免遮挡画面
          applyInitialTime()
        }
      }
      const onErr = () => {
        if (!destroyed) {
          setError('播放失败')
          setLoading(false)
          onError?.()
        }
      }

      video.addEventListener('loadedmetadata', onReady)
      video.addEventListener('canplay', onReady)
      video.addEventListener('error', onErr)

      return () => {
        destroyed = true
        video.removeEventListener('loadedmetadata', onReady)
        video.removeEventListener('canplay', onReady)
        video.removeEventListener('error', onErr)
        if (hls) hls.destroy()
      }
    }

    const cleanup = setup()

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setCurrentTime(video.currentTime)
    const onDur = () => setDuration(video.duration || 0)

    // Throttled progress report (every ~5s) — parent persists to localStorage + backend
    let lastReport = 0
    const onTimeReport = () => {
      const now = video.currentTime
      if (now - lastReport >= 5 || now < lastReport) {
        lastReport = now
        onTimeThrottle?.(now)
      }
    }

    // Buffering indicator + stall counter (2 stalls within 60s → suggest switching source)
    const stallTimes: number[] = []
    const onWaiting = () => {
      if (destroyed) return
      setBuffering(true)
      const now = Date.now()
      stallTimes.push(now)
      while (stallTimes.length > 0 && now - stallTimes[0] > 60000) stallTimes.shift()
      if (stallTimes.length >= 2) setStallHint(true)
    }
    const onPlayingEvt = () => {
      setBuffering(false)
      setStallHint(false)
      onPlaying?.()
    }
    const onCanPlay = () => setBuffering(false)
    const onEndedEvt = () => onEnded?.()

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDur)
    video.addEventListener('timeupdate', onTimeReport)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('playing', onPlayingEvt)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('ended', onEndedEvt)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDur)
      video.removeEventListener('timeupdate', onTimeReport)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('playing', onPlayingEvt)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('ended', onEndedEvt)
      cleanup?.then?.(fn => fn())
    }
  }, [src])

  const togglePlay = () => { const v = videoRef.current; if (v) v.paused ? v.play().catch(()=>{}) : v.pause() }

  const applyQuality = (mode: 'auto' | 'highest' | number) => {
    const h = hlsRef.current
    if (!h || !h.levels || h.levels.length === 0) return
    if (mode === 'highest') {
      h.currentLevel = h.levels.length - 1
      h.autoLevelCapping = -1
    } else if (mode === 'auto') {
      h.currentLevel = -1
      h.autoLevelCapping = -1
    } else {
      h.currentLevel = mode
      h.autoLevelCapping = mode
    }
    setQualityMode(mode)
  }
  const toggleMute = () => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted) } }
  const toggleFS = () => {
    const video = videoRef.current
    if (!video) return
    // iOS Safari 只支持 video 元素全屏
    const vAny = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void; webkitDisplayingFullscreen?: boolean }
    if (vAny.webkitEnterFullscreen) {
      if (vAny.webkitDisplayingFullscreen) {
        vAny.webkitExitFullscreen?.()
      } else {
        vAny.webkitEnterFullscreen()
      }
      return
    }
    // Android / Desktop: 对容器请求全屏
    const container = video.closest('.player-container')
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      container?.requestFullscreen?.()
    }
  }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current; if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }
  const fmt = (t: number) => { const m = Math.floor(t/60); const s = Math.floor(t%60); return `${m}:${s.toString().padStart(2,'0')}` }

  return (
    <div className="space-y-4">
      <div className="player-container relative w-full bg-black rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
        <video ref={videoRef} className="w-full h-full" poster={poster} playsInline crossOrigin={directMode ? undefined : 'anonymous'} onClick={togglePlay} />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-white text-sm animate-pulse">⏳ 加载中...</div>
          </div>
        )}

        {buffering && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/60 text-white text-xs animate-pulse">缓冲中…</div>
          </div>
        )}

        {stallHint && !loading && !error && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-1.5 bg-black/70 z-10" style={{ pointerEvents: 'auto' }}>
            <p className="text-white text-xs truncate flex-1">网络卡顿？试试切换线路</p>
            {onSwitchSource && <button onClick={onSwitchSource} className="px-3 py-1 bg-white/20 text-white text-xs rounded whitespace-nowrap">切换线路</button>}
          </div>
        )}

        {error && !loading && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-1.5 bg-black/70 z-10" style={{ pointerEvents: 'auto' }}>
            <p className="text-white text-xs truncate flex-1">{error}</p>
            {onError && <button onClick={onError} className="px-3 py-1 bg-white/20 text-white text-xs rounded whitespace-nowrap">切换线路</button>}
          </div>
        )}

        {/* Controls */}
        {!loading && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent" onClick={e => e.stopPropagation()}>
            <div className="h-1 bg-white/20 rounded-full cursor-pointer mb-2" onClick={seek}>
              <div className="h-full rounded-full transition-all" style={{ width: duration ? `${(currentTime/duration)*100}%` : '0%', background: 'var(--accent, #2a9db8)' }} />
            </div>
            <div className="flex items-center gap-3 text-white">
              <button onClick={togglePlay}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
              <span className="text-xs tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>
              <div className="flex-1" />
              {levels.length > 0 && !directMode && (
                <select value={qualityMode} onChange={(e) => {
                  const v = e.target.value
                  applyQuality(v === 'auto' ? 'auto' : v === 'highest' ? 'highest' : parseInt(v))
                }}
                  className="text-xs bg-white/10 rounded px-1.5 py-0.5 outline-none border-none"
                  style={{ color: '#fff' }}>
                  <option value="auto" style={{ color: '#000' }}>自动</option>
                  <option value="highest" style={{ color: '#000' }}>最高优先</option>
                  {levels.map((l, i) => (
                    <option key={i} value={String(i)} style={{ color: '#000' }}>
                      {l.height ? `${l.height}p` : `档位${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={toggleMute}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
              <button onClick={toggleFS}><Maximize size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {title && <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h2>}

      {episodes && episodes.length > 0 && (() => {
        const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE)
        const start = epPage * EPISODES_PER_PAGE
        const pageEps = episodes.slice(start, start + EPISODES_PER_PAGE)
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>📺 剧集 ({episodes.length})</h3>
              {totalPages > 1 && (
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <button onClick={() => setEpPage(p => Math.max(0, p - 1))} disabled={epPage === 0}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={14} /></button>
                  <span>{epPage + 1}/{totalPages}</span>
                  <button onClick={() => setEpPage(p => Math.min(totalPages - 1, p + 1))} disabled={epPage >= totalPages - 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-[200px] overflow-y-auto">
              {pageEps.map((ep, i) => {
                const realIdx = start + i
                return (
                  <button key={realIdx} onClick={() => onEpisodeChange?.(ep, realIdx)}
                    className="px-2 py-1.5 text-xs rounded-lg border transition-all truncate"
                    style={{ borderColor: realIdx === activeEp ? 'var(--accent)' : 'var(--border)', color: realIdx === activeEp ? 'var(--accent)' : 'var(--text-muted)', background: realIdx === activeEp ? 'var(--accent2-dim)' : 'transparent' }}>
                    {ep.title}</button>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
