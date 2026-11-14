import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getSafeAuthReturnTo } from '../../lib/authRedirect'

function AuthLoading() {
  return (
    <main className="auth-loading" role="status">
      <span className="auth-loading-mark" aria-hidden="true">P</span>
      <p>Preparing your visit...</p>
    </main>
  )
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthLoading />
  if (!user) return <Navigate to="/sign-in" replace state={{ from: location }} />
  return <Outlet />
}

export function GuestRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthLoading />
  if (user) {
    return <Navigate to={getSafeAuthReturnTo(location.state?.from)} replace />
  }
  return <Outlet />
}
