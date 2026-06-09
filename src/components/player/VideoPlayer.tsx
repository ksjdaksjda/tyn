import { useRef, useEffect, useState } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react'

interface Episode { title: string; url: string }

interface VideoPlayerProps {
  src: string
  episodes?: Episode[]
  title?: string
  poster?: string
  onEpisodeChange?: (ep: Episode) => void
  onError?: () => void
}

export default function VideoPlayer({ src, episodes, title, poster, onEpisodeChange, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeEp, setActiveEp] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [useHls, setUseHls] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setLoading(true)
    setError('')
    let hls: Hls | null = null
    let destroyed = false

    const setup = async () => {
      const isM3u8 = src.includes('.m3u8') || src.includes('m3u8')

      if (isM3u8 && Hls.isSupported()) {
        setUseHls(true)
        hls = new Hls({
          enableWorker: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        })
        hls.loadSource(src)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!destroyed) {
            setLoading(false)
            video.play().catch(() => {})
          }
        })

        hls.on(Hls.Events.ERROR, (_ev, data) => {
          if (!destroyed && data.fatal) {
            setError('HLS加载失败，尝试直连...')
            if (hls) { hls.destroy(); hls = null }
            // Fallback: try native
            video.src = src
            setUseHls(false)
            video.load()
            video.play().catch(() => {})
          }
        })
      } else {
        // Native playback
        setUseHls(false)
        video.src = src
        video.load()
      }

      const onReady = () => {
        if (!destroyed) setLoading(false)
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
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDur)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDur)
      cleanup?.then?.(fn => fn())
    }
  }, [src])

  const togglePlay = () => { const v = videoRef.current; if (v) v.paused ? v.play().catch(()=>{}) : v.pause() }
  const toggleMute = () => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted) } }
  const toggleFS = () => videoRef.current?.closest('.player-container')?.requestFullscreen?.()
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current; if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }
  const fmt = (t: number) => { const m = Math.floor(t/60); const s = Math.floor(t%60); return `${m}:${s.toString().padStart(2,'0')}` }

  return (
    <div className="space-y-4">
      <div className="player-container relative w-full bg-black rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
        <video ref={videoRef} className="w-full h-full" poster={poster} playsInline crossOrigin="anonymous" onClick={togglePlay} />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-white text-sm animate-pulse">⏳ 加载中...</div>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 flex-col gap-2">
            <p className="text-white text-sm">{error}</p>
            {onError && <button onClick={onError} className="px-3 py-1 bg-white/20 text-white text-xs rounded">切换直连</button>}
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
              <button onClick={toggleMute}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
              <button onClick={toggleFS}><Maximize size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {title && <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h2>}

      {episodes && episodes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>📺 剧集 ({episodes.length})</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-[200px] overflow-y-auto">
            {episodes.map((ep, i) => (
              <button key={i} onClick={() => { setActiveEp(i); onEpisodeChange?.(ep) }}
                className="px-2 py-1.5 text-xs rounded-lg border transition-all truncate"
                style={{ borderColor: i === activeEp ? 'var(--accent)' : 'var(--border)', color: i === activeEp ? 'var(--accent)' : 'var(--text-muted)', background: i === activeEp ? 'var(--accent2-dim)' : 'transparent' }}>
                {ep.title}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
