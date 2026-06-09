import { useRef, useEffect, useState } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react'

interface Episode {
  title: string
  url: string
}

interface VideoPlayerProps {
  src: string
  episodes?: Episode[]
  title?: string
  poster?: string
  onEpisodeChange?: (episode: Episode) => void
}

export default function VideoPlayer({ src, episodes, title, poster, onEpisodeChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [activeEpisode, setActiveEpisode] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setError(null)
    let hls: Hls | null = null

    if (src.endsWith('.m3u8') || src.includes('.m3u8')) {
      if (Hls.isSupported()) {
      hls = new Hls({})
        hls.loadSource(src)
        hls.attachMedia(video)
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setError('视频加载失败，正在尝试恢复...')
            hls?.recoverMediaError()
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
      }
    } else {
      video.src = src
    }

    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDuration = () => setDuration(video.duration || 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => setError('播放出错，请检查视频源')

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onDuration)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onError)

    return () => {
      if (hls) hls.destroy()
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onDuration)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onError)
    }
  }, [src])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const toggleFullscreen = () => {
    containerRef.current?.requestFullscreen?.()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    video.currentTime = ratio * duration
  }

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const showControlsTemp = () => {
    setShowControls(true)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Player container */}
      <div
        ref={containerRef}
        className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl group"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={showControlsTemp}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          poster={poster}
          playsInline
          crossOrigin="anonymous"
        />

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="h-1 bg-white/20 rounded-full cursor-pointer mb-3" onClick={seek}>
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-[var(--accent)]">
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <span className="text-white text-xs tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            <button onClick={toggleMute} className="text-white hover:text-[var(--accent)]">
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button onClick={toggleFullscreen} className="text-white hover:text-[var(--accent)]">
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      {title && <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>}

      {/* Episode selector */}
      {episodes && episodes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text)]">📺 剧集列表 ({episodes.length} 集)</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 max-h-[200px] overflow-y-auto">
            {episodes.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveEpisode(idx); onEpisodeChange?.(ep) }}
                className="px-2 py-1.5 text-xs rounded-lg border transition-all truncate"
                style={{
                  borderColor: activeEpisode === idx ? 'var(--accent)' : 'var(--border)',
                  color: activeEpisode === idx ? 'var(--accent)' : 'var(--text-muted)',
                  background: activeEpisode === idx ? 'var(--accent2-dim)' : 'transparent',
                }}
              >
                {ep.title || `${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
