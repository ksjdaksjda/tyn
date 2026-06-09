import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BgCanvas from './BgCanvas'

export default function MainLayout() {
  const location = useLocation()

  return (
    <>
      <BgCanvas />
      <Sidebar isOpen={false} onToggle={() => {}} onClose={() => {}} />
      <div className="main-container page-enter" key={location.pathname}>
        <Outlet />
      </div>
    </>
  )
}
