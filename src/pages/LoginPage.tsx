export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="glass p-8 md:p-12 max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-shimmer">🌳 树洞</h1>
        <p className="text-[var(--text-muted)]">观影手帐管理系统</p>
        <button className="w-full py-3 px-6 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
          🔐 使用 GitHub 登录
        </button>
        <p className="text-xs text-[var(--text-muted)]">登录即表示同意服务条款</p>
      </div>
    </div>
  )
}
