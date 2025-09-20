import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Menu as MenuIcon,
  Home,
  Store,
  LogIn,
  UserPlus,
  Users,
  Tractor,
  School,
  ShoppingBag,
  Search,
  ChevronRight,
  X,
  BarChart3,
  MessageSquare,
  Bug
} from 'lucide-react'

// Menu items data structure
const menuItems = {
  public: [
    { to: '/', icon: Home, label: 'Homepage', shortcut: '⌘H' },
    { to: '/features', icon: BarChart3, label: 'Features', shortcut: '⌘F' },
    { to: '/marketplace', icon: Store, label: 'Marketplace', shortcut: '⌘M' }
  ],
  features: [
    { to: '/features/chat', icon: MessageSquare, label: 'Chat & Messaging', shortcut: '⌘C' },
    { to: '/features/pest-detection', icon: Bug, label: 'Pest Detection', shortcut: '⌘P' }
  ],
  auth: [
    { to: '/auth/login', icon: LogIn, label: 'Login', shortcut: '⌘L' },
    { to: '/auth/register', icon: UserPlus, label: 'Register', shortcut: '⌘R' },
    { to: '/auth/role-selection', icon: Users, label: 'Role Selection', shortcut: '⌘S' }
  ],
  dashboards: [
    { to: '/dashboard/farmer', icon: Tractor, label: 'Farmer Dashboard', shortcut: '⌘1' },
    { to: '/dashboard/ngo', icon: School, label: 'NGO Dashboard', shortcut: '⌘2' },
    { to: '/dashboard/trader', icon: ShoppingBag, label: 'Trader Dashboard', shortcut: '⌘3' }
  ]
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Flatten menu items for search and keyboard navigation
  const allItems = [...menuItems.public, ...menuItems.features, ...menuItems.auth, ...menuItems.dashboards]

  // Filter items based on search query
  const filteredItems = searchQuery
    ? allItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setSelectedIndex(-1)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0) {
            const selected = filteredItems[selectedIndex]
            navigate(selected.to)
            setIsOpen(false)
            setSearchQuery('')
            setSelectedIndex(-1)
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setSearchQuery('')
          setSelectedIndex(-1)
          break
      }
    }

    // Handle keyboard shortcuts
    function handleShortcuts(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
        const key = event.key.toUpperCase()
        const item = allItems.find(item => item.shortcut.endsWith(key))
        if (item) {
          event.preventDefault()
          navigate(item.to)
          setIsOpen(false)
          setSearchQuery('')
          setSelectedIndex(-1)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', handleShortcuts)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleShortcuts)
    }
  }, [isOpen, selectedIndex, filteredItems, navigate])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setSearchQuery('')
    setSelectedIndex(-1)
  }

  return (
    <nav className="relative z-50" ref={menuRef}>
      {/* Menu Toggle Button with Text */}
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MenuIcon className="h-5 w-5" />
        <span className="text-sm font-medium leading-none">Menu</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-14 left-0 right-0 md:absolute md:top-full md:left-0 md:right-auto mt-2 w-full md:w-80 rounded-none md:rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search menu... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain">
            {searchQuery ? (
              <div className="p-3">
                {filteredItems.length > 0 ? (
                  <div className="space-y-0.5">
                    {filteredItems.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                            index === selectedIndex
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                          onClick={() => {
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${
                              index === selectedIndex ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.shortcut}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Public Section */}
                <div className="p-3">
                  <h3 className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500">Public</h3>
                  <div className="space-y-0.5">
                    {menuItems.public.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                            index === selectedIndex
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${
                              index === selectedIndex ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.shortcut}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Features Section */}
                <div className="p-3 border-t border-gray-100">
                  <h3 className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500">Features</h3>
                  <div className="space-y-0.5">
                    {menuItems.features.map((item, index) => {
                      const Icon = item.icon
                      const itemIndex = index + menuItems.public.length
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                            itemIndex === selectedIndex
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${
                              itemIndex === selectedIndex ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.shortcut}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Auth Section */}
                <div className="p-3 border-t border-gray-100">
                  <h3 className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500">Authentication</h3>
                  <div className="space-y-0.5">
                    {menuItems.auth.map((item, index) => {
                      const Icon = item.icon
                      const itemIndex = index + menuItems.public.length
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                            itemIndex === selectedIndex
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${
                              itemIndex === selectedIndex ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.shortcut}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Dashboards Section */}
                <div className="p-3 border-t border-gray-100">
                  <h3 className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500">Dashboards</h3>
                  <div className="space-y-0.5">
                    {menuItems.dashboards.map((item, index) => {
                      const Icon = item.icon
                      const itemIndex = index + menuItems.public.length + menuItems.auth.length
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                            itemIndex === selectedIndex
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${
                              itemIndex === selectedIndex ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.shortcut}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}