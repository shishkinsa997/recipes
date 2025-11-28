import { Outlet, Link } from 'react-router-dom';

export function Layout() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">Recipes</Link>
          <Link to="/goods">Goods</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
