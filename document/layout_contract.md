# Navigation and Layout Contract — WeBee Bakery

> Date: 2026-06-27  
> Status: CONFIRMED contract derived from all page functional description documents + backend source.  
> This document is the single source of truth for navigation structure and layout decisions.

---

## Global Header

### Guest state (not logged in)

- Show `Đăng nhập` button (links to `/login`)
- Show cart icon with badge (live count from `CartService`)
- Show search icon (opens search modal or navigates to `/products?search=`)
- Show logo (links to `/`)
- Show main navigation menu

### Logged-in state

- Hide `Đăng nhập` button
- Show account icon (links to `/account` or opens dropdown)
- Account dropdown contains:
  - Tài khoản của tôi → `/account`
  - Đơn hàng của tôi → `/account/orders`
  - Voucher của tôi → (linked to `/account` loyalty section, `TODO_DESIGN` for separate page)
  - Đăng xuất → calls `POST /auth/logout`, clears tokens, redirects to `/`
- Show cart icon with badge (same as guest)
- Show search icon (same as guest)

### Header menu items

| Item | Route | Dropdown | Active condition |
|---|---|---|---|
| Trang chủ | `/` | No | Exact `/` |
| Sản phẩm | `/products` | Category dropdown (from `GET /categories`) | `/products/*` |
| Tùy chỉnh bánh | `/custom-cake` | No | `/custom-cake` |
| Blog | `/blog` | No | `/blog/*` |
| Chính sách | `/policies/customer-support` | Policy dropdown (6 items, static config) | `/policies/*` |
| Thành viên | `/membership` | No | `/membership` |

### Chính sách dropdown (shared config — same in header AND footer)

Defined in: `src/app/shared/config/policies.config.ts` (to be created)

| Label | Route |
|---|---|
| Chính sách Hỗ trợ Khách hàng | `/policies/customer-support` |
| Chính sách Khách hàng thân thiết | `/policies/loyalty` |
| Chính sách Bảo mật | `/policies/privacy` |
| Hướng dẫn về Sản phẩm | `/policies/product-guide` |
| Hướng dẫn Đặt hàng & Thanh toán | `/policies/order-payment-guide` |
| Hướng dẫn Giao hàng | `/policies/shipping-guide` |

### Sản phẩm dropdown (dynamic from backend)

- Fetches `GET /categories` on app init (or cached in CategoryService)
- Shows active categories only (`isActive === true`)
- Each item links to `/products?category={slug}`
- Fallback if no categories: link directly to `/products`

---

## Global Footer

### Visibility

| Page | Footer shown? |
|---|---|
| Home `/` | ✅ Yes |
| Product List `/products` | ✅ Yes |
| Product Detail `/products/:slug` | ✅ Yes |
| Cart `/cart` | ✅ Yes |
| Checkout `/checkout` | ✅ Yes |
| Order Tracking `/orders/:orderId/track` | ✅ Yes |
| Order Success | ✅ Yes |
| Account `/account/*` | ✅ Yes |
| Blog `/blog/*` | ✅ Yes |
| Policies `/policies/*` | ✅ Yes |
| Membership `/membership` | ✅ Yes |
| **Custom Cake `/custom-cake`** | ❌ **No — focused configurator flow** |
| Login, Register, Auth pages | ✅ Minimal footer (optional — show only if design requires) |

### Footer content

- Logo + tagline
- Column 1: Chính sách links (same 6 items from header dropdown)
- Column 2: Company info (address, phone, email — static)
- Column 3: Social media links
- Newsletter signup field (static UI — `TODO_BACKEND` for email capture)
- Store map (embedded iframe — static)
- Copyright text

---

## Cart Behavior Contract

| Trigger | Behavior |
|---|---|
| Click cart icon in header | Open Cart Drawer (overlay, no route change) |
| Add product to cart (Product List quick-add) | API call → update `CartService` → optionally open Cart Drawer or show toast |
| Add product to cart (Product Detail) | API call → update `CartService` → open Cart Drawer |
| Click "Xem giỏ hàng" in Cart Drawer | Navigate to `/cart` |
| Click "Tiến hành đặt hàng" in Cart Drawer | Navigate to `/checkout` |
| Click "Tiến hành đặt hàng" in Cart Page | Navigate to `/checkout` |
| Click "Chỉnh sửa giỏ hàng" in Checkout | Navigate to `/cart` |
| After order placed (bank transfer) | Navigate to `/orders/:orderId/track` |
| Payment confirmed (polling success) | Navigate to `/account/orders/:orderId` |

### Cart Drawer vs Cart Page

| Feature | Cart Drawer | Cart Page |
|---|---|---|
| Route change | No | Yes (`/cart`) |
| View all items | Yes | Yes (more space) |
| Quantity stepper | Yes | Yes |
| Delete item | Yes | Yes |
| Coupon code | No (in Cart Drawer) | Yes |
| Product recommendation section | Yes (MVP: static or TODO_BACKEND) | No |
| Order note field | No (in Cart Drawer for MVP) | Yes |
| "Tiến hành đặt hàng" CTA | Yes | Yes |
| Data source | `CartService.cart$` | `CartService.cart$` |

---

## Account Route Contract

All account routes use the `/account/*` prefix.

| Screen | Route | Auth required |
|---|---|---|
| Account overview | `/account` | ✅ Yes |
| Profile edit | `/account/profile` | ✅ Yes |
| Change password | `/account/profile` (inline section or modal) | ✅ Yes |
| Addresses | `/account/addresses` | ✅ Yes |
| Order history | `/account/orders` | ✅ Yes |
| Order detail | `/account/orders/:orderId` | ✅ Yes |
| Loyalty & points | `/account/loyalty` | ✅ Yes |

If unauthenticated user accesses any `/account/*` route:
- Redirect to `/login?redirect=/account`
- After login, redirect back to the original intended route

---

## Auth Route Contract

| Screen | Route |
|---|---|
| Login | `/login` |
| Register | `/register` |
| Activate account | `/auth/activate?token=...` |
| Forgot password | `/auth/forgot-password` |
| Reset password | `/auth/reset-password?token=...` |
| Google OAuth callback | `/auth/google/callback` |

---

## Order Post-Checkout Route Contract

```
POST /orders
→ Success (all orders use bank transfer)
→ Navigate to /orders/:orderId/track

/orders/:orderId/track
→ Display QR code + transfer info
→ Poll GET /orders/me/:orderId every 3 seconds
→ On paymentStatus === 'paid': navigate to /account/orders/:orderId
→ Allow cancel if orderStatus === 'pending' (PATCH /orders/me/:orderId/cancel)
```

---

## Search Behavior Contract

- Search icon in header: opens search modal overlay OR appends `?search=` to `/products`
- Search query calls: `GET /products?search={query}&limit=20`
- No dedicated `/search` route needed
- If on Product List page: update URL params and reload filter results
- If on any other page: navigate to `/products?search={query}`

---

## Layout Assignments

| Layout | Wraps | Has header? | Has footer? |
|---|---|---|---|
| `MainLayoutComponent` | Public pages, account pages | ✅ Full header | ✅ Standard footer |
| `AdminLayoutComponent` | Admin pages `/admin/*` | ✅ Admin topbar | ❌ No customer footer |
| `CustomCakeLayoutComponent` (or no layout) | `/custom-cake` | ✅ Simplified header (logo + back) | ❌ No footer |
| `AuthLayoutComponent` | Login, Register, Reset password pages | ❌ No main nav | ❌ Minimal or no footer |
