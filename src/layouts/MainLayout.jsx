import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar  from '../components/common/Topbar'
import './MainLayout.css'

export default function MainLayout() {
  return (
    <div className="ht-app">
      <Sidebar />
      <div className="ht-main">
        <Topbar />
        <main className="ht-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
