import { useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { THEMES } from '@/lib/themes'

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const [deepseekKey, setDeepseekKey] = useState(() => localStorage.getItem('deepseek-api-key') || '')
  const [saved, setSaved] = useState(false)

  const saveKey = () => {
    if (deepseekKey.trim()) {
      localStorage.setItem('deepseek-api-key', deepseekKey.trim())
    } else {
      localStorage.removeItem('deepseek-api-key')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--text)]">⚙️ 设置</h1>

      {/* Theme */}
      <section className="glass p-5 space-y-3">
        <h2 className="font-semibold text-[var(--text)]">🎨 主题</h2>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex items-center gap-2 p-2 rounded-lg border transition-all text-sm"
              style={{
                borderColor: theme === t.id ? 'var(--accent)' : 'var(--border)',
                background: theme === t.id ? 'var(--accent2-dim)' : 'transparent',
              }}
            >
              <span
                className="w-4 h-4 rounded-full"
                style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
              />
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* DeepSeek API */}
      <section className="glass p-5 space-y-3">
        <h2 className="font-semibold text-[var(--text)]">🤖 DeepSeek AI 配置</h2>
        <p className="text-xs text-[var(--text-muted)]">
          填入你的 DeepSeek API Key 即可使用 AI 影评润色和智能推荐功能。密钥仅存储在浏览器本地，不会上传到服务器。
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" className="text-[var(--accent)] ml-1">获取 Key →</a>
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={deepseekKey}
            onChange={(e) => setDeepseekKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxx"
            className="flex-1 px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            onClick={saveKey}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
            style={{ background: saved ? 'var(--accent2)' : 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {saved ? '✅ 已保存' : '保存'}
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="glass p-5 space-y-3">
        <h2 className="font-semibold text-[var(--text)]">💾 数据管理</h2>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-white/10">
            📤 导出数据
          </button>
          <button className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-white/10">
            📥 导入数据
          </button>
          <button className="px-3 py-1.5 text-xs rounded-lg border border-[var(--danger)] text-[var(--danger)] hover:bg-red-50">
            🗑 清除全部数据
          </button>
        </div>
      </section>
    </div>
  )
}
