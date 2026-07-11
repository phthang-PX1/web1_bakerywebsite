import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
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
        loadComponent: () =>
          import('./features/checkout/pages/checkout-success.page').then((m) => m.CheckoutSuccessPage),
      },
      {
        path: 'orders/:orderId/track',
        loadComponent: () =>
          import('./features/checkout/pages/order-tracking.page').then((m) => m.OrderTrackingPage),
      },
      {
        path: 'account/confirm-email',
        loadComponent: () => import('./features/account/pages/confirm-email.page').then((m) => m.ConfirmEmailPage),
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
      {
        path: 'rewards',
        canActivate: [authGuard],
        loadComponent: () => import('./features/rewards/pages/rewards.page').then((m) => m.RewardsPage),
      },
    ],
  },

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
        path: 'verify-otp',
        loadComponent: () => import('./features/auth/pages/verify-otp.page').then((m) => m.VerifyOtpPage),
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

  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/pages/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        // Alias /admin/dashboard → same component
        path: 'dashboard',
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
        path: 'products/:id',
        loadComponent: () => import('./features/admin/pages/product-detail.page').then((m) => m.AdminProductDetailPage),
      },
      {

        path: 'products/:id/edit',
        loadComponent: () => import('./features/admin/pages/product-form.page').then((m) => m.AdminProductFormPage),
      },
      {
        path: 'custom-cake',
        loadComponent: () => import('./features/admin/pages/custom-cake-list.page').then((m) => m.AdminCustomCakeListPage),
      },
      {
        path: 'custom-cake/:id',
        loadComponent: () => import('./features/admin/pages/custom-cake-detail.page').then((m) => m.AdminCustomCakeDetailPage),
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
        path: 'cancel-reasons',
        loadComponent: () => import('./features/admin/pages/orders-list.page').then((m) => m.AdminOrdersListPage),
      },
      {
        // /admin/vouchers → alias of coupons-list
        path: 'vouchers',
        loadComponent: () => import('./features/admin/pages/coupons-list.page').then((m) => m.AdminCouponsListPage),
      },
      {
        // /admin/vouchers/:id → alias of coupon-detail
        path: 'vouchers/:id',
        loadComponent: () => import('./features/admin/pages/coupon-detail.page').then((m) => m.AdminCouponDetailPage),
      },
      {

        path: 'coupons',
        loadComponent: () => import('./features/admin/pages/coupons-list.page').then((m) => m.AdminCouponsListPage),
      },
      {
        path: 'coupons/:id',
        loadComponent: () => import('./features/admin/pages/coupon-detail.page').then((m) => m.AdminCouponDetailPage),
      },
      {
        path: 'banners',
        loadComponent: () => import('./features/admin/pages/banners-list.page').then((m) => m.AdminBannersListPage),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/pages/categories.page').then((m) => m.AdminCategoriesPage),
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/admin/pages/customers.page').then((m) => m.AdminCustomersPage),
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/admin/pages/customer-detail.page').then((m) => m.AdminCustomerDetailPage),
      },
      {
        // /admin/blog → main blog management page (tabs: posts / subscribers)
        path: 'blog',
        loadComponent: () => import('./features/admin/pages/blog.page').then((m) => m.AdminBlogPage),
      },
      {
        // /admin/blog/posts → alias
        path: 'blog/posts',
        loadComponent: () => import('./features/admin/pages/blog.page').then((m) => m.AdminBlogPage),
      },
      {
        // /admin/blog/posts/new → alias
        path: 'blog/posts/new',
        loadComponent: () => import('./features/admin/pages/blog.page').then((m) => m.AdminBlogPage),
      },
      {
        // /admin/blog/posts/:id/edit → alias
        path: 'blog/posts/:id/edit',
        loadComponent: () => import('./features/admin/pages/blog.page').then((m) => m.AdminBlogPage),
      },
      {
        // /admin/blog/subscribers → alias
        path: 'blog/subscribers',
        loadComponent: () => import('./features/admin/pages/blog.page').then((m) => m.AdminBlogPage),
      },
      {
        path: 'loyalty',
        loadComponent: () => import('./features/admin/pages/loyalty.page').then((m) => m.AdminLoyaltyPage),
      },
      {
        // /admin/member-points → alias of loyalty
        path: 'member-points',
        loadComponent: () => import('./features/admin/pages/loyalty.page').then((m) => m.AdminLoyaltyPage),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/pages/reports.page').then((m) => m.AdminReportsPage),
      },

    ],
  },

  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
