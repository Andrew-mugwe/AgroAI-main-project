import { Search, Globe, Menu, Leaf } from 'lucide-react'

interface LuxuryHeaderProps {
  userInitials: string
  userName: string
  userRole: string
  userLocation: string
  roleColor: string
}

export function LuxuryHeader({
  userInitials,
  userName,
  userRole,
  userLocation,
  roleColor = 'blue'
}: LuxuryHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-amber-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 bg-gradient-to-br from-${roleColor}-600 to-${roleColor}-700 rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold">{userInitials}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{userName}</span>
                <span className={`px-2 py-1 bg-${roleColor}-100 text-${roleColor}-700 text-xs font-medium rounded-full`}>
                  {userRole}
                </span>
              </div>
              <p className="text-sm text-gray-500">{userLocation}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
              AgroAI
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
