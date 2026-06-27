# Master Project Audit Report — WeBee Bakery

> Audit Date: 2026-06-27  
> Auditor Role: Senior Product Designer, UX Architect, Angular Frontend Architect, Backend-Aware System Analyst  
> Compliance: 100% No-Code Audit Completed

---

## Audit Scope
The audit comprehensively reviewed all frontend descriptions, design guidelines, agent rules, and backend source code:
- **Backend Source Code**: Express/TypeScript routes, Zod validation schemas, Prisma ERD (`document/erd.md`), Controllers, and Services across 11 modules (`auth`, `users`, `products`, `categories`, `cart`, `orders`, `coupons`, `reviews`, `loyalty`, `options`, `analytics`).
- **Frontend Source Code**: Angular 22 app configuration, existing placeholder pages (`home.page.ts`), core API services (`cart.api.ts`), models, and services.
- **Documentation**: All 13 files in `document/frontend/` (page functional descriptions, UI/UX rules, implementation plans) and core project specs (`context.md`, `api.md`).

---

## Major UX Conflicts Found
1. **Payment Method Mismatch**: Checkout docs & business require both COD and Bank Transfer. Backend currently strictly validates `z.enum(["transfer"])`. **Resolution**: **UI bắt buộc giữ nguyên lựa chọn COD**. Đặt yêu cầu cập nhật Backend schema (`TODO_BACKEND`) làm nhiệm vụ bắt buộc.
2. **Cart Authentication Mechanism**: Frontend `cart.api.ts` was sending an `X-Session-Id` header. Backend `cart.controller.ts` manages guest carts via an HTTP-only cookie (`session_id`). **Resolution**: Documented requirement for frontend to enable `withCredentials: true` and remove the custom header.
3. **Delivery Date & Time Slot**: Checkout docs treated delivery date/time slot as optional or phase 2 enhancements. Backend `orders.schema.ts` marks `delivery_date` and `delivery_time_slot` as required strings. **Resolution**: Updated checkout spec to mandate these fields.
4. **Missing Return-to-Cart Action**: Checkout doc mentioned returning to cart but provided no clear UI link. **Resolution**: Mandated an explicit "Chỉnh sửa giỏ hàng" link in the Order Summary section.

---

## Major UI Consistency Issues Found
1. **Product Card Duplication**: Multiple pages defined independent card layouts. **Resolution**: Standardized on a single `ProductCardComponent` with 3 variants (`default`, `compact`, `recommendation`) and consistent badge rules (`Mới`, `Phổ biến`, `Hết hàng`).
2. **Account Route Naming**: Inconsistent usage between `/profile/*` and `/account/*`. **Resolution**: Unified all user dashboard routes under `/account/*`.
3. **Missing Custom Cake Configurator Spec**: Header links to `/custom-cake` but no page doc existed. **Resolution**: Created `custom_cake.md` defining a split-screen layout with fixed preview and hidden footer.

---

## Major Backend Gaps Found
1. **Best-Sellers Sorting (`soldCount`)**: Backend products table lacks a `soldCount` field. **Resolution**: Marked as `TODO_BACKEND`. Frontend will use `sort=rating_desc` as a temporary proxy for best sellers.
2. **Blog & CMS Modules**: No backend tables or routes exist for Blog posts or static Policies. **Resolution**: Blog and Policies will be implemented using static frontend config files for MVP.
3. **Vietnam Administrative Locations API**: No `/locations/provinces` endpoints exist. **Resolution**: Frontend will bundle static `vietnam-addresses.json` data.

---

## Documentation Files Updated
- `document/frontend/checkout.md` — Added alignment & contract banner (restored COD requirement on UI, marked backend COD as `TODO_BACKEND`).
- `document/frontend/orders.md` — Added alignment & contract banner (restored COD success screen requirement).
- `document/frontend/home.md` — Added alignment resolution banner (noted `users/me` endpoint and `rating_desc` fallback for best sellers).
- `document/frontend/implementation_plan.md` — Revised with standardized `/account/*` routes and detailed 10-phase breakdown.
- `.agent/workflow_rules.md` — Updated with critical backend alignment facts.

---

## Documentation Files Created
- `document/SCREEN_FLOW_INVENTORY.md` — Complete inventory of 25+ screens across public, commerce, account, and admin flows.
- `document/ux_conflict_audit.md` — Detailed matrix of 25 UX conflicts, severities, and recommended fixes.
- `document/ui_improvement_plan.md` — Screen-by-screen UI enhancement plan and taste review guidelines.
- `document/layout_contract.md` — Master contract defining header, footer, cart drawer, and route visibility across all layouts.
- `document/feature_mapping.md` — Exhaustive mapping of frontend actions to confirmed backend endpoints.
- `document/backend/gap_analysis.md` — Safe additive adjustment plan for backend capabilities.
- `document/backend/api_contract.md` — Strict API specification separating confirmed source code endpoints from proposed TODOs.
- `document/schema.md` — Clean TypeScript interfaces representing real Prisma ERD and Zod schemas.
- `document/frontend/custom_cake.md` — Full functional spec for the custom cake builder.
- `.agent/ui_ux_rules.md` — Warm bakery aesthetic principles, component consistency rules, and mandatory state handling.
- `.agent/NO_CODE_PLANNING_RULE.md` — Strict guard against premature coding.
- `.agent/backend_alignment.md` — Mandatory backend alignment checklist for agents.
- `.agent/conflict_check.md` — UX conflict pre-flight checklist.
- `.agent/implementation_workflow.md` — Master execution workflow for coding agents.

---

## Documentation Files Removed/Merged
- `document/frontend/HOME_PAGE_DESCRIPTION.md` — Deprecate-merged into `home.md`.

---

## Recommended Product Decisions
1. **Custom Cake Placement**: Keep `/custom-cake` as a top-level route with its specialized split-screen layout (hidden footer), but also surface a prominent CTA banner/card inside `/products` to boost discoverability.
2. **Cart Drawer vs. Cart Page**: Cart Drawer serves as a quick slide-in overlay (no route change) for rapid quantity adjustments and proceeding to checkout. Cart Page (`/cart`) serves as the dedicated full-screen editor with coupon inputs and order notes. Both share `CartService`.
3. **Checkout Return-to-Cart**: Add an explicit "Chỉnh sửa giỏ hàng" link inside the right-hand Order Summary card on the Checkout page leading back to `/cart`.
4. **Account & My Orders Structure**: All user pages live under `/account/*`. Clicking the header account icon opens a dropdown navigating to `/account` (overview) or `/account/orders` (history).
5. **Content Source**: Defer backend CMS. Use static config files for Blog posts (`blog.config.ts`), Policy pages (`policies.config.ts`), and Membership tier rules.

---

## Backend Adjustment Plan Summary
All proposed backend adjustments follow safe, additive principles (no breaking changes to existing routes):
- **Sprint 1 (Mandatory Backend Updates)**: Update `orders.schema.ts` to support `payment_method: z.enum(["transfer", "cod"])`; add `sold_count` to products; add invoice fields to orders.
- **Sprint 2 (Future)**: Add blog module tables (`blog_posts`, `blog_categories`) and user voucher endpoint (`GET /users/me/vouchers`).

---

## Frontend Implementation Plan Summary
The implementation is broken into 10 safe, sequential phases:
- **Phase 0**: Documentation and alignment (Completed).
- **Phase 1**: Frontend foundation (fix `cart.api.ts`, create all core API services, models, auth interceptor, and guards).
- **Phase 2**: Shared components & layouts (Navbar, Footer, ProductCard, CartDrawer, Loading/Empty/Error states).
- **Phase 3**: Auth flow (`/login`, `/register`, activation, Google OAuth callback).
- **Phase 4**: Public browsing (Home, Product List, Product Detail).
- **Phase 5**: Cart & Checkout (`/cart`, `/checkout`, QR tracking page with polling).
- **Phase 6**: Member Account (`/account/*` dashboard, addresses, order history, review submission).
- **Phase 7**: Content pages (Static Blog, Policies, Membership info).
- **Phase 8**: Custom Cake Configurator (`/custom-cake` split layout).
- **Phase 9**: Admin Panel (`/admin/*` dashboard, product/order/coupon management).
- **Phase 10**: QA, end-to-end integration review, and production build verification.

---

## Remaining Questions for Project Owner
1. **Custom Cake Base Product ID**: To load options for `/custom-cake` via `GET /products/:id/options`, what is the exact `productId` or `slug` of the base Custom Cake product seeded in the database?
2. **Admin Customer List**: Should we prioritize implementing `GET /admin/customers` in the backend so administrators can manage customer accounts, or omit customer management from MVP Admin Panel?
3. **Backend Sprint Priority**: Xác nhận cho phép team Backend cập nhật `orders.schema.ts` để thêm `cod` ngay trong Sprint 1 nhằm đồng bộ với UI Checkout.
