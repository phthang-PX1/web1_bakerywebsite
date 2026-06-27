# UI/UX Improvement Plan — WeBee Bakery

> Date: 2026-06-27  
> Derived from: `ux_conflict_audit.md` + `ui_ux_rules.md`  
> Rule: All improvements must NOT break confirmed business functions.

---

## Screen-by-Screen Improvements

| Screen | Issue | Improvement | Function changed? | Priority |
|---|---|---|---|---|
| Checkout | No visible return-to-cart action | Add "Chỉnh sửa giỏ hàng" link in Order Summary card (right column), above the product list. Link goes to `/cart`. | No | **Critical** |
| Checkout | COD option must be kept | **Bắt buộc giữ phương thức COD** trên UI. Yêu cầu Backend bổ sung `cod` vào schema (`TODO_BACKEND`). | No | **Critical** |
| Checkout | `delivery_date` and `delivery_time_slot` treated as optional | Both are required for bakery business. Make date picker and time slot selector required fields. | Yes (function-aligned) | **Critical** |
| Checkout | Invoice section not in backend | Giữ nguyên UI form yêu cầu hóa đơn cho khách hàng nghiệp vụ. Yêu cầu Backend bổ sung trường hóa đơn (`TODO_BACKEND`). | No | **High** |
| Checkout | Shipping fee displayed as `30.000đ` in doc example | Show fee from backend response. If `shippingFee = 0`, display "Miễn phí" or shipping rule. Mark API calculation as `TODO_BACKEND`. | No | **High** |
| Checkout | Address structure mismatch | Keep 3-dropdown UI (tỉnh/quận/phường) for UX, but concatenate into single string for `delivery_address` API field. | No | **High** |
| All pages | `GET /auth/me` referenced in docs | Replace with `GET /users/me` in all documentation. Frontend implementation must call `GET /users/me`. | No (doc only) | **Critical** |
| Cart Drawer | Recommendation section (mua kèm) | Giữ nguyên UI section "Mua kèm". Dùng tạm sản phẩm cùng danh mục hoặc yêu cầu Backend bổ sung recommendation API (`TODO_BACKEND`). | No | **Medium** |
| Cart Drawer + Cart Page | Item-level note/lời chúc | Giữ nguyên UI trường nhập lời chúc/ghi chú cho từng bánh. Yêu cầu Backend lưu cấu trúc ghi chú theo item (`TODO_BACKEND`). | No | **High** |
| Home | "Bánh bán chạy" implies sales data | Giữ nguyên tiêu đề UI "Bánh bán chạy nhất". Yêu cầu Backend bổ sung trường `sold_count` (`TODO_BACKEND`). Tạm thời dùng `sort=rating_desc`. | No | **High** |
| Home | Quick "Add to Cart" on card | Only non-customizable products allow quick add-to-cart. Customizable products must redirect to detail page. Show different CTA or "Xem chi tiết" for customizable. | No | **Medium** |
| Product Detail | Review form timing | Review button/form only visible when `orderStatus === 'delivered'`. Add explicit guard. | No | **Medium** |
| Order success | Route conflicts | Standardize post-checkout route as `/orders/:orderId/track` (payment + polling) → then `/account/orders/:orderId`. Remove all alternative route proposals from docs. | No (doc only) | **High** |
| All pages — Header | Policy dropdown config | Policies dropdown (6 items) in header and footer must use one shared config file. | No | **Medium** |
| Custom Cake | No page doc exists | Create `custom_cake.md`. Split layout required. Footer hidden. | No (doc only) | **High** |
| Membership | No page doc exists | Create static `/membership` page doc. Content: tier benefits table, points rules, no backend API needed for static version. | No (doc only) | **Medium** |
| Product Listing | Product card variants inconsistent | Standardize on one `ProductCard` component with variants. No duplicate markup. | No | **High** |
| Account | Route naming inconsistency | All account routes use `/account/*`. Update `implementation_plan.md` to change `/profile/*` to `/account/*`. | No (doc only) | **High** |
| Blog | Dynamic blog not backed by backend | Mark Blog as `TODO_BACKEND` for dynamic content. For MVP: static blog posts in frontend config. | No | **High** |

---

## Custom Cake Placement Decision

### Options evaluated

1. Keep `/custom-cake` as top-level route.
2. Include Custom Cake as a product/category entry inside `/products`.
3. Do both: keep header shortcut and also show it as a product/category card.

### Recommendation: Option 3 (Do both)

**Reason:**

- Custom Cake is a special configurator flow (different layout, no footer, split-screen) — it must remain its own route at `/custom-cake`.
- However, users browsing `/products` may not think to use the header. Surfacing a "Tùy chỉnh bánh theo yêu cầu" card in the Product List improves discoverability.
- The header `Tùy chỉnh bánh` link continues to route to `/custom-cake`.
- A featured card/CTA banner on the Product List page (or Home categories section) links to `/custom-cake`.

**Implementation notes:**

- Custom Cake is NOT a `product` in the database — it is a configurator using the `options` system.
- Do not add `/custom-cake` as a product slug in the products table.
- Footer is hidden on `/custom-cake`.
- After "Add custom cake to cart", open Cart Drawer (do not navigate away).

---

## Navigation Consistency Required

All 6 page documents currently list the same header menu:

```
Trang chủ / Sản phẩm / Tùy chỉnh bánh / Blog / Chính sách / Thành viên
```

This confirms the header is consistent. One `HeaderComponent` must be implemented.

---

## Backend-Driven vs Static Content Decision

| Content | Backend-driven? | Recommendation |
|---|---|---|
| Hero banners | No backend support | Static config in frontend, `TODO_BACKEND` for CMS |
| Product categories | Yes — `GET /categories` | Dynamic |
| Products | Yes — `GET /products` | Dynamic |
| Cart | Yes — Redis-backed | Dynamic |
| Blog posts | No backend support | Static config for MVP |
| Policies | No backend support | Static config (markdown files or data file) |
| Membership tiers/rules | No backend support | Static config — use loyalty tier enum from ERD |
| Banners/promotions | No backend support | Static config |
| Store location | No backend support | Static (address + embedded map iframe) |
