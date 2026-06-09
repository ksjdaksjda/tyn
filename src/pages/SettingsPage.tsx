import { useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { THEMES } from '@/lib/themes'

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const [deepseekKey, setDeepseekKey] = useState(() => localStorage.getItem('deepseek-api-key') || '')
  const [saved, setSaved] = useState(false)

  const saveKey = () => {
    if (deepseekKey.trim()) { localStorage.setItem('deepseek-api-key', deepseekKey.trim()) }
    else { localStorage.removeItem('deepseek-api-key') }
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = { items: JSON.parse(localStorage.getItem('treehole_items')||'[]'), reviews: JSON.parse(localStorage.getItem('treehole_reviews')||'[]') }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `treehole_backup_${new Date().toISOString().slice(0,10)}.json`; a.click()
  }

  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.items) localStorage.setItem('treehole_items', JSON.stringify(data.items))
          if (data.reviews) localStorage.setItem('treehole_reviews', JSON.stringify(data.reviews))
          alert('导入成功！请刷新页面。'); window.location.reload()
        } catch { alert('文件格式错误') }
      }; reader.readAsText(file)
    }; input.click()
  }

  const handleClear = () => {
    if (confirm('确定清除全部数据？此操作不可恢复！')) {
      localStorage.removeItem('treehole_items'); localStorage.removeItem('treehole_reviews')
      alert('数据已清除'); window.location.reload()
    }
  }

  return (
    <div>
      <h1 className="section-title">⚙️ 个人中心</h1>
      <div style={{ display:'grid', gap:14, maxWidth:700, margin:'0 auto', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))' }}>

        {/* Theme */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:18, backdropFilter:'blur(8px)' }}>
          <h4 className="text-[0.82rem] tracking-[1px] flex items-center gap-1.5 mb-3" style={{ color:'var(--text-muted)' }}>🎨 主题预设</h4>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className="text-center p-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{ borderColor: theme===t.id?'var(--accent)':'var(--border)', background: theme===t.id?'var(--tag-bg)':'transparent' }}>
                <span className="block w-5 h-5 rounded-full mx-auto mb-1" style={{ background:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})` }} />
                <span className="text-[0.65rem]" style={{ color: theme===t.id?'var(--accent)':'var(--text-muted)' }}>{t.icon} {t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DeepSeek */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:18, backdropFilter:'blur(8px)' }}>
          <h4 className="text-[0.82rem] tracking-[1px] flex items-center gap-1.5 mb-3" style={{ color:'var(--text-muted)' }}>🤖 DeepSeek AI</h4>
          <p className="text-[0.72rem] mb-2" style={{ color:'var(--text-muted)' }}>填入密钥使用AI润色和推荐。密钥仅存本地。</p>
          <div className="flex gap-2">
            <input type="password" value={deepseekKey} onChange={e=>setDeepseekKey(e.target.value)} placeholder="sk-xxx"
              className="flex-1 px-2.5 py-2 rounded-[10px] border text-[0.82rem] font-[inherit] outline-none transition-all focus:border-[var(--accent)]"
              style={{ borderColor:'var(--border)', background:'var(--input-bg)', color:'var(--text)' }} />
            <button onClick={saveKey} className="btn btn-primary btn-sm">{saved?'✅':'保存'}</button>
          </div>
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer"
            className="text-[0.65rem] mt-1.5 inline-block" style={{ color:'var(--accent)' }}>获取 Key →</a>
        </div>

        {/* Data */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:18, backdropFilter:'blur(8px)', gridColumn:'1/-1' }}>
          <h4 className="text-[0.82rem] tracking-[1px] flex items-center gap-1.5 mb-3" style={{ color:'var(--text-muted)' }}>💾 数据管理</h4>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="btn btn-sm">📤 导出数据</button>
            <button onClick={handleImport} className="btn btn-sm">📥 导入数据</button>
            <button onClick={handleClear} className="btn btn-sm btn-danger">🗑 清除全部</button>
          </div>
        </div>
      </div>
    </div>
  )
}
