// Route guards: RequireAuth wraps the app shell, RequireRole wraps /admin.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { user, restoring } = useAuth()
  const location = useLocation()

  if (restoring) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d14]">
        <div className="text-sm text-[#64748b]">Loading…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}

export function RequireRole({ roles }: { roles: string[] }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}
