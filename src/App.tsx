import { Component } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ShelfPage from './pages/ShelfPage'
import BookshelfPage from './pages/BookshelfPage'
import WatchlistPage from './pages/WatchlistPage'
import ChecklistPage from './pages/ChecklistPage'
import ReviewsPage from './pages/ReviewsPage'
import JournalPage from './pages/JournalPage'
import QuotationsPage from './pages/QuotationsPage'
import ArchivePage from './pages/ArchivePage'
import ReadingReportPage from './pages/ReadingReportPage'
import ImportPage from './pages/ImportPage'
import SettingsPage from './pages/SettingsPage'
import PlayerPage from './pages/PlayerPage'
import ReaderPage from './pages/ReaderPage'

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: '#c8d0e0', fontFamily: 'sans-serif', padding: 40, textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 48, marginBottom: 8 }}>🌳</h1>
            <h2 style={{ color: '#a080e0' }}>页面加载出错</h2>
            <p style={{ color: '#7888a8', fontSize: 14, maxWidth: 500, margin: '12px auto' }}>{this.state.error?.message}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
                style={{ padding: '10px 32px', background: 'linear-gradient(135deg, #a080e0, #60a0d8)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
                重新加载
              </button>
              <button onClick={() => { try { localStorage.removeItem('treehole_items'); localStorage.removeItem('treehole_reviews'); } catch {} this.setState({ error: null }); window.location.reload() }}
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
    </ErrorBoundary>
  )
}
