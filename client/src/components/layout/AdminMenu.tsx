import { ReactNode } from 'react'

interface AdminMenuProps {
  children?: ReactNode
}

export function AdminMenu({ children }: AdminMenuProps) {
  return (
    <div className="admin-menu">
      {children}
    </div>
  )
}
