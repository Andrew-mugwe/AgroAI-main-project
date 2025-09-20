import { ReactNode } from 'react'

interface UserMenuProps {
  children?: ReactNode
}

export function UserMenu({ children }: UserMenuProps) {
  return (
    <div className="user-menu">
      {children}
    </div>
  )
}
