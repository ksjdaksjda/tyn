import { useState, useRef, useCallback, useEffect } from 'react'
import { Save, Undo, Redo, Image, Type, Pen, Eraser, Download, Trash2 } from 'lucide-react'

interface JournalElement {
  id: string
  type: 'text' | 'image' | 'drawing'
  x: number; y: number; w: number; h: number
  rotation: number; zIndex: number
  content?: string; fontSize?: number; color?: string
  src?: string
}

const TEMPLATES = [
  { name: '影评模板', elements: [] },
  { name: '金句摘录', elements: [] },
  { name: '海报模式', elements: [] },
  { name: '空白', elements: [] },
]

const PAPER_MODES = ['solid', 'lined', 'grid', 'none'] as const

export default function JournalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elements, setElements] = useState<JournalElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'pen' | 'text' | 'eraser'>('select')
  const [paperMode, setPaperMode] = useState<typeof PAPER_MODES[number]>('solid')
  const [history, setHistory] = useState<JournalElement[][]>([[]])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [textPos, setTextPos] = useState({ x: 100, y: 100 })

  const pushHistory = useCallback((els: JournalElement[]) => {
    setHistory(h => [...h.slice(0, historyIdx + 1), els])
    setHistoryIdx(i => i + 1)
  }, [historyIdx])

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(i => i - 1)
      setElements(history[historyIdx - 1])
    }
  }

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(i => i + 1)
      setElements(history[historyIdx + 1])
    }
  }

  const addText = (content: string) => {
    const newEl: JournalElement = {
      id: crypto.randomUUID(), type: 'text',
      x: textPos.x, y: textPos.y, w: 200, h: 40,
      rotation: 0, zIndex: elements.length + 1,
      content, fontSize: 16, color: '#333',
    }
    const newElements = [...elements, newEl]
    setElements(newElements)
    pushHistory(newElements)
  }

  const addImage = () => {
    const url = prompt('输入图片URL:')
    if (!url) return
    const newEl: JournalElement = {
      id: crypto.randomUUID(), type: 'image',
      x: 100, y: 100, w: 200, h: 200,
      rotation: 0, zIndex: elements.length + 1, src: url,
    }
    const newElements = [...elements, newEl]
    setElements(newElements)
    pushHistory(newElements)
  }

  const clearAll = () => {
    if (!confirm('确定清空画布？')) return
    setElements([])
    pushHistory([])
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setTextPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        const text = prompt('输入文字:')
        if (text) addText(text)
      }
    }
  }

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Background
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Paper pattern
    if (paperMode === 'lined') {
      ctx.strokeStyle = '#e8e8f0'
      ctx.lineWidth = 0.5
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
    } else if (paperMode === 'grid') {
      ctx.strokeStyle = '#e8e8f0'
      ctx.lineWidth = 0.5
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
    }

    // Draw elements
    for (const el of elements) {
      ctx.save()
      ctx.translate(el.x + el.w / 2, el.y + el.h / 2)
      if (el.rotation) ctx.rotate((el.rotation * Math.PI) / 180)

      if (el.type === 'text' && el.content) {
        ctx.font = `${el.fontSize || 16}px "PingFang SC", sans-serif`
        ctx.fillStyle = el.color || '#333'
        ctx.fillText(el.content, -el.w / 2, 0)
      } else if (el.type === 'image' && el.src) {
        // Image rendering would be async; simplified for MVP
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(-el.w / 2, -el.h / 2, el.w, el.h)
        ctx.fillStyle = '#999'
        ctx.font = '12px sans-serif'
        ctx.fillText('🖼️ 图片', -20, 5)
      }

      // Selection highlight
      if (el.id === selectedId) {
        ctx.strokeStyle = 'var(--accent, #2a9db8)'
        ctx.lineWidth = 2
        ctx.strokeRect(-el.w / 2 - 4, -el.h / 2 - 4, el.w + 8, el.h + 8)
      }

      ctx.restore()
    }
  }, [elements, selectedId, paperMode])

  const exportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `手帐_${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="glass p-2 flex flex-wrap items-center gap-1">
        {[
          { id: 'select' as const, icon: Type, label: '选择' },
          { id: 'pen' as const, icon: Pen, label: '画笔' },
          { id: 'text' as const, icon: Type, label: '文字' },
          { id: 'eraser' as const, icon: Eraser, label: '橡皮' },
        ].map(t => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className={`p-1.5 rounded text-xs flex items-center gap-1 ${tool === t.id ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:bg-white/10'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
        <span className="w-px h-6 bg-[var(--border)] mx-1" />
        <button onClick={undo} className="p-1.5 rounded text-xs text-[var(--text-muted)] hover:bg-white/10"><Undo size={14} /></button>
        <button onClick={redo} className="p-1.5 rounded text-xs text-[var(--text-muted)] hover:bg-white/10"><Redo size={14} /></button>
        <button onClick={addImage} className="p-1.5 rounded text-xs text-[var(--text-muted)] hover:bg-white/10"><Image size={14} /></button>
        <span className="w-px h-6 bg-[var(--border)] mx-1" />
        <select value={paperMode} onChange={e => setPaperMode(e.target.value as any)} className="text-xs px-1 py-0.5 rounded border border-[var(--border)] bg-transparent">
          {PAPER_MODES.map(m => <option key={m} value={m}>{m === 'solid' ? '纯色' : m === 'lined' ? '横线' : m === 'grid' ? '网格' : '无'}</option>)}
        </select>
        <span className="flex-1" />
        <button onClick={exportPNG} className="p-1.5 rounded text-xs text-[var(--accent)] hover:bg-white/10"><Download size={14} /></button>
        <button onClick={clearAll} className="p-1.5 rounded text-xs text-[var(--danger)] hover:bg-white/10"><Trash2 size={14} /></button>
      </div>

      {/* Canvas area */}
      <div className="glass rounded-xl overflow-hidden" style={{ minHeight: 500 }}>
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height: '600px' }}
          onClick={handleCanvasClick}
        />
      </div>

      {/* Templates */}
      <div className="flex gap-1 flex-wrap">
        <span className="text-xs text-[var(--text-muted)] py-1">模板:</span>
        {TEMPLATES.map(t => (
          <button key={t.name} className="px-2 py-1 text-[10px] rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-white/10">
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}
