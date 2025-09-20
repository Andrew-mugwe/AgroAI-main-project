import { Menu, Search, Heart, ChevronDown, User } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu and Search */}
          <div className="flex items-center space-x-8">
            {/* Menu */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Menu className="h-5 w-5" />
              <span className="text-sm font-medium">Menu</span>
            </button>
            
            {/* Search */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Search className="h-5 w-5" />
              <span className="text-sm font-medium">Search</span>
            </button>
          </div>

          {/* Center Section - Logo */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              AGROAI
            </h1>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-6">
            {/* Call Us */}
            <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Call Us
            </button>

            {/* Heart Icon */}
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Heart className="h-5 w-5" />
            </button>

            {/* Language Selector */}
            <div className="flex items-center space-x-1">
              <select className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>

            {/* Circular C Icon */}
            <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-gray-700 transition-colors">
              C
            </button>

            {/* User Profile Icon */}
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
