# Frontend-Backend Function Mapping — WeBee Bakery

> Date: 2026-06-27  
> Source of truth for backend: actual backend route files + schemas  
> Labels: CONFIRMED | MISSING | TODO_BACKEND | CONFLICT | ASSUMPTION

---

## Auth / Login / Me / Logout

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Register | Form: fullName, email, password → POST | `POST /auth/register` | ✅ CONFIRMED | None | — |
| Email activation | Token from email → POST | `POST /auth/activate/:token` | ✅ CONFIRMED | None | — |
| Login | Email/phone + password → POST | `POST /auth/login` | ✅ CONFIRMED | None | — |
| Google OAuth start | Button → redirect | `POST /auth/google/redirect` | ✅ CONFIRMED | None | — |
| Google OAuth callback | Extract tokens from query params | `GET /auth/google/callback` | ✅ CONFIRMED | None | — |
| Refresh token | Auto-refresh on 401 | `POST /auth/refresh` | ✅ CONFIRMED | None | Implement in `auth.interceptor.ts` |
| Forgot password | Email input → POST | `POST /auth/forgot-password` | ✅ CONFIRMED | None | — |
| Reset password | Token + new password → POST | `POST /auth/reset-password/:token` | ✅ CONFIRMED | None | — |
| Logout | Clear tokens, invalidate refresh | `POST /auth/logout` | ✅ CONFIRMED | None | — |
| Get current user | Load profile/auth state | `GET /users/me` | ✅ CONFIRMED | **CONFLICT: docs say `GET /auth/me` — doesn't exist** | Use `GET /users/me` |

---

## Header / Shared State

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Cart badge count | Live count in header | `GET /cart` | ✅ CONFIRMED (cookie-based) | **CONFLICT: `cart.api.ts` uses wrong `X-Session-Id` header — must use cookie** | Remove X-Session-Id header. Enable `withCredentials: true` on cart requests |
| Auth state (header UI) | Guest vs logged-in display | `GET /users/me` | ✅ CONFIRMED | None | Cache in `AuthService` |
| Category dropdown | Menu `/products` dropdown | `GET /categories` | ✅ CONFIRMED | None | Cache in `CategoryService` |

---

## Product Categories

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Category list | Home shortcuts, header dropdown | `GET /categories` | ✅ CONFIRMED | None | — |
| Category detail with products | `/products?category=slug` | `GET /products?category=...` | ✅ CONFIRMED | None | — |
| Featured categories | No `isFeatured` field in backend | `GET /categories` | ⚠️ MISSING field | `categories` table has no `isFeatured` | Use display order or limit to first N active categories |

---

## Product Listing

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Product list | Grid view with pagination | `GET /products?page=&limit=&sort=&category=&search=&min_price=&max_price=` | ✅ CONFIRMED | None | Supported sort: `newest`, `price_asc`, `price_desc`, `rating_desc` |
| Filter by category | Sidebar filter | `GET /products?category=slug` | ✅ CONFIRMED | None | — |
| Filter by price | Min/max price slider | `GET /products?min_price=&max_price=` | ✅ CONFIRMED | None | — |
| Search by name | Search input | `GET /products?search=` | ✅ CONFIRMED | None | — |
| Sort options | Dropdown | `GET /products?sort=` | ✅ CONFIRMED | None | Supported values only |
| "Bán chạy nhất" sort | Sort by sales | `GET /products?sort=sold_desc` | ❌ MISSING | No `soldCount` field in products table | Use `rating_desc` as proxy. Display as "Được yêu thích" |
| Pagination | Page controls | `GET /products?page=&limit=` | ✅ CONFIRMED | None | — |
| Quick add to cart | Card "Add to cart" button | `POST /cart/items` | ✅ CONFIRMED | Only for `isCustomizable=false` products | Show "Xem chi tiết" for customizable products |

---

## Product Detail

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Product detail | Full info, gallery | `GET /products/:slug` | ✅ CONFIRMED | None | Returns `images`, `options`, `avgRating` |
| Option groups | Display option selectors | `GET /products/:id/options` | ✅ CONFIRMED | None | Returns tree of groups + items |
| Reviews | Paginated review list | `GET /products/:id/reviews` | ✅ CONFIRMED | None | — |
| Add to cart | With selected options | `POST /cart/items` | ✅ CONFIRMED | None | `{ product_id, quantity, option_item_ids }` |
| Similar products | "Sản phẩm tương tự" section | `GET /products?category=...&limit=4` | ✅ ASSUMPTION | No dedicated recommendation endpoint | Filter same category, exclude current product |
| Product breadcrumb | Category → Product name | Derived from product.categoryId | ✅ ASSUMPTION | No direct breadcrumb API | Fetch category name separately or include in product detail response |

---

## Cart Drawer

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Load cart | Show items on open | `GET /cart` | ✅ CONFIRMED | **Cookie-based, not header-based** | Fix `cart.api.ts` — remove X-Session-Id header |
| Update quantity | Stepper | `PUT /cart/items/:cartItemId` `{ quantity }` | ✅ CONFIRMED | None | — |
| Remove item | Delete icon | `DELETE /cart/items/:cartItemId` | ✅ CONFIRMED | None | — |
| Product recommendations | "Mua kèm" section | No endpoint | ❌ MISSING | No recommendation API | Giữ nguyên UI section "Mua kèm", hiển thị sản phẩm cùng danh mục hoặc chờ API (`TODO_BACKEND`) |
| Merge guest cart | After login | `POST /cart/merge` | ✅ CONFIRMED | None | Call after successful login |

---

## Cart Page

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Full cart view | All items + totals | `GET /cart` | ✅ CONFIRMED | Same cart as drawer | — |
| Coupon code | Input + validate | `POST /coupons/validate` `{ code, order_value }` | ✅ CONFIRMED | None | Validate before order creation |
| Order note | Textarea for note | Sent with `POST /orders` as `note` | ✅ CONFIRMED | None | Only order-level note, NOT item-level |
| Item-level note (lời chúc) | Per-item wishcard message | Not supported | ❌ MISSING | Backend has no cart item note field | Giữ nguyên UI trường lời chúc cho từng bánh. Yêu cầu Backend bổ sung (`TODO_BACKEND`) |
| Shipping estimate | Estimated fee display | `POST /shipping/estimate` | ❌ MISSING | Backend `DELIVERY_SHIPPING_FEE = 0` always | Giữ UI hiển thị phí vận chuyển. Yêu cầu Backend làm động phí (`TODO_BACKEND`) |
| Clear cart | Empty cart action | `DELETE /cart` | ✅ CONFIRMED | None | — |

---

## Checkout

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Load cart summary | Pre-fill order summary | `GET /cart` | ✅ CONFIRMED | None | — |
| Autofill from profile | Fill recipient info | `GET /users/me` | ✅ CONFIRMED | None | Prefill name, phone |
| Fulfillment method | delivery/pickup | `POST /orders` `fulfillment_type: 'delivery'|'pickup'` | ✅ CONFIRMED | None | — |
| Delivery address | Address input (3 dropdown) | `POST /orders` `delivery_address: string` | ✅ CONFIRMED | **CONFLICT: frontend needs 3 fields, backend takes 1 string** | Concatenate frontend fields into single string |
| Delivery date | Date picker | `POST /orders` `delivery_date: date` **REQUIRED** | ✅ CONFIRMED — REQUIRED | Not marked as required in checkout doc | Treat as required field in form |
| Time slot | Time selection | `POST /orders` `delivery_time_slot: string` **REQUIRED** | ✅ CONFIRMED — REQUIRED | Not marked as required in checkout doc | Add time slot selector to form, required |
| Payment: transfer | Bank transfer | `POST /orders` `payment_method: 'transfer'` | ✅ CONFIRMED | — | Hỗ trợ thanh toán chuyển khoản |
| Payment: COD | COD option | `POST /orders` `payment_method: 'cod'` | ❌ MISSING | `payment_method: z.enum(["transfer"])` | **BẮT BUỘC giữ lựa chọn COD trên UI**. Yêu cầu Backend bổ sung schema (`TODO_BACKEND`) |
| Voucher/coupon | Apply discount code | `POST /coupons/validate` + included in `POST /orders` as `coupon_code` | ✅ CONFIRMED | None | Validate first, then include code in order payload |
| Invoice info | Business invoice | `POST /orders` — no invoice fields | ❌ MISSING | No invoice fields in backend schema | Giữ UI form hóa đơn. Yêu cầu Backend bổ sung trường (`TODO_BACKEND`) |
| Create order | Submit | `POST /orders` | ✅ CONFIRMED | None | Body: `{ recipient_name, email?, phone, fulfillment_type, delivery_address, delivery_date, delivery_time_slot, coupon_code?, payment_method, note? }` |
| Locations data | Province/district/ward | `/locations/*` | ❌ MISSING | No location API in backend | Use static Vietnam address JSON data file in frontend |

---

## Orders — Post Checkout

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Order tracking (QR) | Show QR + transfer info | `GET /orders/me/:id` | ✅ CONFIRMED | Returns `paymentQrUrl`, `transferContent` | Poll every 3 seconds |
| Payment status polling | Check if paid | `GET /orders/me/:id` → `.paymentStatus` | ✅ CONFIRMED | None | Stop polling on `paymentStatus === 'paid'` |
| Cancel order | Cancel pending order | `PATCH /orders/me/:id/cancel` | ✅ CONFIRMED | None | Only if `orderStatus === 'pending'` |
| View order list | Member order history | `GET /orders/me` | ✅ CONFIRMED | None | Supports pagination and status filter |
| View order detail | Per-order detail | `GET /orders/me/:id` | ✅ CONFIRMED | None | — |
| Write review | After delivery | `POST /reviews` `{ order_item_id, rating, comment, image? }` | ✅ CONFIRMED | Only for `delivered` orders | Guard: show review form only when `orderStatus === 'delivered'` |

---

## Account / Profile

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| View profile | Name, email, phone, avatar | `GET /users/me` | ✅ CONFIRMED | None | — |
| Edit profile | Update name, phone | `PUT /users/me` `{ fullName, phone }` | ✅ CONFIRMED | None | — |
| Upload avatar | File upload | `POST /users/me/avatar` (multipart) | ✅ CONFIRMED | None | — |
| Change password | Old + new password | `PUT /users/me/password` | ✅ CONFIRMED | None | — |
| Address list | Saved addresses | `GET /users/me/addresses` | ✅ CONFIRMED | None | — |
| Add address | Create address | `POST /users/me/addresses` | ✅ CONFIRMED | None | Fields: `recipientName, phone, street, district, city, isDefault` |
| Edit address | Update | `PUT /users/me/addresses/:id` | ✅ CONFIRMED | None | — |
| Delete address | Remove | `DELETE /users/me/addresses/:id` | ✅ CONFIRMED | None | — |
| Loyalty summary | Points + tier | `GET /users/me/loyalty` | ✅ CONFIRMED | None | Returns `loyaltyPoints`, `membershipTier` |
| Loyalty history | Points log | `GET /users/me/loyalty/logs` | ✅ CONFIRMED | None | Paginated |

---

## Membership / Tiers

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Tier benefits page | Static content | None needed | N/A | No CMS | Static frontend config |
| User current tier | Display in account/header | `GET /users/me/loyalty` → `.membershipTier` | ✅ CONFIRMED | None | Tiers: member, bronze, silver, gold, diamond |
| Points accumulation | Automatic via orders | Backend internal (loyalty module) | ✅ CONFIRMED | None | 1 point per 10,000 VND spent, credited on delivery |

---

## Coupons / Vouchers

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Validate coupon | Check code + value | `POST /coupons/validate` `{ code, order_value }` | ✅ CONFIRMED | None | Returns discount amount |
| Apply coupon at checkout | Include in order | Sent as `coupon_code` in `POST /orders` | ✅ CONFIRMED | None | — |
| User voucher list | Personalized vouchers | No API | ❌ MISSING | No user-specific coupon API | TODO_BACKEND. For MVP: user manually enters code |

---

## Blog

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Blog list | Paginated post grid | `GET /blog/posts` | ❌ MISSING | No blog module in backend | TODO_BACKEND. For MVP: static data in frontend |
| Blog category filter | Filter by category | Not available | ❌ MISSING | None | Same as above |
| Blog detail | Full article | `GET /blog/posts/:slug` | ❌ MISSING | None | Static or TODO_BACKEND |
| Newsletter signup | Email capture | Not available | ❌ MISSING | None | TODO_BACKEND. For MVP: static UI only, no backend integration |

---

## Policies

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Policy content | Static text per slug | None needed | N/A | No backend CMS | Static markdown/text files in frontend `policies/data/` |

---

## Custom Cake Configurator

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Load product for configurator | Get product info | `GET /products/:slug` | ✅ CONFIRMED | Need a specific "custom cake" product slug | ASSUMPTION: backend has a custom cake product in DB. Slug TBD |
| Load options for configuration | Option groups + items | `GET /products/:id/options` | ✅ CONFIRMED | None | Returns all option groups (size, cream, toppings, etc.) |
| Price calculation | Real-time total update | Frontend calculation: `basePrice + sum(selectedOptions.extraPrice)` | ✅ ASSUMPTION | Backend finalizes price at order creation | Frontend shows estimated price, backend validates at POST /orders |
| Add custom cake to cart | With all option selections | `POST /cart/items` `{ product_id, quantity, option_item_ids }` | ✅ CONFIRMED | None | `isCustomizable === true` product |
| Preview image | Update on option selection | No dedicated API | ❌ MISSING | No preview image API | Use option_item image if available, or static visual |

---

## Reviews / Ratings

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Product reviews | Display on product detail | `GET /products/:id/reviews` | ✅ CONFIRMED | None | Paginated |
| Write review | After delivered order | `POST /reviews` (multipart: rating, comment, image) | ✅ CONFIRMED | Member only, order must be delivered | Guard review form by order status |
| Review tied to order item | Requires `order_item_id` | `order_item_id` from order detail | ✅ CONFIRMED | None | Must access from order detail screen |

---

## Analytics

| Feature | Frontend behavior | Required API | Backend support | Gap | Recommendation |
|---|---|---|---|---|---|
| Track page views | Batch send events | `POST /analytics/events/batch` | ✅ CONFIRMED | None | Use `AnalyticsService` with batching |
| Track add-to-cart | Fire event | `POST /analytics/events/batch` with `event_type: 'add_to_cart'` | ✅ CONFIRMED | None | — |
| Track product view | Fire event | `POST /analytics/events/batch` with `event_type: 'page_view'` | ✅ CONFIRMED | None | — |
