import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { LuxuryHeader } from './LuxuryHeader'
import { LuxuryFooter } from './LuxuryFooter'

interface LayoutProps {
  children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <LuxuryHeader>
        <Navigation />
      </LuxuryHeader>

      {/* Main Content */}
      <main className="flex-grow">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <LuxuryFooter />
    </div>
  )
}