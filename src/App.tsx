import { Component, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// Lazy-load all pages — reduces initial bundle execution pressure
const MainLayout = lazy(() => import('./components/layout/MainLayout'))
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ShelfPage = lazy(() => import('./pages/ShelfPage'))
const BookshelfPage = lazy(() => import('./pages/BookshelfPage'))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'))
const ChecklistPage = lazy(() => import('./pages/ChecklistPage'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'))
const JournalPage = lazy(() => import('./pages/JournalPage'))
const QuotationsPage = lazy(() => import('./pages/QuotationsPage'))
const ArchivePage = lazy(() => import('./pages/ArchivePage'))
const ReadingReportPage = lazy(() => import('./pages/ReadingReportPage'))
const ImportPage = lazy(() => import('./pages/ImportPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const ReaderPage = lazy(() => import('./pages/ReaderPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>加载中...</div>
    </div>
  )
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || '未知错误'
      const stack = this.state.error?.stack || ''
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: '#c8d0e0', fontFamily: 'sans-serif', padding: 40, textAlign: 'center' }}>
          <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: 48, marginBottom: 8 }}>🌳</h1>
            <h2 style={{ color: '#a080e0' }}>页面出错</h2>
            <p style={{ color: '#e06060', fontSize: 14, margin: '12px 0' }}>{msg}</p>
            <pre style={{ textAlign: 'left', fontSize: 11, maxHeight: 200, overflow: 'auto', background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, color: '#aaa', whiteSpace: 'pre-wrap' }}>{stack.slice(0, 500)}</pre>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
                style={{ padding: '10px 32px', background: 'linear-gradient(135deg, #a080e0, #60a0d8)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
                重试
              </button>
              <button onClick={() => { try { localStorage.clear() } catch {} this.setState({ error: null }); window.location.reload() }}
                style={{ padding: '10px 32px', background: '#e06060', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
                清除数据恢复
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shelf" element={<ShelfPage />} />
            <Route path="/shelf/books" element={<BookshelfPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reviews/:itemId" element={<ReviewsPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:itemId" element={<JournalPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/report" element={<ReadingReportPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/search" element={<ImportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/player/:itemId" element={<PlayerPage />} />
            <Route path="/reader/:itemId" element={<ReaderPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
