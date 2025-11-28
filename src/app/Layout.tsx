import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.scss';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
          </div>
        </nav>
      </header>
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}