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
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile menu button */}
      <button onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-2.5 left-2.5 z-[101] w-9 h-9 rounded-full flex items-center justify-center text-xl"
        style={{ background: 'var(--nav-bg)', border: '1px solid var(--border)', color: 'var(--text)', backdropFilter: 'blur(8px)' }}>
        <Menu size={18} />
      </button>

      {/* Main content — exact original layout */}
      <div className="lg:ml-[200px] flex-1"
        style={{
          padding: '16px 24px 40px',
          maxWidth: 'calc(100vw - 200px)',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}>
        <div className="page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </div>

      {/* Responsive styles for mobile */}
      <style>{`
        @media(max-width:768px){
          .lg\\:ml-\\[200px\\]{margin-left:0!important;max-width:100%!important;padding:56px 10px 40px!important;}
        }
      `}</style>
    </div>
  )
}
