import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/account.page').then((m) => m.AccountPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'addresses',
    loadComponent: () => import('./pages/addresses.page').then((m) => m.AddressesPage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/order-history.page').then((m) => m.OrderHistoryPage),
  },
  {
    path: 'orders/:orderId',
    loadComponent: () => import('./pages/order-detail.page').then((m) => m.AccountOrderDetailPage),
  },
  {
    path: 'loyalty',
    loadComponent: () => import('./pages/loyalty.page').then((m) => m.LoyaltyPage),
  },
];
