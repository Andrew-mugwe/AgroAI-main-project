import { Globe, ChevronDown } from 'lucide-react'

interface LuxuryFooterProps {
  links: Array<{
    label: string
    onClick: () => void
  }>
}

export function LuxuryFooter({ links }: LuxuryFooterProps) {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-amber-200/50 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {links.map((link, index) => (
              <button
                key={index}
                onClick={link.onClick}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Globe className="w-4 h-4" />
              <span>English</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
