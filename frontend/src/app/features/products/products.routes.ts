import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: ':slug',
    loadComponent: () => import('./pages/product-detail.page').then((m) => m.ProductDetailPage),
  },
];
