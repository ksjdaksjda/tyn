import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Moon, Sun, Settings } from 'lucide-react'

interface BookReaderProps {
  content: string
  title?: string
  initialPosition?: number
  onProgress?: (percent: number) => void
}

export default function BookReader({ content, title, initialPosition = 0, onProgress }: BookReaderProps) {
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [darkMode, setDarkMode] = useState(false)
  const [scrollPos, setScrollPos] = useState(initialPosition)
  const [showSettings, setShowSettings] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse content into paragraphs
  const paragraphs = content.split(/\n+/).filter(p => p.trim())

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const pos = el.scrollTop
    const max = el.scrollHeight - el.clientHeight
    const percent = max > 0 ? Math.round((pos / max) * 100) : 0
    setScrollPos(percent)
    onProgress?.(percent)
  }, [onProgress])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (initialPosition > 0 && el.scrollHeight > el.clientHeight) {
      const max = el.scrollHeight - el.clientHeight
      el.scrollTop = (initialPosition / 100) * max
    }
  }, [initialPosition, content])

  const scrollTo = (direction: 'prev' | 'next') => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ top: direction === 'next' ? el.clientHeight * 0.8 : -el.clientHeight * 0.8, behavior: 'smooth' })
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-amber-50 text-gray-800'}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-2 border-b" style={{
        background: darkMode ? 'rgba(17,24,39,0.95)' : 'rgba(255,251,235,0.95)',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        backdropFilter: 'blur(8px)',
      }}>
        <span className="text-sm font-medium truncate max-w-[200px]">{title || '阅读中...'}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-50">{scrollPos}%</span>
          <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="p-1.5 rounded hover:bg-black/10"><ZoomOut size={14} /></button>
          <button onClick={() => setFontSize(f => Math.min(28, f + 2))} className="p-1.5 rounded hover:bg-black/10"><ZoomIn size={14} /></button>
          <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded hover:bg-black/10">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded hover:bg-black/10"><Settings size={14} /></button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="p-3 border-b flex flex-wrap gap-4 text-sm" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <label className="flex items-center gap-2">
            字体: {fontSize}px
            <input type="range" min={12} max={28} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-20" />
          </label>
          <label className="flex items-center gap-2">
            行距: {lineHeight.toFixed(1)}
            <input type="range" min={1.2} max={3.0} step={0.2} value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))} className="w-20" />
          </label>
        </div>
      )}

      {/* Content */}
      <div
        ref={containerRef}
        className="p-6 md:p-10 overflow-y-auto transition-all"
        style={{ height: 'calc(100vh - 200px)', fontSize: `${fontSize}px`, lineHeight }}
        onScroll={handleScroll}
      >
        {paragraphs.length === 0 ? (
          <p className="text-center opacity-50 mt-20">暂无内容</p>
        ) : (
          paragraphs.map((para, i) => (
            <p key={i} className="mb-4 indent-8 leading-relaxed">{para}</p>
          ))
        )}
      </div>

      {/* Page navigation */}
      <div className="flex justify-between p-2 border-t" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
        <button onClick={() => scrollTo('prev')} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-black/10"><ChevronLeft size={14} /> 上一页</button>
        <button onClick={() => scrollTo('next')} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-black/10">下一页 <ChevronRight size={14} /></button>
      </div>
    </div>
  )
}
