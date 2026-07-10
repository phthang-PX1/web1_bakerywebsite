# Frontend Architecture

> Specific to: WeBee Angular 22 frontend  
> Date: 2026-06-27

---

## Angular version & style

- **Angular:** 22.x
- **Component style:** Standalone components (`standalone: true`) â€” this is the project standard since `app.ts` already uses standalone. All new components MUST be standalone.
- **Forms:** Reactive Forms (`ReactiveFormsModule`) for all create/edit forms. Template-driven forms only for trivial search bars.
- **HTTP:** `HttpClient` via Angular's `provideHttpClient()` â€” already configured in `app.config.ts`.
- **Routing:** `provideRouter()` â€” already configured. All routes use lazy loading.

---

## Recommended Angular folder structure

```
src/app/
  core/
    api/             # One service per backend module â€” all HTTP calls here
    models/          # TypeScript interfaces only â€” no logic
    interceptors/    # Auth interceptor
    guards/          # Route protection
    services/        # Stateful singleton services (auth, cart, session, toast, analytics)
    constants/       # App-wide constants

  shared/
    components/      # Reusable, presentational, no business logic
    pipes/           # CurrencyVndPipe, etc.
    directives/      # ImgFallbackDirective, etc.

  layouts/
    main-layout/     # Public + member pages: navbar + footer + <router-outlet>
    admin-layout/    # Admin pages: sidebar + topbar + <router-outlet>

  features/
    home/
    auth/
    products/
    cart/
    checkout/
    profile/
    admin/

  app.routes.ts      # Top-level routes â€” lazy loads features
  app.config.ts      # App providers
  app.ts             # Root component
```

---

## Folder rules

### `core/api/`
- One file per backend module: `auth.api.ts`, `products.api.ts`, etc.
- Each file exports a single `@Injectable({ providedIn: 'root' })` service class.
- Class name convention: `AuthApi`, `ProductsApi`, `OrdersApi`.
- All methods return `Observable<T>`.
- Methods call `HttpClient` via `environment.apiUrl` as base.
- **No components may inject `HttpClient` directly** â€” always go through `core/api/`.

```typescript
// CORRECT
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  getProducts(params: ProductListParams): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(this.base, { params: { ...params } });
  }
}
```

### `core/models/`
- TypeScript interfaces only. No classes, no decorators.
- Named: `{entity}.model.ts` (e.g., `product.model.ts`).
- See `document/erd.md` for all recommended interfaces.

### `core/services/`
- `auth.service.ts` â€” Stores `accessToken` and `refreshToken` in `localStorage`. Exposes `currentUser$: BehaviorSubject<User | null>`. Provides `login()`, `logout()`, `isLoggedIn()`, `isAdmin()` methods.
- `cart.service.ts` â€” Exposes `cart$: BehaviorSubject<CartResponse>`. Provides `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `mergeCart()`. Syncs with `CartApi`.
- `session.service.ts` â€” Generates and persists a UUID session ID in `localStorage` under key `webee_session_id`. Used for guest cart identity.
- `toast.service.ts` â€” Queue-based notification system. Max 3 concurrent toasts.
- `analytics.service.ts` â€” Buffers events, flushes every 10s or on 20 events. Uses `navigator.sendBeacon()` on page unload.

### `core/interceptors/`
- `auth.interceptor.ts` â€” Reads `accessToken` from `auth.service.ts`. Adds `Authorization: Bearer <token>` to every request except auth endpoints. On 401 response: attempts silent token refresh via `POST /auth/refresh`, retries original request once, then logs out on second 401.

### `core/guards/`
- `auth.guard.ts` â€” `canActivate`: checks `auth.service.isLoggedIn()`. Redirects to `/auth/login` if false.
- `admin.guard.ts` â€” `canActivate`: checks `auth.service.isAdmin()`. Redirects to `/` if false.

### `shared/components/`
Components must be purely presentational â€” they receive data via `@Input()` and emit events via `@Output()`. They must not inject API services.

### `layouts/`
- `MainLayoutComponent` â€” wraps public and member pages. Contains `NavbarComponent` and `FooterComponent`. Uses `<router-outlet>`.
- `AdminLayoutComponent` â€” wraps admin pages. Contains sidebar navigation and topbar. Uses `<router-outlet>`.

### `features/`
Each feature folder follows this structure:
```
features/{feature}/
  pages/              # Smart components â€” inject services, handle state
    {name}.page.ts    # Single-file standalone component
  components/         # Feature-specific, dumb components
  {feature}.routes.ts # Feature route definitions
```

Page naming convention: `ProductListPage`, `LoginPage`, `CheckoutPage`, etc.

---

## Routing architecture

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/home/home.routes') },
      { path: 'products', loadChildren: () => import('./features/products/products.routes') },
      { path: 'cart', loadChildren: () => import('./features/cart/cart.routes') },
      { path: 'checkout', loadChildren: () => import('./features/checkout/checkout.routes') },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadChildren: () => import('./features/profile/profile.routes')
      },
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,  // ASSUMPTION: auth layout or main layout without navbar
    loadChildren: () => import('./features/auth/auth.routes')
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes')
  },
  { path: '**', redirectTo: '' }
];
```

---

## State management rule

**Use Angular signals and BehaviorSubject only.** No NgRx, no Akita, no other state libraries.

| State | Where |
|---|---|
| Logged-in user + tokens | `auth.service.ts` â†’ `localStorage` |
| Cart contents | `cart.service.ts` â†’ `BehaviorSubject` (source of truth: API) |
| Guest session ID | `session.service.ts` â†’ `localStorage` |
| Page-local loading/error | Component-level signals or properties |
| Toast notifications | `toast.service.ts` â†’ signal array |

---

## API base URL rule

**Always use `environment.apiUrl`.** Never hardcode `http://localhost:3000`.

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## HTTP error handling rule

All API calls must handle errors gracefully:

```typescript
this.productsApi.getProducts(params).pipe(
  catchError(err => {
    this.toastService.error('KhÃ´ng thá»ƒ táº£i sáº£n pháº©m. Vui lÃ²ng thá»­ láº¡i.');
    return EMPTY;
  })
).subscribe(data => { this.products = data.data; });
```

Never show raw backend error messages directly in the UI.

---

## Google OAuth callback handling

Frontend must handle the redirect from `GET /auth/google/callback`:
- URL pattern: `/auth/google/callback?accessToken=...&refreshToken=...`
- Failure pattern: `/auth/google/callback?error=google_auth_failed`
- The `GoogleCallbackPage` component reads query params, stores tokens, navigates to `/`.

---

## Session ID for guest cart

```typescript
// session.service.ts
getSessionId(): string {
  let id = localStorage.getItem('webee_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('webee_session_id', id);
  }
  return id;
}
```

The `cart.api.ts` must include `X-Session-Id` header for all cart operations when the user is not logged in. ASSUMPTION: backend reads this header (not yet confirmed in code â€” verify with backend dev or Swagger).
