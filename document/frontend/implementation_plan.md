# Frontend Implementation Plan — WeBee Bakery (Revised)

> Date: 2026-06-27  
> Revised from: original implementation_plan.md  
> Changes: route naming unified to /account/*, phases expanded with detail

---

## Current frontend state (verified)

- **Framework:** Angular 22 (standalone components)
- **Routing:** `app.routes.ts` — currently has only one route (`/` → `HomePage`)
- **Existing files (already implemented):**
  - `core/api/products.api.ts`, `categories.api.ts`, `cart.api.ts`
  - `core/models/product.model.ts`, `cart.model.ts`
  - `core/services/cart.service.ts`, `session.service.ts`
  - `features/home/home.page.ts` (partially implemented)
  - `app.config.ts`, `app.routes.ts`
- **⚠️ Critical known issue:** `cart.api.ts` sends wrong `X-Session-Id` header — must be removed and `withCredentials: true` enabled instead

---

## Recommended folder structure (target state)

```
src/app/
  core/
    api/
      auth.api.ts
      users.api.ts
      categories.api.ts          ✅ exists
      products.api.ts            ✅ exists
      options.api.ts
      cart.api.ts                ✅ exists (⚠️ needs fix: remove X-Session-Id)
      coupons.api.ts
      orders.api.ts
      reviews.api.ts
      analytics.api.ts
    models/
      user.model.ts
      product.model.ts           ✅ exists
      cart.model.ts              ✅ exists
      order.model.ts
      coupon.model.ts
      review.model.ts
      loyalty.model.ts
      analytics.model.ts
      pagination.model.ts
    interceptors/
      auth.interceptor.ts
    guards/
      auth.guard.ts
      admin.guard.ts
    services/
      auth.service.ts
      cart.service.ts            ✅ exists
      session.service.ts         ✅ exists
      toast.service.ts
      analytics.service.ts
    constants/
      app.constants.ts

  shared/
    components/
      navbar/
      footer/
      product-card/              # variants: default, compact, recommendation
      quantity-stepper/
      cart-drawer/
      loading-spinner/
      toast/
      confirm-dialog/
      pagination/
      tier-badge/
      star-rating/
    pipes/
      currency-vnd.pipe.ts
    directives/
      img-fallback.directive.ts
    config/
      policies.config.ts         # shared policy links for header + footer
      vietnam-addresses.json     # static address data for checkout

  layouts/
    main-layout/                 # Public + member pages: navbar + footer
    admin-layout/                # Admin: sidebar + topbar
    auth-layout/                 # Login/register: minimal header, no footer
    custom-cake-layout/          # Configurator: simplified header, NO footer

  features/
    home/
      home.page.ts               ✅ exists (partial)
      home.routes.ts
      components/
        hero-banner/
        category-shortcuts/
        product-section/         # for "Mới" and "Bán chạy" sections
        membership-section/
      config/
        home-static-content.ts
    auth/
      pages/
        login.page.ts
        register.page.ts
        activate.page.ts
        forgot-password.page.ts
        reset-password.page.ts
        google-callback.page.ts
      auth.routes.ts
    products/
      pages/
        product-list.page.ts
        product-detail.page.ts   # includes customize builder for customizable products
      components/
        product-filter/
        customize-builder/       # option group selection, price calculator
      products.routes.ts
    cart/
      pages/
        cart.page.ts
      cart.routes.ts
    checkout/
      pages/
        checkout.page.ts
        order-tracking.page.ts
      checkout.routes.ts
    account/                     # Previously named 'profile' — now /account/*
      pages/
        account.page.ts
        profile.page.ts
        addresses.page.ts
        order-history.page.ts
        order-detail.page.ts
        loyalty.page.ts
      account.routes.ts
    blog/
      pages/
        blog-list.page.ts        # MVP: static data
        blog-detail.page.ts      # MVP: static data
      blog.routes.ts
    policies/
      pages/
        policy.page.ts           # renders by slug from static config
      policies.routes.ts
    membership/
      pages/
        membership.page.ts       # static content page
      membership.routes.ts
    custom-cake/
      pages/
        custom-cake.page.ts      # split layout configurator
      custom-cake.routes.ts
    admin/
      pages/
        dashboard.page.ts
        products-list.page.ts
        product-form.page.ts
        orders-list.page.ts
        order-detail.page.ts
        coupons-list.page.ts
      admin.routes.ts

  app.routes.ts
  app.config.ts
  app.ts
```

---

## Phase 0 — Documentation and Alignment

> **Goal:** Finalize all planning docs before any implementation begins.

- [x] Build `SCREEN_FLOW_INVENTORY.md`
- [x] Build `ux_conflict_audit.md`
- [x] Build `ui_improvement_plan.md`
- [x] Build `layout_contract.md`
- [x] Build `feature_mapping.md`
- [x] Build `backend/gap_analysis.md`
- [ ] Update `checkout.md` to fix conflicts (remove COD, add required fields)
- [ ] Update `orders.md` to unify routes
- [ ] Create `custom_cake.md`
- [ ] Delete `HOME_PAGE_DESCRIPTION.md` (superseded by home.md)

**Dependencies:** None  
**Backend requirements:** None  
**Risks:** None  
**Acceptance criteria:** All critical conflicts in ux_conflict_audit.md resolved in documentation

---

## Phase 1 — Frontend Foundation

> **Goal:** Create all shared infrastructure before building any feature.

Files to create/fix:

1. **Fix `cart.api.ts`** — Remove `X-Session-Id` header, enable `withCredentials: true`
2. **Create `auth.api.ts`** — POST register, activate, login, google/redirect, refresh, forgot-password, reset-password/:token, logout
3. **Create `users.api.ts`** — GET/PUT /users/me, avatar, password, addresses CRUD, loyalty
4. **Create `options.api.ts`** — GET /products/:id/options
5. **Create `coupons.api.ts`** — POST /coupons/validate
6. **Create `orders.api.ts`** — POST /orders, GET /orders/me, GET /orders/me/:id, PATCH /orders/me/:id/cancel
7. **Create `reviews.api.ts`** — POST /reviews
8. **Create `analytics.api.ts`** — POST /analytics/events/batch
9. **Create remaining models** — user.model.ts, order.model.ts, coupon.model.ts, review.model.ts, loyalty.model.ts, analytics.model.ts, pagination.model.ts
10. **Create `auth.interceptor.ts`** — Attach Bearer token, auto-refresh on 401
11. **Create `auth.guard.ts`** — Redirect to /login if not authenticated
12. **Create `admin.guard.ts`** — Redirect to / if not admin role
13. **Create `auth.service.ts`** — Token storage (localStorage), user BehaviorSubject
14. **Create `toast.service.ts`** — Success/error/info notifications
15. **Create `analytics.service.ts`** — Event batching + sendBeacon on page unload
16. **Create `policies.config.ts`** — Shared policy routes config
17. **Create `vietnam-addresses.json`** — Static address data for checkout

**Dependencies:** None  
**Backend requirements:** None  
**Acceptance criteria:** App builds, auth flow compiles, cart API uses cookie correctly

---

## Phase 2 — Shared Components + Layouts

> **Goal:** Build all reusable components that are shared across features.

Files to create:

1. `shared/components/navbar/` — full header with auth state, cart badge, dropdowns
2. `shared/components/footer/` — with static policies config
3. `shared/components/product-card/` — 3 variants (default, compact, recommendation)
4. `shared/components/quantity-stepper/`
5. `shared/components/cart-drawer/` — slide-in overlay with CartService
6. `shared/components/loading-spinner/` — full-page and inline variants
7. `shared/components/toast/` — with ToastService
8. `shared/components/confirm-dialog/` — before delete/cancel
9. `shared/components/pagination/`
10. `shared/components/tier-badge/`
11. `shared/components/star-rating/`
12. `shared/pipes/currency-vnd.pipe.ts`
13. `shared/directives/img-fallback.directive.ts`
14. `layouts/main-layout/`
15. `layouts/auth-layout/`
16. `layouts/admin-layout/`
17. `layouts/custom-cake-layout/` (simplified header, no footer)

**Dependencies:** Phase 1 (needs CartService, AuthService, ToastService)  
**Backend requirements:** None  
**Risks:** ProductCard must be finalized before Product List or Home reuses it  
**Acceptance criteria:** Header shows correct auth state and cart badge; CartDrawer opens/closes correctly

---

## Phase 3 — Auth Feature

> **Goal:** All authentication pages working.

Pages:
- `/login` — email/phone + password, link to register + forgot
- `/register` — fullName, email, password
- `/auth/activate?token=` — auto-submit on load
- `/auth/forgot-password`
- `/auth/reset-password?token=`
- `/auth/google/callback` — extract tokens from query params, redirect

**Dependencies:** Phase 1 (AuthApi, AuthService), Phase 2 (AuthLayout)  
**Backend requirements:** All auth endpoints CONFIRMED  
**Risks:** Google OAuth callback token extraction must match backend redirect format  
**Acceptance criteria:** Full register → activate → login → logout flow works end-to-end

---

## Phase 4 — Public Product Browsing

> **Goal:** Home, Product List, Product Detail with customize builder.

Pages:
- `/` (Home) — hero, category shortcuts, new products, best sellers, membership CTA, map, footer
- `/products` — filter sidebar, search, sort, grid, pagination
- `/products/:slug` — gallery, tabs, customize builder (if `isCustomizable`), add to cart → opens Cart Drawer

**Dependencies:** Phase 1, Phase 2 (ProductCard, CartDrawer, Navbar)  
**Backend requirements:** `GET /categories`, `GET /products`, `GET /products/:slug`, `GET /products/:id/options`, `POST /cart/items`  
**Risks:** "Bán chạy nhất" uses rating_desc fallback (soldCount missing)  
**Acceptance criteria:** User can browse, filter, search products; add non-customizable to cart from list; configure + add customizable from detail

---

## Phase 5 — Cart and Checkout

> **Goal:** Complete cart management and checkout flow.

Pages:
- `/cart` — full cart, coupon code, order note, checkout CTA, "Chỉnh sửa giỏ hàng" from checkout
- `/checkout` — delivery form, fulfillment type, required date+time_slot, bank transfer only, voucher, "Chỉnh sửa giỏ hàng" link
- `/orders/:orderId/track` — QR code display, transfer info, 3s polling, cancel if pending, redirect on paid

**Dependencies:** Phase 1, Phase 2, Phase 4 (CartDrawer already done)  
**Backend requirements:** `GET /cart`, `POST /coupons/validate`, `POST /orders`, `GET /orders/me/:id`, `PATCH /orders/me/:id/cancel`  
**Risks:** 
- `withCredentials` must be enabled for cart cookie
- `delivery_date` + `delivery_time_slot` both required
- Cart merge must be called after login  
**Acceptance criteria:** Guest can complete order → see QR → payment confirmed → redirect to account orders

---

## Phase 6 — Member Account

> **Goal:** Full account management for logged-in users.

Pages:
- `/account` — overview: avatar, tier badge, loyalty points, recent orders
- `/account/profile` — edit name/phone, avatar upload, change password (inline)
- `/account/addresses` — CRUD, is_default management
- `/account/orders` — paginated order history with status badges
- `/account/orders/:orderId` — order detail, status timeline, review form (if delivered)
- `/account/loyalty` — points balance, tier progress bar, points log

**Dependencies:** Phase 1, Phase 2  
**Backend requirements:** All `/users/me/*` and `/orders/me/*` endpoints (CONFIRMED)  
**Risks:** Review form must check `orderStatus === 'delivered'` before showing  
**Acceptance criteria:** Logged-in user can view and update profile, addresses; see full order history; write review on delivered orders

---

## Phase 7 — Content Pages

> **Goal:** Blog, Policies, Membership (static content MVP).

Pages:
- `/blog` — static blog list from `blog.config.ts`
- `/blog/:slug` — static blog detail
- `/policies/:slug` — render from `policies.config.ts`
- `/membership` — static tier benefits page

**Dependencies:** Phase 2 (Navbar, Footer)  
**Backend requirements:** None — all static for MVP  
**Risks:** If blog is later made dynamic, component structure must support API swap  
**Acceptance criteria:** All policy routes resolve, policy dropdown in header links correctly

---

## Phase 8 — Custom Cake Configurator

> **Goal:** Standalone configurator with split-screen layout.

Page:
- `/custom-cake` — split layout (preview image left, options panel right), real-time price update, add to cart → opens CartDrawer

**Dependencies:** Phase 1, Phase 2 (CartDrawer), Phase 4 (OptionsApi)  
**Backend requirements:** `GET /products/:id/options`, `POST /cart/items` for customizable product  
**Risks:** Preview image update logic unclear (no dedicated preview API) — ASSUMPTION: use option_item imageUrl if available  
**Acceptance criteria:** User can select all required option groups, see real-time price, add to cart

---

## Phase 9 — Admin Panel

> **Goal:** Admin dashboard and content management.

Pages:
- `/admin` — analytics overview (GET /admin/analytics/overview)
- `/admin/products` — list + toggle status
- `/admin/products/new`, `/admin/products/:id/edit` — product form with image upload
- `/admin/orders` — list with filter + update status
- `/admin/orders/:id` — full order detail
- `/admin/coupons` — list + create/edit + toggle

**Dependencies:** Phase 1 (admin.guard.ts), Phase 2 (admin-layout)  
**Backend requirements:** All `/admin/*` endpoints (CONFIRMED)  
**Risks:** Admin customer list (`GET /admin/customers`) — UNCLEAR, verify via Swagger before implementing  
**Acceptance criteria:** Admin can manage products, orders, coupons from dashboard

---

## Phase 10 — QA and Integration Review

> **Goal:** End-to-end verification.

- API integration testing for all critical paths
- Responsive layout review (mobile + desktop)
- UX consistency review vs `ui_ux_rules.md`
- Fix all `ASSUMPTION` comments resolved or escalated
- Fix all `TODO_BACKEND` items tracked
- TypeScript strict mode — zero errors
- Build production bundle — zero errors
- `withCredentials` verified on cart requests
- Auth interceptor refresh flow tested
