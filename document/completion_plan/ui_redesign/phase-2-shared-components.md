# Phase 2 — Shared components

## Mục tiêu
Redesign 8 component dùng chung trước khi làm các trang (trang compose chúng). Vì hiện 0 SCSS dùng chung, migrate từng component không thể vỡ component khác. Component inline-style chỉ sửa mảng `styles:[]` trong `.ts` — logic giữ nguyên.

Thứ tự: product-card → quantity-stepper → star-rating → pagination → loading-spinner → toast → confirm-dialog → cart-drawer.

## Spec từng component (`frontend/src/app/shared/components/`)

### product-card (`.html` + `.scss`) — đòn bẩy lớn nhất
- Bỏ double-bezel frame, overlay div, block nút solid nặng
- Anatomy mới: ảnh **4:5 góc sắc (radius 0)** + hairline border; badge = tag uppercase honey-trên-ink góc trên trái (không pill)
- Body trên nền trong suốt/paper: tên **Fraunces** clamp 2 dòng; rating rút gọn `★ 4.9 (123)` muted; giá Fraunces 1.25rem với hairline phía trên
- Nút thêm giỏ: `btn-outline` pill **luôn hiển thị** (usability mobile); icon PNG → inline SVG túi nhỏ
- Variant `--compact`: cùng anatomy, padding chặt hơn

### quantity-stepper (inline)
Nhóm pill viền hairline: − / số / +, không nút fill; hover terracotta.

### star-rating (inline)
Giữ logic; sao caramel, số tabular-nums.

### pagination (inline)
Số Fraunces trần (không box), trang active = gạch chân ink; prev/next = text-link mũi tên.

### loading-spinner (inline)
Ring 2px terracotta mảnh; xóa `@keyframes spin` cục bộ (đã có global).

### toast (inline)
Card paper, rule trái 3px màu semantic, `$shadow-lift`, `$r-sm`.

### confirm-dialog (inline)
Panel paper `$r-sm`, title Fraunces, action = 1 `btn-solid` + 1 `btn-text` (xóa CSS button riêng).

### cart-drawer (inline)
Panel paper trượt phải, header "Giỏ hàng" Fraunces + hairline, item = receipt rows (hairline divider, không card con), footer sticky: tổng Fraunces + `btn-solid` thanh toán full-width + `btn-text` "Xem giỏ hàng".

## Definition of Done
- [ ] Home, list, detail, cart, drawer render đúng với component mới
- [ ] Mỗi component chỉ diff trong `styles:[]`/template, 0 đổi logic
- [ ] `@keyframes` cục bộ đã xóa khỏi các component migrate
