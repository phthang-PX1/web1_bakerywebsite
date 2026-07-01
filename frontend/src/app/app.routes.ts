import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public + member routes inside MainLayout (header + footer)
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then((m) => m.productsRoutes),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/pages/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/pages/checkout.page').then((m) => m.CheckoutPage),
      },
      {
        path: 'checkout/success',
        loadComponent: () => import('./features/checkout/pages/checkout-success.page').then((m) => m.CheckoutSuccessPage),
      },
      {
        path: 'orders/:orderId/track',
        canActivate: [authGuard],
        loadComponent: () => import('./features/checkout/pages/order-tracking.page').then((m) => m.OrderTrackingPage),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadChildren: () => import('./features/account/account.routes').then((m) => m.accountRoutes),
      },
      {
        path: 'blog',
        loadChildren: () => import('./features/blog/blog.routes').then((m) => m.blogRoutes),
      },
      {
        path: 'policies',
        loadChildren: () => import('./features/policies/policies.routes').then((m) => m.policiesRoutes),
      },
      {
        path: 'membership',
        loadComponent: () => import('./features/membership/pages/membership.page').then((m) => m.MembershipPage),
      },
    ],
  },

  // Auth routes — minimal header, no footer
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'activate/:token',
        loadComponent: () => import('./features/auth/pages/activate.page').then((m) => m.ActivatePage),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/pages/forgot-password.page').then((m) => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password/:token',
        loadComponent: () => import('./features/auth/pages/reset-password.page').then((m) => m.ResetPasswordPage),
      },
      {
        path: 'google/callback',
        loadComponent: () => import('./features/auth/pages/google-callback.page').then((m) => m.GoogleCallbackPage),
      },
    ],
  },

  // Custom cake — split layout, no footer
  {
    path: 'custom-cake',
    loadComponent: () =>
      import('./layouts/custom-cake-layout/custom-cake-layout.component').then((m) => m.CustomCakeLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/custom-cake/pages/custom-cake.page').then((m) => m.CustomCakePage),
      },
    ],
  },

  // Admin routes — sidebar layout, admin guard
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/pages/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/pages/products-list.page').then((m) => m.AdminProductsListPage),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/admin/pages/product-form.page').then((m) => m.AdminProductFormPage),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/admin/pages/product-form.page').then((m) => m.AdminProductFormPage),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/pages/orders-list.page').then((m) => m.AdminOrdersListPage),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/admin/pages/order-detail.page').then((m) => m.AdminOrderDetailPage),
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/admin/pages/coupons-list.page').then((m) => m.AdminCouponsListPage),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
