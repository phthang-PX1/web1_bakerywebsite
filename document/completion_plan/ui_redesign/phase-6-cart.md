# Phase 6 — Cart

## Mục tiêu
`frontend/src/app/features/cart/pages/cart.page.{html,scss}` (10.4kB) — reframe thành **order sheet/receipt**. Logic chọn item, optimistic update, coupon giữ nguyên.

## Spec
- Title "Giỏ hàng" Fraunces + đếm item
- **Item = hairline-divided list** (bỏ card box từng item, bỏ shadow): ảnh 72px góc sắc / tên + option tags / stepper / line-total **Fraunces tabular** / "Xóa" text-link
- Select-all + checkbox giữ, accent terracotta
- **Summary panel**: cột phải sticky (lg+), `$surface` + hairline + `$r-sm`; row hairline-separated; tổng Fraunces; `btn-solid` full-width thanh toán + `btn-text` tiếp tục mua — **xóa toàn bộ định nghĩa `.btn` cục bộ**, dùng mixin
- Empty state: dòng Fraunces italic + `btn-outline`
- Confirm-dialog + stepper từ Phase 2 tự áp dụng

## Definition of Done
- [ ] Thêm/xóa/đổi số lượng/chọn item/coupon hoạt động y nguyên
- [ ] 0 định nghĩa `.btn` cục bộ còn lại trong file
- [ ] SCSS ≤ 8kB
- [ ] Responsive 1 cột ≤ 900px (summary lên trên)
