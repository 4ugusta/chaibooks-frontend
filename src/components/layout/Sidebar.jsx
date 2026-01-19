import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ArrowLeftRight,
  BarChart3,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Items', to: '/items', icon: Package },
  { name: 'Invoices', to: '/invoices', icon: FileText },
  { name: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { name: 'Reports', to: '/reports', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings }
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">ChaiBooks</h1>
      </div>
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
