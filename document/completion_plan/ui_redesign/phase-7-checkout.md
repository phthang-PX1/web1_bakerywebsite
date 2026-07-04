# Phase 7 — Checkout flow

## Mục tiêu
3 trang trong `frontend/src/app/features/checkout/pages/`. Form là nơi cần **kiềm chế editorial** — giữ usability tối đa, 0 đổi logic/validation.

## Spec

### checkout.page (`.html` + `.scss`, 11.5kB → rebuild)
- 2 cột: form trái 7 cột / summary receipt phải 5 cột sticky (giống panel cart)
- **Section đánh số editorial**: số Fraunces caramel `01` + title section ("Thông tin giao hàng"...) + hairline trên mỗi section — thay card box từng bước
- Input: `field` mixin — **giữ box viền đầy đủ** (không underline-only), label small tracked caps, error terracotta-dark
- Lựa chọn fulfillment/payment: row hairline + radio, selected = viền terracotta, **không fill tràn màu**
- Day chips / time-slot chips: outline chip, selected viền terracotta
- 1 nút `btn-solid` đặt hàng duy nhất

### checkout-success.page (inline styles)
- Khoảng trắng rộng, "Cảm ơn bạn!" Fraunces `$fs-display-1`
- Mã đơn tabular figures trong chip hairline
- Khối chuyển khoản (QR + nội dung CK) / COD giữ nội dung, restyle receipt
- `btn-solid` theo dõi đơn + `btn-text` về trang chủ

### order-tracking.page (`.html` + `.scss`)
- **Timeline dọc**: connector hairline mảnh, chấm terracotta cho trạng thái hiện tại, title bước Fraunces, timestamp muted
- Thông tin đơn = receipt panel; nút hủy = `btn-text` danger
- Polling dot giữ logic, dùng `pulse` global

## Definition of Done
- [ ] Full flow: cart → checkout → đặt hàng → success → tracking hoạt động
- [ ] Validation form hiển thị đúng, không mất field nào
- [ ] Mỗi SCSS ≤ 8kB, prod build pass
- [ ] Responsive: form stack ≤ 860px, summary lên trên
