import { useState } from 'react'
import { MessageSquare, Send, Sparkles, X } from 'lucide-react'
import { useAI } from '@/hooks/useAI'

interface AiChatProps {
  context?: string
  onClose?: () => void
}

export default function AiChat({ context = '', onClose }: AiChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const { chat, loading, hasKey } = useAI()

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])

    try {
      const ctx = context || '用户正在浏览影评网站'
      const reply = await chat(userMsg, ctx)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ 错误: ${e.message}` }])
    }
  }

  if (!hasKey) {
    return (
      <div className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5"><Sparkles size={14} /> AI 助手</h3>
          {onClose && <button onClick={onClose}><X size={14} /></button>}
        </div>
        <p className="text-xs text-[var(--text-muted)]">请在设置中配置 DeepSeek API Key 以使用 AI 功能</p>
      </div>
    )
  }

  return (
    <div className="glass flex flex-col" style={{ maxHeight: '400px' }}>
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5"><Sparkles size={14} className="text-[var(--accent)]" /> AI 助手</h3>
        {onClose && <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded"><X size={14} /></button>}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm" style={{ minHeight: '200px' }}>
        {messages.length === 0 && (
          <p className="text-xs text-[var(--text-muted)]">问我关于你的观影记录、推荐或任何问题！</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded-lg text-xs ${msg.role === 'user' ? 'bg-[var(--accent2-dim)] ml-4' : 'bg-[var(--input-bg)] mr-4'}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-xs text-[var(--text-muted)] animate-pulse">🤔 思考中...</div>}
      </div>

      <div className="p-2 border-t border-[var(--border)] flex gap-1">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="问 DeepSeek..."
          className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="p-1.5 rounded-lg text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
