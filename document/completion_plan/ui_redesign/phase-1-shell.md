# Phase 1 — Shell: site-header, site-footer

## Mục tiêu
Header/footer xuất hiện trên mọi trang — redesign trước để toàn site chuyển tông ngay. Logic (search, dropdown, auth state, cart badge, mobile menu) giữ nguyên 100%; chỉ đổi markup class + SCSS.

## site-header (`frontend/src/app/shared/components/site-header/`)
Hiện tại: 524 dòng SCSS, nền trắng blur, màu lẫn `#3b2a1e`/`#f4c542` + stray `#C96A2E`.

Spec mới (viết lại SCSS từ đầu trên tokens):
- Nền `$paper` + hairline bottom `$border` (bỏ shadow + backdrop-blur nặng)
- Nav link = uppercase tracked micro-label (12-13px, 600), hover/active = offset-underline (không đổi màu nền); dropdown category giữ hành vi, panel `$surface` + hairline + `$shadow-soft`
- Search expand giữ hành vi, input dùng `field` mixin
- Icon button: bỏ nền tròn viền — icon trần + hover terracotta; cart badge = chấm nhỏ `$ink` với số `$accent`
- Nút đăng nhập: `btn-outline` (thay pill vàng fill)
- Mobile menu giữ cấu trúc, restyle theo token

## site-footer (`frontend/src/app/shared/components/site-footer/`)
Hiện tại: nền `#3b2a1e`, 4 cột đều, icon PNG invert.

Spec mới:
- Block `$ink` full-bleed. Zone trên: tagline hiện có set **Fraunces italic cỡ `$fs-display-2`** tràn hết chiều rộng, hairline mờ bên dưới
- Dưới: cột bất đối xứng (brand + contact rộng bên trái, link columns phải), heading cột = small-caps tracked, text cream muted, hover terracotta
- Bottom bar: hairline + copyright + policy links
- Google Maps iframe giữ (grayscale sẵn có)

## Definition of Done
- [ ] Header đổi phong cách trên mọi route, mọi chức năng hoạt động (search, dropdown, cart, account, hamburger)
- [ ] Footer editorial, mọi link hoạt động
- [ ] 0 hex khai tử (`#3b2a1e`, `#f4c542`) còn lại trong 2 component
- [ ] Responsive 390px + 1440px ổn
