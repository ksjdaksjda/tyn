import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/stores/themeStore'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type?: string
  life?: number
  maxLife?: number
}

export default function BgCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      initParticles()
    }

    window.addEventListener('resize', resize)

    function initParticles() {
      const count = theme === 'starry' ? 120 : theme === 'rain' ? 80 : 40
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        type: theme === 'rain' ? 'drop' : theme === 'spring' ? 'petal' : 'dot',
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 100,
      }))
    }

    function getAccentColor(a: number) {
      const style = getComputedStyle(document.documentElement)
      const raw = style.getPropertyValue('--accent').trim()
      // Parse hex color
      const hex = raw.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r},${g},${b},${a})`
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      const particles = particlesRef.current

      for (const p of particles) {
        if (theme === 'rain') {
          // Falling rain drops
          p.y += p.vy * 2
          if (p.y > h) { p.y = -10; p.x = Math.random() * w }
          ctx!.beginPath()
          ctx!.moveTo(p.x, p.y)
          ctx!.lineTo(p.x - p.vx, p.y - 8)
          ctx!.strokeStyle = getAccentColor(p.opacity)
          ctx!.lineWidth = 0.5
          ctx!.stroke()
        } else if (theme === 'spring') {
          // Falling petals
          p.y += p.vy * 0.8
          p.x += Math.sin(p.y * 0.02) * 0.5
          if (p.y > h) { p.y = -20; p.x = Math.random() * w }
          ctx!.save()
          ctx!.translate(p.x, p.y)
          ctx!.rotate(p.vy * 2)
          ctx!.fillStyle = getAccentColor(p.opacity)
          ctx!.beginPath()
          ctx!.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.restore()
        } else if (theme === 'starry') {
          // Twinkling stars
          p.opacity += (Math.random() - 0.5) * 0.02
          p.opacity = Math.max(0.05, Math.min(0.8, p.opacity))
          p.x += p.vx * 0.3
          p.y += p.vy * 0.3
          if (p.x < 0) p.x = w
          if (p.x > w) p.x = 0
          if (p.y < 0) p.y = h
          if (p.y > h) p.y = 0
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx!.fillStyle = getAccentColor(p.opacity)
          ctx!.fill()
        } else {
          // Floating dots (ocean, dusk, forest, polar, autumn)
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = w
          if (p.x > w) p.x = 0
          if (p.y < 0) p.y = h
          if (p.y > h) p.y = 0
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx!.fillStyle = getAccentColor(p.opacity * 0.3)
          ctx!.fill()
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    initParticles()
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  )
}
