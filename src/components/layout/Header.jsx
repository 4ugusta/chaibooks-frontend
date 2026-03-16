import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { LogOut, Moon, Sun, Menu } from 'lucide-react'

export default function Header({ onMenuToggle }) {
  const { user, logout } = useAuthStore()
  const { toggleTheme } = useThemeStore()
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="btn-icon text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 md:hidden flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
            {user?.businessDetails?.businessName || 'ChaiBooks'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="btn-icon text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={logout}
          className="btn-icon md:px-4 md:py-2 md:min-w-0 text-sm font-medium text-danger-700 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden md:inline ml-2">Logout</span>
        </button>
      </div>
    </header>
  )
}
