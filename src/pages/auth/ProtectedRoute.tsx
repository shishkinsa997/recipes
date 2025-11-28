import { useEffect } from 'react'
import { useAuthStore } from '../../app/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>Please log in to view this page.</p>
        <a href="/auth">Go to Login</a>
      </div>
    )
  }

  return <>{children}</>
}