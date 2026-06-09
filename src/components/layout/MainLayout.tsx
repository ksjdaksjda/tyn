import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BgCanvas from './BgCanvas'
import TopFilterBar from './TopFilterBar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <BgCanvas />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 lg:ml-[200px] transition-all duration-300">
        <TopFilterBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 md:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
