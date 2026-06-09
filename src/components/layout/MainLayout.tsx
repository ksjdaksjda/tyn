import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BgCanvas from './BgCanvas'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <BgCanvas />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-2.5 left-2.5 z-[101] w-9 h-9 rounded-full flex items-center justify-center text-xl"
        style={{ background: 'var(--nav-bg)', border: '1px solid var(--border)', color: 'var(--text)', backdropFilter: 'blur(8px)' }}
      >
        <Menu size={18} />
      </button>

      {/* Main content */}
      <div className="lg:ml-[200px] flex-1 transition-all duration-300"
        style={{ padding: '16px 24px 40px', maxWidth: 'calc(100vw - 200px)', minHeight: '100vh' }}>
        <div className="page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
