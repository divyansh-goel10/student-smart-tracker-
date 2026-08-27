import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-ink">
        <p className="text-sm text-slate-400">Loading your tracker…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
