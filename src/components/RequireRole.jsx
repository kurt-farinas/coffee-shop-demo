import { Navigate } from 'react-router-dom'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee, homeFor } from '../auth/roles.js'

export function RequireRole({ page, children }) {
  const { role } = useRole()
  if (!role) return <Navigate to="/login" replace />
  if (!canSee(role, page)) return <Navigate to={homeFor(role)} replace />
  return children
}
