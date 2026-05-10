import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, MapPin, Wallet, Briefcase, FileText, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { icon: Home,      label: 'Home',    path: '/' },
  { icon: Compass,   label: 'Trips',   path: '/trips' },
  { icon: MapPin,    label: 'Search',  path: '/search' },
  { icon: Wallet,    label: 'Budget',  path: '/budget' },
  { icon: Briefcase, label: 'Pack',    path: '/pack' },
  { icon: FileText,  label: 'Notes',   path: '/notes' },
  { icon: User,      label: 'Profile', path: '/profile' },
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <aside className="sidebar fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-parchment bg-white px-5 py-8 lg:flex">
      {/* Logo */}
      <div className="mb-10 px-3">
        <h1 className="font-display text-2xl font-bold text-dusk">Traveloop</h1>
        <p className="font-body text-xs text-ghost mt-0.5">Plan your next adventure</p>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all duration-200',
                isActive
                  ? 'bg-sand text-dusk border-l-2 border-amber'
                  : 'text-mist hover:text-dusk hover:bg-sand'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
