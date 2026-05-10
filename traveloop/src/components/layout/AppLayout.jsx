import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <main className="main-content min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
