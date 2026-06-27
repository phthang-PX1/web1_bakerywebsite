# Backend API Contract — WeBee Bakery

> Audit Date: 2026-06-27  
> Source of Truth: Verified directly against `backend/src/modules/*/routes.ts`  
> Rules: Confirmed endpoints are separated from proposed/TODO endpoints.

---

## Part 1: CONFIRMED Endpoints (Present in Backend Source Code)

### Auth Module (`/auth`)
- `POST /auth/register` — Register a new account (returns token or activation instruction)
- `POST /auth/activate/:token` — Activate account via token
- `POST /auth/login` — Login with email/phone and password
- `POST /auth/google/redirect` — Get Google OAuth redirect URL
- `GET /auth/google/callback` — Google OAuth callback handling
- `POST /auth/refresh` — Refresh JWT access token
- `POST /auth/forgot-password` — Send reset password email
- `POST /auth/reset-password/:token` — Reset password with token
- `POST /auth/logout` — Logout and invalidate tokens

### Users Module (`/users`)
- `GET /users/me` — Get current authenticated user profile (replaces documented `/auth/me`)
- `PUT /users/me` — Update profile info (fullName, phone)
- `POST /users/me/avatar` — Upload user avatar image (multipart)
- `PUT /users/me/password` — Change password
- `GET /users/me/addresses` — List saved delivery addresses
- `POST /users/me/addresses` — Create a new address
- `PUT /users/me/addresses/:id` — Update an address
- `DELETE /users/me/addresses/:id` — Delete an address
- `GET /users/me/loyalty` — Get loyalty points balance and tier info
- `GET /users/me/loyalty/logs` — Get paginated loyalty points history

### Categories Module (`/categories`)
- `GET /categories` — List active categories (public)
- `POST /categories` — Create category (Admin)
- `PUT /categories/:id` — Update category (Admin)
- `DELETE /categories/:id` — Delete category (Admin)
- `PATCH /categories/:id/status` — Toggle status (Admin)

### Products Module (`/products`)
- `GET /products` — List products with filters (`category`, `min_price`, `max_price`, `search`, `sort`, `page`, `limit`)
- `GET /products/:slug` — Get product detail by slug (includes images, options, avgRating)
- `GET /products/:id/options` — Get option groups and items for a product
- `GET /products/:id/reviews` — Get paginated reviews for a product
- `POST /products` — Create product (Admin)
- `PUT /products/:id` — Update product (Admin)
- `DELETE /products/:id` — Delete product (Admin)
- `POST /products/:id/images` — Upload product image (Admin)
- `DELETE /products/:id/images/:imageId` — Delete product image (Admin)

### Cart Module (`/cart`)
- `GET /cart` — Get current cart (Session cookie for guest, JWT for member)
- `POST /cart/items` — Add product to cart (`{ productId, quantity, optionItemIds }`)
- `PUT /cart/items/:cartItemId` — Update item quantity (`{ quantity }`)
- `DELETE /cart/items/:cartItemId` — Remove item from cart
- `DELETE /cart` — Clear entire cart
- `POST /cart/merge` — Merge guest session cart into member cart upon login

### Coupons Module (`/coupons`)
- `POST /coupons/validate` — Validate coupon code against cart/order value (`{ code, order_value }`)
- `GET /coupons` — List coupons (Admin)
- `POST /coupons` — Create coupon (Admin)
- `PUT /coupons/:id` — Update coupon (Admin)
- `DELETE /coupons/:id` — Delete coupon (Admin)

### Orders Module (`/orders`)
- `POST /orders` — Create a new order (`{ recipient_name, phone, fulfillment_type, delivery_address, delivery_date, delivery_time_slot, payment_method: 'transfer' | 'cod', coupon_code?, note? }`) — *Lưu ý: COD cần Backend bổ sung vào schema*
- `GET /orders/me` — List current user's order history
- `GET /orders/me/:id` — Get specific order details (includes QR tracking info)
- `PATCH /orders/me/:id/cancel` — Cancel pending order
- `POST /orders/payment-webhook` — Payment gateway webhook callback
- `GET /orders` — List all orders (Admin)
- `GET /orders/:id` — Get order details (Admin)
- `PATCH /orders/:id/status` — Update order status (Admin)

### Reviews Module (`/reviews`)
- `POST /reviews` — Submit a product review for a delivered order item (`{ order_item_id, rating, comment }`)
- `GET /reviews` — List reviews (Admin)
- `PATCH /reviews/:id/status` — Approve/hide review (Admin)

### Analytics Module (`/analytics`)
- `POST /analytics/events/batch` — Record frontend telemetry/pageviews
- `GET /analytics/overview` — Get business metrics (Admin)
- `GET /analytics/behavior` — Get user behavior logs (Admin)

---

## Part 2: PROPOSED & TODO_BACKEND Endpoints (Missing from Source Code)

### DO NOT USE IN MVP FRONTEND UNTIL IMPLEMENTED IN BACKEND

- `TODO_BACKEND` `POST /orders` với `payment_method: 'cod'` — Bổ sung hỗ trợ thanh toán khi nhận hàng (COD) vào Zod schema (`z.enum(["transfer", "cod"])`).
- `TODO_BACKEND` `GET /products?sort=sold_desc` — Sort products by sales volume (currently missing `soldCount` field).
- `TODO_BACKEND` `GET /users/me/vouchers` — List personalized coupons available for current member.
- `TODO_BACKEND` `POST /shipping/estimate` — Dynamic shipping fee calculation (currently hardcoded to `0`).
- `TODO_BACKEND` `GET /blog/posts` & `GET /blog/posts/:slug` — Blog CMS endpoints (entire blog module missing).
- `TODO_BACKEND` `GET /locations/provinces` — Vietnam administrative address hierarchy APIs (frontend uses static JSON instead).
- `TODO_BACKEND` `GET /admin/customers` — Documented in old docs but missing from current route files.

---

## Part 3: Known Conflicts Between Frontend Needs & Confirmed API

| Frontend Expectation | Confirmed Backend Contract | Conflict Resolution |
|---|---|---|
| `GET /auth/me` | `GET /users/me` | Call `/users/me` |
| `payment_method: 'cod'` | `payment_method: 'transfer'` (bank transfer only) | **Giữ UI chọn COD**, yêu cầu Backend bổ sung schema (`TODO_BACKEND`) |
| `X-Session-Id` header for cart | HTTP-only cookie `session_id` | Enable `withCredentials: true`, remove header |
| 3 address fields (province/district/ward) | 1 string `delivery_address` | Concatenate string on frontend before `POST /orders` |
| Optional delivery date/time | `delivery_date` & `delivery_time_slot` required | Validate as required in form |
