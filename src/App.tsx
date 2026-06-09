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

export default function App() {
  return (
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
  )
}
