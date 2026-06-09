import { useRef, useEffect, useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import type { Review, MovieItem } from '@/types'

interface SharePosterProps {
  review: Review
  item?: MovieItem
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    const test = current + char
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = char
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export default function SharePoster({ review, item }: SharePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    generatePoster()
  }, [review, item])

  async function generatePoster() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 750
    const h = 1200
    canvas.width = w
    canvas.height = h

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f0f23')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // Stars
    for (let i = 0; i < 80; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.1})`
      ctx.fill()
    }

    // Accent line
    ctx.strokeStyle = 'rgba(160, 128, 224, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, 80)
    ctx.lineTo(w - 60, 80)
    ctx.stroke()

    // Draw cover if exists
    if (item?.coverUrl) {
      try {
        const coverImg = await loadImage(item.coverUrl)
        const coverW = 280
        const coverH = 420
        const cx = (w - coverW) / 2
        const cy = 120

        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 30
        ctx.fillStyle = '#333'
        ctx.fillRect(cx + 5, cy + 5, coverW, coverH)
        ctx.shadowColor = 'transparent'

        ctx.save()
        ctx.beginPath()
        ctx.roundRect(cx, cy, coverW, coverH, 12)
        ctx.clip()
        ctx.drawImage(coverImg, cx, cy, coverW, coverH)
        ctx.restore()
      } catch {
        // Cover failed to load, continue without it
      }
    }

    renderText(ctx, w, h)
    setImageUrl(canvas.toDataURL('image/png'))
  }

  function renderText(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (item?.title) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(item.title, w / 2, 590)
    }

    ctx.fillStyle = '#a080e0'
    ctx.font = 'bold 28px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(review.title || '影评', w / 2, 640)

    const starY = 680
    ctx.font = '24px sans-serif'
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < review.rating ? '#f0c040' : '#555'
      ctx.fillText(i < review.rating ? '★' : '☆', w / 2 - 60 + i * 30, starY)
    }

    const contentText = review.content || ''
    const lines = wrapText(ctx, contentText, w - 160)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
      ctx.fillText(lines[i], 80, 750 + i * 32)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '16px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🌳 树洞 · 观影手帳', w / 2, h - 60)
    ctx.fillText(new Date().toLocaleDateString('zh-CN'), w / 2, h - 35)
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `影评_${review.title}_${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  }

  const handleShare = async () => {
    if (!imageUrl) return
    try {
      const blob = await (await fetch(imageUrl)).blob()
      const file = new File([blob], 'poster.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: review.title })
      } else {
        handleDownload()
      }
    } catch {
      handleDownload()
    }
  }

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="hidden" />
      {imageUrl && (
        <>
          <img src={imageUrl} alt="海报预览" className="w-full max-w-[375px] rounded-xl shadow-2xl mx-auto" />
          <div className="flex gap-2 justify-center">
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              <Download size={14} /> 下载
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text)]">
              <Share2 size={14} /> 分享
            </button>
          </div>
        </>
      )}
    </div>
  )
}
