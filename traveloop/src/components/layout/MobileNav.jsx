import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, Plus, Wallet, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { icon: Home,    label: 'Home',   path: '/' },
  { icon: Compass, label: 'Trips',  path: '/trips' },
  { icon: Wallet,  label: 'Budget', path: '/budget' },
  { icon: User,    label: 'Profile',path: '/profile' },
]

export const MobileNav = () => {
  const location = useLocation()

  return (
    <nav className="mobile-nav fixed inset-x-0 bottom-0 z-50 flex lg:hidden bg-white/80 backdrop-blur-xl border-t border-parchment">
      <div className="relative flex w-full items-center justify-around px-2 py-2">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'p-2 flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center',
                isActive ? 'text-amber-dark' : 'text-ghost'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="font-body text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Floating Action Button */}
        <div className="relative -top-6 flex flex-col items-center">
          <Link
            to="/trips/new"
            className="w-14 h-14 bg-amber text-dusk rounded-full flex items-center justify-center shadow-lg shadow-amber/30 active:scale-95 transition-transform"
          >
            <Plus className="w-7 h-7" />
          </Link>
          <span className="font-body -mt-0.5 text-[10px] font-medium text-ghost">Plan Trip</span>
        </div>

        {navItems.slice(2).map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'p-2 flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center',
                isActive ? 'text-amber-dark' : 'text-ghost'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="font-body text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
