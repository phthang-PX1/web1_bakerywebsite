# Taste UI Review Rules — WeBee Bakery

> Date: 2026-06-27  
> Applies to: All WeBee Angular frontend screens  
> Purpose: Improve visual quality, consistency, and usability without changing confirmed business functions.

---

## Non-negotiables

- Do not remove required functionality.
- Do not invent backend APIs.
- Do not redesign the brand from scratch.
- Preserve WeBee warm bakery identity.
- Use consistent components across screens.
- Follow established design tokens — do not introduce new color values ad hoc.

---

## Visual Principles

### Brand identity

WeBee is a premium Vietnamese bakery. The aesthetic must feel:

- **Warm** — cream background, amber/golden tones, brown text.
- **Premium** — generous whitespace, refined typography, soft shadows.
- **Minimal** — no visual clutter. Every element must earn its place.
- **Inviting** — product photography is the hero. UI must not compete with the products.

### Color palette (from `UI_UX_RULES.md`)

```
--color-primary:        #C96A2E   (Amber-brown — brand)
--color-primary-light:  #F5E6D3   (Cream/ivory background)
--color-primary-dark:   #7A3D18   (Dark chocolate)
--color-accent:         #E8B86D   (Golden honey)
--color-success:        #4CAF50
--color-error:          #E53935
--color-warning:        #FF9800
--color-text-primary:   #1A1A1A
--color-text-secondary: #6B6B6B
--color-bg-base:        #FDFAF6   (Warm off-white)
--color-bg-card:        #FFFFFF
```

Never introduce plain red, pure blue, or generic grey outside this palette without explicit approval.

### Typography

- Font: `Inter` (Google Fonts). Load in `index.html`.
- `h1` — 2.25rem / 36px, weight 700
- `h2` — 1.75rem / 28px, weight 600
- `h3` — 1.25rem / 20px, weight 600
- Body — 1rem / 16px, weight 400, line-height 1.6
- Caption / label — 0.875rem / 14px, weight 400
- Price text — 1.125rem / 18px, weight 600, `--color-primary-dark`

### Spacing

- Base unit: 8px.
- Section margin: minimum 48px (6 units).
- Card padding: 16–24px.
- Form field gap: 16px.
- Never use arbitrary pixel values. Always use multiples of 8.

---

## Component Consistency Rules

### ProductCard

One `ProductCard` component used across Home, Product List, Similar Products, Recommendations.

Variants:
- `default` — standard grid card (Product List, Home featured sections)
- `compact` — smaller card for horizontal sliders or mobile
- `recommendation` — for Cart Drawer "Mua kèm" / Similar Products section

All variants share:
- Same rounded corners: `--radius-md` (12px)
- Same image aspect ratio: 4:3 or 1:1 (decide one, apply everywhere)
- Same badge system: `Mới`, `Phổ biến`, `Hết hàng`
- Same price display pipe: `CurrencyVndPipe`
- Same star rating display
- Same "Add to Cart" CTA behavior (redirect to detail for customizable products)

Do NOT create separate product card markup in Home, Product List, and Detail pages independently.

### Header

One shared `HeaderComponent` used on all standard pages.

Must support:
- Guest state: show `Đăng nhập` button
- Logged-in state: show account icon/dropdown
- Active menu state per page
- Cart badge with live count from `CartService`
- Policy dropdown (same 6 items as footer)
- Product dropdown (category list from API)

The header must NOT be rebuilt per page.

### Footer

One shared `FooterComponent`.

Shown on: Home, Products, Product Detail, Cart, Checkout, Account, Blog, Policies, Order Success.

Hidden on: Custom Cake Configurator (focused flow, no footer distractions).

### Cart state

`CartService` (BehaviorSubject) is the single source of truth.

- Cart Drawer: uses `CartService.cart$`
- Cart Page: uses `CartService.cart$`
- Checkout: reads from `CartService.cart$` for summary
- Header cart badge: reads from `CartService.snapshot.totalQuantity`

Do NOT load cart independently in each component. Always read from `CartService`.

### Buttons

| Type | Usage | Style |
|---|---|---|
| Primary | Main CTA (Đặt hàng, Thêm vào giỏ, Tiếp tục) | Background `--color-accent`, text dark, weight 600, border-radius `--radius-md` |
| Secondary | Back actions, Cancel | Border 1px `--color-primary`, background transparent, text `--color-primary` |
| Danger | Delete, Cancel order | Background `--color-error`, text white |
| Ghost | Minor actions, tertiary links | No border, no background, text `--color-primary` with underline on hover |

All buttons must have:
- Hover state (slightly darker)
- Disabled state (opacity 0.5, not-allowed cursor)
- Loading state (spinner inside, text changes to "Đang xử lý...")

### Forms

- Use consistent field height: 48px
- Label above field (not inside as placeholder-only)
- Error message below field in `--color-error`
- Valid field: no special decoration unless UX requires it
- Required indicator: `*` after label text (not red star separately)
- Group related fields in labeled sections

### Cards

All cards:
- Background: `--color-bg-card` (#FFF)
- Border radius: `--radius-md` (12px)
- Shadow: `0 2px 8px rgba(0,0,0,0.06)`
- Hover shadow: `0 4px 16px rgba(0,0,0,0.10)` with transition
- Padding: 16–24px depending on content density

### Badges / Tags

Product badges:
- `Mới`: `--color-accent` background, white text
- `Phổ biến`: `--color-primary` background, white text
- `Hết hàng`: `#9E9E9E` background, white text, product card overlay

Loyalty tier badges:
- Use `TierBadgeComponent`
- Colors per tier: Bronze (#CD7F32), Silver (#9E9E9E), Gold (#FFD700), Diamond (#B9F2FF)

---

## Page-Level Taste Rules

### Home

- Hero must be visually impactful — full-width, real photography
- Category shortcuts: icon + label, not text-only
- "Bánh mới" and "Bán chạy" sections: horizontal scroll on mobile, grid on desktop
- Membership section: warm gradient background, not a plain white card
- Empty section fallback: always show a skeleton, never a blank gap

### Product Listing

- Sidebar filter: sticky on desktop, bottom sheet on mobile
- Product grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Sort dropdown: right-aligned above grid
- Pagination: centered, with "Trang X / Y" text
- No filter = no results state must show friendly message, not blank

### Product Detail

- Main image: large, zoomable on click
- Thumbnail strip: horizontal scroll, active thumbnail highlighted
- Option groups: clear section labels, required groups have `*`
- Price display: base price + options breakdown (real-time update)
- "Thêm vào giỏ hàng" button: full-width on mobile, width-constrained on desktop
- Review section: star distribution bar + paginated list

### Cart Drawer

- Slide in from right with overlay
- Item row: thumbnail (small, square) + name + options summary + quantity stepper + price
- Sticky footer: subtotal + "Tiến hành đặt hàng" CTA
- Empty state: illustration + "Giỏ hàng trống" + "Xem sản phẩm" CTA

### Cart Page

- Full-width item list on left (or top on mobile)
- Order summary card on right (sticky on desktop)
- Coupon code: input + "Áp dụng" button, inline validation feedback
- "Tiến hành đặt hàng" button: primary, full-width on mobile
- "Chỉnh sửa" link in summary area to return to cart from checkout

### Checkout

- Two-column layout (form left, summary right) on desktop
- Single column on mobile (form first, summary collapsible below)
- Fulfillment method: segmented card selector (not radio buttons)
- Time slot: pill/chip selector, not dropdown
- Payment: segmented card selector
- QR code: displayed prominently after order creation
- "Chỉnh sửa giỏ hàng" link: visible in order summary card, links to `/cart`

### Order Tracking (QR + polling)

- QR code: large (minimum 200×200px), center-aligned
- Transfer amount: large text, `--color-primary-dark`, weight 700
- Transfer content (reference): monospace font, copyable
- Polling indicator: pulsing animation or subtle spinner
- Success state: celebration animation, confetti or emoji, order code displayed

### Account Pages

- Left sidebar navigation (desktop) → bottom tabs or hamburger (mobile)
- Active tab: `--color-primary` indicator on left border
- Profile section: avatar + name + tier badge prominent at top
- Loyalty points: large number display, progress bar to next tier
- Order list: status badge colored by status, expandable rows or links to detail

### Custom Cake Configurator

- Split-screen layout: preview image (left/top, sticky) + options panel (right/bottom, scrollable)
- Preview updates visually on option selection (image swap or CSS visual)
- Price summary: fixed at bottom of options panel, always visible
- No footer — focused flow
- Back/cancel: clear "← Quay lại" at top

---

## Loading, Empty, Error States

**Every** data-fetching component must implement all 4 states:

| State | UI pattern |
|---|---|
| Loading | Skeleton card (same shape as final content), `aria-live="polite"` |
| Empty | Centered illustration + Vietnamese message + optional CTA |
| Error | Error message + "Thử lại" button, call retry |
| Success | Show data as designed |

Use shared `LoadingSpinnerComponent` only for full-page loads (cart merge, order creation).

Do NOT show blank space while loading. Do NOT show raw error messages from API.

---

## Responsive Behavior

| Breakpoint | Layout change |
|---|---|
| ≥1280px | Full desktop layout |
| 1024px–1279px | Sidebar may collapse, grid may reduce columns |
| 768px–1023px | 2-column grids, stacked checkout |
| <768px | Single column, bottom navigation, drawer menus |

Mobile-first CSS is preferred. Define mobile layout first, then override for larger screens.

---

## Animation Guidelines

- Drawer open/close: slide + fade, 250ms ease
- Toast notification: slide in from top-right, 200ms ease-out, auto-dismiss 4s
- Loading skeleton: shimmer animation
- Card hover: shadow transition 200ms
- Button hover: background transition 150ms
- Price update: number changes should have a brief `flash` or highlight effect

Do NOT add animations that:
- Block interaction for more than 300ms
- Auto-play videos without user consent
- Flash rapidly (accessibility risk)

---

## Inherited UI State & Layout Patterns (from UI_UX_RULES.md)

### Loading state
```html
<div class="loading-spinner" aria-live="polite">
  <!-- Show spinner or skeleton card -->
</div>
```

### Empty state
```html
<div class="empty-state">
  <img src="empty-illustration.svg" alt="No items" />
  <p>Chưa có dữ liệu</p>
</div>
```

### Error state
```html
<div class="error-state">
  <p>Có lỗi xảy ra. Vui lòng thử lại.</p>
  <button (click)="retry()">Thử lại</button>
</div>
```

### List page pattern
Every list page must include:
1. **Page title** (`<h1>`)
2. **Search or filter**
3. **Data grid or card list**
4. **Pagination controls**
5. **Empty state**
6. **Primary action button**

### Create/Edit page pattern
1. **Back link**
2. **Page title**
3. **Reactive Form** with inline validation errors
4. **Submit button** with loading state
5. **Cancel button**

### Delete/destructive action rule
All delete or cancel actions MUST require confirmation via `confirm-dialog`. Never delete immediately on button click.

### Copywriting guidelines (Vietnamese)
| Context | Use |
|---|---|
| Error from API | "Có lỗi xảy ra. Vui lòng thử lại sau." |
| Loading | "Đang tải..." |
| Empty list | "Chưa có [noun]" |
| Account not activated | "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email/SMS." |
| Login required | "Vui lòng đăng nhập để tiếp tục." |
| Coupon invalid | "Mã giảm giá không hợp lệ hoặc đã hết hạn." |
| Order cancelled | "Đơn hàng đã được hủy." |
| Payment confirmed | "Thanh toán thành công! Đơn hàng của bạn đang được xử lý." |
