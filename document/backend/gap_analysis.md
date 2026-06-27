# Backend Gap Analysis and Adjustment Plan — WeBee Bakery

> Date: 2026-06-27  
> Source: Actual backend route files, schemas, services — verified line by line  
> Principle: All recommendations are ADDITIVE. Do not break existing routes.

---

## Summary

The WeBee backend is well-structured and covers the core commerce flow. However, several frontend requirements cannot be satisfied by the current backend. This document lists every gap, its severity, and a safe adjustment plan.

**Critical gaps (blocking MVP):**
1. Cart session uses HTTP-only cookie — frontend `cart.api.ts` uses wrong mechanism
2. `delivery_date` and `delivery_time_slot` are required but not communicated clearly
3. COD payment option does not exist in backend — must be added (`TODO_BACKEND`) to match UI requirement

**Important gaps (need resolution before certain features):**
4. No `soldCount` field for best-sellers feature
5. No blog module
6. No location API (province/district/ward)
7. No user-specific voucher list

---

## Confirmed Backend Capabilities

| Module | Capabilities confirmed |
|---|---|
| Auth | register, activate, login, Google OAuth, refresh, forgot/reset password, logout |
| Users | GET/PUT profile, avatar upload, change password, addresses CRUD, loyalty summary, loyalty logs |
| Categories | public list, admin CRUD, toggle status |
| Products | public list (filter/sort/search/paginate), detail by slug, reviews, admin CRUD, images |
| Options | product option tree (public), admin CRUD for groups and items |
| Cart | CRUD via Redis, guest (cookie) + member (JWT), merge on login |
| Coupons | validate (public), admin CRUD |
| Orders | create (public/member), member history/detail/cancel, payment webhook, admin management |
| Reviews | member create (delivered orders only), admin list/toggle |
| Loyalty | internal credit on delivery (called by orders module) |
| Analytics | batch event recording, admin overview/behavior |

---

## Missing or Unclear APIs

| ID | Area | Missing/unclear API | Frontend need | Severity | Safe backend recommendation |
|---|---|---|---|---|---|
| GAP-001 | Cart | Cart uses HTTP-only cookie `session_id`, not `X-Session-Id` header | Frontend must enable `withCredentials: true` on all cart requests | **Critical** | No backend change needed. Fix frontend only: remove `X-Session-Id` header from `cart.api.ts`, configure `HttpClient` with `withCredentials` |
| GAP-002 | Products | No `soldCount` or `viewCount` field in products table | Home "Bánh bán chạy nhất" sorted by real sales | **High** | Option A: Add `sold_count INT DEFAULT 0` to products, increment on order delivery. Option B: Use rating_desc as proxy for MVP |
| GAP-003 | Products | No `isFeatured` boolean on categories or products | Home category shortcuts, featured products | **Medium** | Add `is_featured BOOLEAN DEFAULT false` to categories table as optional field |
| GAP-004 | Orders | `delivery_date` and `delivery_time_slot` are REQUIRED but checkout doc treats them as optional | Checkout form must collect both | **Critical** | No backend change. Fix documentation and frontend form to treat both as required |
| GAP-005 | Orders | No COD payment method (`z.enum(["transfer"])`) | Checkout doc & business requires COD | **Critical** | **BẮT BUỘC giữ UI COD**. Yêu cầu Backend bổ sung `cod` vào schema (`z.enum(["transfer", "cod"])`) (`TODO_BACKEND`) |
| GAP-006 | Orders | No invoice fields in orders schema | Checkout doc & business requires invoice | **Medium** | Giữ UI form hóa đơn. Yêu cầu Backend bổ sung các trường hóa đơn (`TODO_BACKEND`) |
| GAP-007 | Orders | Shipping fee is always 0 (`DELIVERY_SHIPPING_FEE = 0`) | Checkout/cart shows shipping fee | **High** | Giữ UI hiển thị phí. Yêu cầu Backend bổ sung API tính phí giao hàng (`TODO_BACKEND`) |
| GAP-008 | Locations | No location API (`GET /locations/provinces` etc.) | Checkout 3-dropdown address form | **High** | Frontend solution: bundle static Vietnam address JSON in frontend assets. No backend API needed |
| GAP-009 | Coupons | No user-specific voucher list | Account page "Voucher của tôi" | **Medium** | TODO_BACKEND: Add `GET /users/me/vouchers` or `GET /coupons/available-for-me` in future sprint |
| GAP-010 | Blog | No blog module | Blog page (list + detail) | **High** | For MVP: static content in frontend. Future: add blog module to backend (posts, categories, tags) |
| GAP-011 | Reviews | Review form requires `order_item_id` from a delivered order | Order detail page review trigger | **Low** | No backend change. Frontend must pass correct `order_item_id`. Access from order detail API response |
| GAP-012 | Analytics | No `GET /auth/me` endpoint | Multiple page docs reference it | **Critical** | No backend change. Fix all frontend docs and code to use `GET /users/me` |
| GAP-013 | Products | No recommendation/related products endpoint | Cart Drawer "Mua kèm", Similar products | **Medium** | Frontend workaround: `GET /products?category=&limit=4` filtered by same category. For MVP: acceptable |
| GAP-014 | Customers | `GET /admin/customers` and `GET /admin/customers/:id` documented in api.md but not found in routes | Admin customer list page | **Medium** | Verify via Swagger. If missing, TODO_BACKEND. Do not implement admin customer page until confirmed |
| GAP-015 | Products | `avg_rating` is a denormalized field in products table | Product listing, sorting | **Low** | Already exists (`avg_rating DECIMAL(3,2)`). No gap — but frontend must read from product response |
| GAP-016 | Cart | After successful login, frontend must call `POST /cart/merge` to merge guest cart | Login post-action | **High** | No backend change. Fix in `AuthService`: after login success → call `CartService.mergeCart()` |
| GAP-017 | Orders | Guest order creation — `email` field is optional in backend schema | Guest checkout UX | **Low** | Confirmed optional (`email: z.string().trim().email().optional()`). Guest can checkout without email. Show email field as optional |
| GAP-018 | Home | No home-specific API (banners, featured sections) | Home page hero/banners | **Low** | Static config in frontend. Future: add CMS |

---

## Field-Level Gaps

| Entity | Missing/conflicting field | Needed by screen | Recommendation |
|---|---|---|---|
| `orders` | `invoice_*` fields | Checkout invoice section | Giữ UI, yêu cầu Backend bổ sung (`TODO_BACKEND`) |
| `products` | `sold_count` INT | Home best sellers | Giữ UI, yêu cầu Backend bổ sung (`TODO_BACKEND`) |
| `categories` | `is_featured` BOOLEAN | Home category shortcuts | Giữ UI, yêu cầu Backend bổ sung (`TODO_BACKEND`) |
| `orders` | `delivery_address` is single string | Checkout multi-field address UI | Frontend concatenates; no backend change needed |
| `cart_items` (Redis) | No `note` field per item | Cart Drawer item-level note/lời chúc | Giữ UI lời chúc, yêu cầu Backend bổ sung (`TODO_BACKEND`) |
| `products` | No `lead_time_hours` | Checkout: custom cake needs 24-48h lead time | Add additively in future sprint |

---

## Conflict Risks

| Risk | Existing backend behavior | Frontend expectation | Safe resolution |
|---|---|---|---|
| Cart authentication mechanism | Cookie `session_id` (HttpOnly) | Frontend sends `X-Session-Id` header | Fix in frontend: remove wrong header, use withCredentials |
| `GET /auth/me` usage | Route does not exist | Multiple docs + potential frontend code call this | Fix in all docs and frontend to use `GET /users/me` |
| COD payment | Not in backend (`payment_method: z.enum(["transfer"])`) | Checkout requires COD | **BẮT BUỘC giữ COD trên UI**, yêu cầu Backend bổ sung (`TODO_BACKEND`) |
| Shipping fee | Always 0 in backend | Checkout shows fee | Giữ UI hiển thị phí, yêu cầu Backend bổ sung API tính phí (`TODO_BACKEND`) |
| `delivery_date` and `delivery_time_slot` | **Required** in backend schema | Checkout doc treats as optional/future | Treat as required in checkout form |

---

## Safe Backend Adjustment Principles

- **Do not break existing routes** — any change must be additive (new optional fields, new endpoints).
- **Prefer additive changes** — add new optional columns to tables with DEFAULT values.
- **Add optional fields** instead of renaming existing fields.
- **Support existing response shape** where possible.
- **Keep order pricing calculated on backend** — do NOT trust frontend total.
- **Do not trust frontend price totals** — backend validates and recalculates cart/coupon/order pricing.
- **Cart items are stored in Redis** — Redis schema is flexible, but existing fields should not be renamed.
- **Order item stores product snapshot** — `productNameSnapshot`, `unitPriceSnapshot` are already in schema (confirmed from orders.service.ts).

---

## Recommended Backend Adjustments (Safe, Future Sprint)

### Sprint 1 additions (safe, additive)

1. **Add `sold_count` to products table:**
   - `sold_count INT NOT NULL DEFAULT 0`
   - Increment in `orders.service.ts` when order status changes to `delivered`
   - Exposes via `GET /products?sort=sold_desc`

2. **Add `is_featured` to categories:**
   - `is_featured BOOLEAN NOT NULL DEFAULT false`
   - Admin can toggle featured status
   - Used on home category shortcuts

3. **Add invoice fields to orders (optional):**
   - `invoice_requested BOOLEAN DEFAULT false`
   - `invoice_company_name VARCHAR(255) NULL`
   - `invoice_tax_code VARCHAR(50) NULL`
   - `invoice_company_address VARCHAR(500) NULL`

### Sprint 2 additions

4. **Add blog module** (posts, categories) if dynamic blog is needed.

5. **Add `GET /users/me/vouchers`** for personalized voucher display.

6. **Add `GET /admin/customers`** if admin customer management is needed (verify via Swagger first — GAP-014).
