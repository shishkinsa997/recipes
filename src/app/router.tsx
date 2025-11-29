import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { RecipesPage } from '../pages/recipes/RecipesPage';
import { GoodsPage } from '../pages/goods/GoodsPage';
import { RecipeDetail } from '../pages/recipes/RecipeDetail';
import { Profile } from '../pages/profile/Profile';
import { Auth } from '../pages/auth/Auth';
import { Settings } from '../pages/settings/Settings';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../pages/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RecipesPage /> },
      { path: 'goods', element: <GoodsPage /> },
      { path: 'recipe/:id', element: <RecipeDetail /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: 'auth', element: <Auth /> },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);