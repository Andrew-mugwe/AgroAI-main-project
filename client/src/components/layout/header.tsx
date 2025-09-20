import { Menu, Search, Heart, ChevronDown, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu and Search */}
          <div className="flex items-center space-x-8">
            {/* Menu */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group">
              <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">Menu</span>
            </button>
            
            {/* Search */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group">
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">Search</span>
            </button>
          </div>

          {/* Center Section - Logo */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight luxury-font">
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
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 transform duration-200">
              <Heart className="h-5 w-5" />
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <select className="appearance-none bg-gray-100 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer pr-8 font-medium transition-all duration-200">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Circular C Icon */}
            <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-gray-700 transition-colors hover:scale-110 transform duration-200">
              C
            </button>

            {/* User Profile Icon - Links to Auth Pages */}
            <Link to="/login" className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 transform duration-200">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
