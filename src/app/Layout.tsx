import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Button } from './components/ui/Button'
import { useEffect } from 'react'
import './Layout.scss'

export function Layout() {
  const location = useLocation()
  const { user, profile, signOut, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          Loading... (User: {user ? 'Yes' : 'No'}, Profile: {profile ? 'Yes' : 'No'})
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <header className="header">
        <nav className="header__nav">
          <Link to="/" className="header__logo">
            🍳 Recipes App
          </Link>
          <div className="header__links">
            <Link
              to="/"
              className={`header__link ${isActive('/') ? 'header__link--active' : ''}`}
            >
              Recipes
            </Link>
            <Link
              to="/goods"
              className={`header__link ${isActive('/goods') ? 'header__link--active' : ''}`}
            >
              Goods
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`header__link ${isActive('/profile') ? 'header__link--active' : ''}`}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className={`header__link ${isActive('/settings') ? 'header__link--active' : ''}`}
                >
                  Settings
                </Link>
                <div className="user-menu">
                  <span className="user-greeting">
                    Hello, {profile?.username || user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className={`header__link ${isActive('/auth') ? 'header__link--active' : ''}`}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}