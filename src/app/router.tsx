import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { RecipesPage } from '../pages/recipes/RecipesPage';
import { GoodsPage } from '../pages/goods/GoodsPage';
import { NotFound } from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RecipesPage /> },
      { path: 'goods', element: <GoodsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
