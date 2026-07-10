# Phase 4 — UI/UX polish

## Mục tiêu

Dọn dẹp các điểm không nhất quán về UI/UX đã xác minh trong đợt khảo sát: trang admin không responsive và không theo cấu trúc file của phần còn lại của app, thiếu trang 404, checkout-success dễ mất dữ liệu khi refresh, và code debug còn sót lại.

## Việc cụ thể

### 4.1 — Trang admin không responsive, style viết inline thay vì tách file
- Cả 5 trang admin (`dashboard`, `products-list`, `product-form`, `orders-list`, `coupons-list`, `order-detail`) dùng chung `frontend/src/app/features/admin/admin.page.scss` (243 dòng) với chỉ **1** khối `@media` — trong khi phần còn lại của app có tới 14/21 file `.scss` chứa `@media`.
- 5 trang admin viết template dạng inline string (`template: \`...\``) với **37 chỗ** dùng `style="..."` trực tiếp thay vì class CSS — lệch với quy ước tách `.html`/`.scss` riêng của các phần khác trong codebase (VD: `features/admin/pages/coupons-list.page.ts:15-16,23,40,59`, `products-list.page.ts:19-21,44-49,53,65`, `dashboard.page.ts`, `order-detail.page.ts:17,28-33`).
- **Fix**: tách từng trang admin thành `.page.html` + `.page.scss` riêng theo đúng pattern các feature khác (VD: `features/products/pages/product-list.page.ts` + `.html`); chuyển style inline sang class SCSS; bổ sung `@media` breakpoint cho mobile/tablet giống các trang customer-facing.

### 4.2 — Không có trang 404
- `frontend/src/app/app.routes.ts:139` (wildcard route `**`) hiện `redirectTo: ''` — người dùng vào URL sai bị chuyển thẳng về trang chủ mà không có thông báo.
- **Fix**: tạo component `NotFoundPage` đơn giản (thông báo "Không tìm thấy trang", nút quay về trang chủ), đổi route wildcard trỏ tới component này thay vì redirect.

### 4.3 — Checkout-success phụ thuộc hoàn toàn vào `history.state`
- `frontend/src/app/features/checkout/pages/checkout-success.page.ts:180-186` — lấy dữ liệu đơn hàng từ `history.state`; nếu người dùng refresh trang hoặc vào thẳng URL `/checkout/success`, `state()` là `null` và chỉ hiện thông báo "Không tìm thấy thông tin đơn hàng" mà không có cách nào tra cứu lại.
- **Fix**: thêm fallback — nếu có `orderId` trong query param (`/checkout/success?orderId=...`), gọi API lấy chi tiết đơn hàng thay vì chỉ dựa vào `history.state`. Khi điều hướng tới trang này sau khi tạo đơn thành công, luôn kèm `orderId` vào query param.

### 4.4 — Console.log debug còn sót
- `frontend/src/app/features/products/pages/product-list.page.ts:109` và `:180` — `console.log('[DEBUG] ...')`.
- **Fix**: xóa 2 dòng debug log này.

### 4.5 — Category chọn bằng input UUID thô
- Đã liệt kê chi tiết ở [Phase 1, mục 1.9](phase-1-integration-fixes.md#19--category-chọn-bằng-ô-nhập-uuid-thô) — đây là lỗi UX nghiêm trọng nên đã được xếp vào Phase 1 để sửa sớm cùng luồng admin product form. Không lặp lại ở đây, chỉ tham chiếu.

## Skill khi thực thi

- `/code-review` (effort thấp, tập trung cleanup/simplification) trước khi tách file admin — để đảm bảo việc tách không vô tình đổi hành vi (binding, event handler) trong lúc di chuyển code.
- `/verify` sau khi tách file và thêm responsive: chạy UI thật ở nhiều kích thước màn hình (mobile ~375px, tablet ~768px, desktop) cho tất cả 5 trang admin.
- `/verify` cho trang 404: thử vào URL không tồn tại, xác nhận hiển thị đúng trang thay vì redirect im lặng.
- `/verify` cho checkout-success: tạo đơn hàng thật → refresh trang success → xác nhận vẫn hiển thị đúng thông tin đơn hàng.

## Definition of Done

- [ ] 5 trang admin đã tách `.html`/`.scss` riêng, không còn `style="..."` inline.
- [ ] Trang admin hiển thị đúng, dùng được trên màn hình mobile/tablet (kiểm tra bằng DevTools responsive mode).
- [ ] Vào URL không tồn tại hiển thị trang 404 rõ ràng, có nút quay về trang chủ.
- [ ] Refresh trang `/checkout/success?orderId=...` vẫn hiển thị đúng thông tin đơn hàng.
- [ ] Không còn `console.log('[DEBUG]...')` trong `product-list.page.ts`.
