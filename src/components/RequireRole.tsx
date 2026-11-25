import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { Role } from '../types'
import { nav } from './Layout'

/** FR-2: block direct URL access to pages the current role is not allowed to see. */
export default function RequireRole({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" replace />

  const allowed = roles ?? nav.find(n => {
    if (n.to === '/') return pathname === '/'
    return pathname === n.to || pathname.startsWith(n.to + '/')
  })?.roles

  // Member profile lives under /members/:id — staff/admin/trainer only (same as Members list)
  if (pathname.startsWith('/members/')) {
    if (!['admin', 'staff', 'trainer'].includes(user.role)) {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }

  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
