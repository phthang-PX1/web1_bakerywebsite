# Phase 3 — Home page

## Mục tiêu
Trang chủ là statement piece của phong cách editorial. 5 component trong `frontend/src/app/features/home/components/`, logic + data binding giữ nguyên.

## Spec

### hero-banner
- Split bất đối xứng ~55/45, copy trái với khoảng trắng trên rộng
- Eyebrow dùng mixin (rule line dẫn); H1 `$fs-display-1` Fraunces, `<em>` hiện có → italic terracotta
- **Bỏ**: orb gradient, double-frame xoay, floating tag (đơn giản hóa template, giữ binding `heroImageUrl`)
- Ảnh: khung **arch** (`$r-arch`), bleed sát mép phải viewport (negative margin ở `lg+`); caption 1 dòng muted bên dưới thay floating tag
- Stats row: hairline-top, số Fraunces lớn, micro-label uppercase
- CTA: 1 `btn-solid` + 1 `btn-text` mũi tên

### category-shortcuts
**Thay emoji bằng typographic index**: mỗi category = row lớn `01 — Bánh kem →` (số Fraunces caramel, tên ink), hairline divider giữa các row; hover: tên italic + mũi tên trượt. Logic loading/error giữ.

### product-section (dùng 2 lần)
- Header: eyebrow + title `$fs-display-2` Fraunces trái, subtitle muted dưới, "Xem tất cả" `btn-text` trên baseline title bên phải
- Variant `softBackground` → band `$sand` full-bleed, padding `$section-y`
- **Phá grid đều bằng CSS thuần**: 12 cột, `:nth-child(1)` span 6 (featured), còn lại span 3; section soft đảo featured sang phải bằng `order`. Mobile: scroll-snap ngang. 0 đổi TS.

### custom-cake-cta
Band `$ink` full-bleed, headline Fraunces italic cream + từ nhấn honey, 1 nút outline cream. Bỏ ring xoay + spark dots + noise overlay.

### membership-faq
2 cột bất đối xứng: title Fraunces + intro sticky trái (~4 cột), FAQ hairline rows phải (~7 cột offset 1); toggle +/− giữ logic; tier colors đổi sang token.

## Definition of Done
- [ ] Không còn emoji trong category-shortcuts
- [ ] Hero không còn orb/frame xoay, ảnh arch bleed đúng
- [ ] Grid sản phẩm có nhịp featured/regular, mobile scroll-snap
- [ ] Screenshot 390px + 1440px đạt checklist editorial
