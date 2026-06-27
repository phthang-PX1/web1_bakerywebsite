# UX Conflict Audit — WeBee Bakery

> Audit date: 2026-06-27  
> Auditor: Senior Product Designer / Backend-Aware System Analyst  
> Sources reviewed: All `document/frontend/*.md` + actual backend source code

---

## Legend

- **CONFLICT** — Two or more docs/code parts contradict each other
- **TODO_UX** — UX flow needs improvement before implementation
- **TODO_BACKEND** — Backend capability missing or unclear
- **TODO_DESIGN** — Design is missing or incomplete
- **OUTDATED** — Content no longer matches backend reality
- **CONFIRMED** — Verified from actual code

---

| ID | Area | Conflict / Issue | Screens involved | Severity | Recommended fix | Status |
|---|---|---|---|---|---|---|
| UX-001 | Payment method | Checkout doc describes both `COD` and `Chuyển khoản` as payment options. **Backend only supports `"transfer"` (chuyển khoản).** `payment_method: z.enum(["transfer"]).default("transfer")` — COD does not exist in backend schema. | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION | **Critical** | Remove COD from checkout UI. Only bank transfer is supported. Update checkout doc. | CONFLICT — docs vs backend code |
| UX-002 | Cart session mechanism | `cart.api.ts` sends `X-Session-Id` header for guest cart. **Backend reads guest cart from an HTTP-only cookie named `session_id`**, not a header. The backend sets/reads this cookie automatically. | Cart Drawer, Cart Page, Checkout | **Critical** | Remove `X-Session-Id` header from `cart.api.ts`. Guest cart relies on browser cookie — frontend must enable `withCredentials: true` on HTTP requests to the cart API. | CONFLICT — frontend code vs backend code |
| UX-003 | `GET /auth/me` endpoint | Multiple page docs reference `GET /auth/me` as the auth state API. **This endpoint does not exist in backend.** Backend provides `GET /users/me` (requires auth). | Header (all pages), HOME, Product, Cart Drawer, Blog, Policies | **Critical** | Update all docs to use `GET /users/me` instead of `GET /auth/me`. | CONFLICT — docs vs backend code |
| UX-004 | Delivery address structure | Checkout doc defines a 3-dropdown address form (Tỉnh/Thành phố → Quận/Huyện → Phường/Xã) with separate model fields. **Backend `orders.schema.ts` only has one `delivery_address` field (a single text string, max 500 chars).** | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION | **High** | Two options: (A) Keep 3 dropdowns on frontend and concatenate into one string before sending to backend. (B) Simplify to a single textarea. Recommend option A for better UX — concatenate province + district + ward + street into `delivery_address`. Document this mapping clearly. | CONFLICT — docs vs backend code |
| UX-005 | Hóa đơn doanh nghiệp (Invoice) | Checkout doc includes an "Invoice info" section (company name, tax code, company address). **No such field exists in backend `orders.schema.ts` or `orders` database table.** | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION | **High** | Mark invoice feature as `TODO_BACKEND`. Do not implement the invoice form until backend supports it. Remove it from Phase 1 checkout scope. Add a note. | CONFLICT — docs vs backend code |
| UX-006 | Account route naming | `implementation_plan.md` uses routes `/profile`, `/profile/orders`, `/profile/addresses`, `/profile/loyalty`. All new page functional description docs use `/account`, `/account/orders`, `/account/profile`. | ACCOUNT_PAGE_FUNCTIONAL_DESCRIPTION, FRONTEND_IMPLEMENTATION_PLAN | **High** | Standardize on `/account/*` routes as defined in the newer page docs. Update FRONTEND_IMPLEMENTATION_PLAN accordingly. | CONFLICT — docs vs docs |
| UX-007 | Checkout — no visible return to Cart | Checkout doc (section 13, Order Summary) mentions `Chỉnh sửa giỏ hàng` as a small link but there is no breadcrumb, no back button, and no explicit return-to-cart action defined in the layout. Cart doc explicitly says: "Trang checkout nên có link quay lại /cart." The design does not clearly specify placement. | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION, CART_PAGE_FUNCTIONAL_DESCRIPTION | **High** | Add an explicit, visible "Chỉnh sửa giỏ hàng" link in the Order Summary section (right column, above or below item list). This is the canonical return path. Do not rely on browser back. | TODO_UX |
| UX-008 | Order success routes conflict | ORDER_SUCCESS doc proposes multiple alternative routes: `/order-processing`, `/order-success/:orderId`, `/checkout/success/:orderId`, `/account/orders/:orderId`. Checkout doc also proposes `/checkout/payment/:orderId`. No single route is decided. | ORDER_SUCCESS_AND_MY_ORDERS, CHECKOUT_PAGE | **High** | Standardize: `POST /orders` → success → redirect to `/orders/:orderId/track` (for payment/QR tracking) → after payment confirmed → redirect to `/account/orders/:orderId`. Remove all other alternative routes from docs. | CONFLICT — docs vs docs |
| UX-009 | COD post-checkout flow | Checkout doc describes a post-checkout flow for COD (redirect to `/order-success/:orderId`). **COD does not exist in backend.** All orders go through bank transfer + polling. | CHECKOUT_PAGE, ORDER_SUCCESS_AND_MY_ORDERS | **Critical** | Remove COD flow. All checkout success goes through bank transfer QR page then polling. The order tracking page (`/orders/:orderId/track`) already handles this per UI_UX_RULES. | CONFLICT — docs vs backend |
| UX-010 | Review form timing | ORDER_SUCCESS doc implies users can write reviews. Reviews require `order_item_id` from a **delivered** order. Backend `reviews.routes.ts` allows review on any delivered order item. Docs don't clearly state the "delivered" precondition. | ORDER_SUCCESS_AND_MY_ORDERS, ACCOUNT_PAGE | **Medium** | Clarify in both docs: review form only appears when `orderStatus === 'delivered'`. Add this business rule explicitly. | TODO_UX |
| UX-011 | Home — "Bánh bán chạy" has no `soldCount` field | HOME doc requires a "Bánh bán chạy" section sorted by actual sales. **Backend `products` table has no `soldCount` or `sold_count` field.** The `GET /products` API supports `sort=rating_desc` but not `sort=sold_desc`. | HOME_PAGE_FUNCTIONAL_DESCRIPTION | **High** | Mark as `TODO_BACKEND`. For MVP: use `sort=rating_desc` as a proxy for best sellers. Document the limitation clearly. Do not claim it's sorted by sales when it's by rating. | CONFLICT — docs vs backend code |
| UX-012 | Product card — Add to Cart on Home vs Detail | HOME doc says "Cho phép thêm sản phẩm vào giỏ hàng ngay trên Home." But adding a product to cart requires `option_item_ids` for customizable products. A product card on Home cannot show option selection. | HOME_PAGE_FUNCTIONAL_DESCRIPTION, PRODUCT_DETAIL_PAGE | **Medium** | Clarify: Quick "Add to cart" on Home/Product List is only available for non-customizable products (`isCustomizable === false`). Customizable products must link to Product Detail for option selection. Add this rule to HOME and PRODUCT page docs. | TODO_UX |
| UX-013 | Missing Custom Cake page doc | Multiple pages reference `/custom-cake` route. No `custom_cake.md` file exists in `document/frontend/`. | All pages with Tùy chỉnh bánh header link | **High** | Create `custom_cake.md`. Until then, mark the Custom Cake route as `TODO_DESIGN`. | TODO_DESIGN |
| UX-014 | Header — Membership route | Header menu has "Thành viên" item linking to `/membership`. This appears in all page docs. **No backend module exists for a membership landing page.** `/users/me/loyalty` covers loyalty data but not a marketing page. | All pages | **Medium** | For MVP: Create a static `/membership` page that explains tier benefits. It does not need a backend API. Mark as static content. | TODO_DESIGN |
| UX-015 | Blog — No backend module | BLOG doc describes dynamic blog content with categories, posts, and detail pages. **No blog module exists in backend.** No blog tables in ERD. | BLOG_PAGE_FUNCTIONAL_DESCRIPTION | **High** | For MVP: Blog must be static content or defer to a future phase. Mark all blog API calls as `TODO_BACKEND`. Do not build dynamic blog until backend has a blog module. | CONFLICT — docs vs backend code |
| UX-016 | Policy — No backend module | POLICIES doc describes 6 policy pages by slug (`/policies/customer-support`, etc.). No backend CMS for policies. | POLICIES_PAGE_FUNCTIONAL_DESCRIPTION | **Medium** | Policies must be static content in the frontend (`src/app/features/policies/data/`). No backend API needed. Mark accordingly. | ASSUMPTION |
| UX-017 | Shipping fee discrepancy | Checkout doc shows `Phí vận chuyển: 30.000đ` in the UI example. **Backend has `const DELIVERY_SHIPPING_FEE = 0` — shipping fee is always 0.** Order doc also lists `shippingFee`. | CHECKOUT_PAGE, ORDER_SUCCESS_AND_MY_ORDERS | **High** | Shipping fee is 0 for all orders in current backend. Do not display incorrect fee. Frontend should display fee from order response, not calculate it. If backend returns 0, show "Miễn phí". | CONFLICT — docs vs backend code |
| UX-018 | Checkout doc — `GET /auth/me` vs `GET /users/me` | Section 16 API checklist in checkout doc lists `GET /auth/me`. Backend has no such endpoint. | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION | **High** | Update to `GET /users/me`. | OUTDATED |
| UX-019 | Order note vs item note | CART_DRAWER doc and CART_PAGE doc both mention "lời chúc/ghi chú". Backend `orders.schema.ts` has one `note` field (order-level). There is no item-level note in backend cart or order schema. | CART_DRAWER, CART_PAGE, CHECKOUT | **Medium** | Clarify: only one note field at order level, sent with `POST /orders` as `note`. Item-level notes are not supported in current backend. Remove mention of item-level notes or mark as `TODO_BACKEND`. | CONFLICT — docs vs backend code |
| UX-020 | Product recommendation in Cart Drawer | CART_DRAWER doc mentions a "Product recommendation section." No such API endpoint exists in backend for cart-based recommendations. | CART_DRAWER_FUNCTIONAL_DESCRIPTION | **Low** | For MVP: either remove recommendations from Cart Drawer or show static/random active products. Mark as `TODO_BACKEND` for smart recommendations. | TODO_BACKEND |
| UX-021 | Search route `/search` | Multiple page docs mention a search modal or `/search` route. **No search-specific endpoint exists in backend.** Product search is handled via `GET /products?search=...`. | All pages (header search icon) | **Medium** | Implement search as a modal that calls `GET /products?search=...` and displays results inline or navigates to `/products?search=...`. No dedicated `/search` route needed. | ASSUMPTION |
| UX-022 | `delivery_time_slot` required field | Backend `orders.schema.ts` has `delivery_time_slot: z.string().trim().min(1).max(50)` as a **required** field. Checkout doc marks time slots as optional/future ("Đề xuất thêm sau"). | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION, backend orders.schema.ts | **Critical** | `delivery_time_slot` is REQUIRED by backend. Checkout form must include time slot selection. Update checkout doc to include this as required. Provide default time slots if not from backend. | CONFLICT — docs vs backend code |
| UX-023 | `delivery_date` required field | Backend `orders.schema.ts` has `delivery_date: z.coerce.date()` as **required**. Checkout doc treats date as a UX enhancement. | CHECKOUT_PAGE, backend orders.schema.ts | **High** | `delivery_date` is REQUIRED by backend for all orders. Checkout must always collect delivery date. | CONFLICT — docs vs backend code |
| UX-024 | Address fields in backend vs checkout | Backend `orders.schema.ts` sends `delivery_address` as a single string. Checkout model proposes `RecipientInfo` with separate `addressLine`, `provinceCode`, `provinceName`, etc. | CHECKOUT_PAGE_FUNCTIONAL_DESCRIPTION | **High** | Frontend must concatenate: `"[street], [ward], [district], [province]"` → single `delivery_address` string. The three-dropdown UI is fine but the API payload is one field. | CONFLICT — docs vs backend code |
| UX-025 | Home page doc duplication | Two HOME page docs exist: `HOME_PAGE_DESCRIPTION.md` (old, 12375 bytes) and `home.md` (new, 23393 bytes). | document/frontend/ | **Medium** | Delete `HOME_PAGE_DESCRIPTION.md`. The new `home.md` supersedes it. | MERGE/REMOVE |

---

## Summary of Critical Issues

| ID | Issue | Impact |
|---|---|---|
| UX-001 | COD payment not in backend | Checkout form is wrong |
| UX-002 | Cart session uses cookie not header | Guest cart will not work |
| UX-003 | `/auth/me` endpoint doesn't exist | Auth state loading fails everywhere |
| UX-009 | COD post-checkout flow | Entire post-checkout flow is wrong for COD |
| UX-022 | `delivery_time_slot` is required in backend | Order creation will always fail without it |
| UX-023 | `delivery_date` is required in backend | Order creation will always fail without it |

---

## Files that need immediate updates

| File | Reason | Changes required |
|---|---|---|
| `checkout.md` | COD conflict, address structure, delivery_date/time_slot required, invoice TODO | Remove COD, clarify address concatenation, make date/time_slot required, mark invoice as TODO_BACKEND |
| `cart_drawer.md` | Item note conflict | Clarify only order-level note in backend |
| `cart.md` | Item note conflict | Same |
| `home.md` | soldCount doesn't exist, /auth/me doesn't exist | Fix API references |
| `orders.md` | Route conflicts, COD references | Standardize routes, remove COD |
| `implementation_plan.md` | /profile/* vs /account/* routes | Unify to /account/* |
