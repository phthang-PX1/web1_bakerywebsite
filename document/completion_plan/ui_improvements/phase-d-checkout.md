# Phase D — Checkout UI/UX

## Việc cụ thể
1. **Lỗi validate màu đỏ**: `.field__error` đang dùng `$primary-dark` (nâu) — đổi sang `t.$danger` tại `checkout.page.scss`, `auth.page.scss`, `account-form.page.scss`, `product-detail` hint (đồng bộ toàn site).
2. **Bớt đơn sắc**:
   - Selected state (fulfillment/payment/day-chip/time-slot): thêm nền `$surface-warm` bên cạnh viền terracotta.
   - Summary panel: header band nền `$sand`; dòng "Tổng cộng" màu terracotta.
   - Số section `01-06` caramel tăng cỡ nhẹ để tạo nhịp thị giác.
3. **Submit khi form invalid**: `markAllAsTouched` + scroll tới `.field__error` đầu tiên (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) + toast đỏ "Vui lòng kiểm tra lại thông tin đặt hàng".

## Definition of Done
- [ ] Submit thiếu trường → lỗi đỏ hiện, trang scroll tới field lỗi đầu tiên, toast đỏ
- [ ] Lựa chọn active có nền ấm rõ ràng; summary có điểm nhấn màu
