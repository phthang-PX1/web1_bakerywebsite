# Phase 7 — Đồng bộ tài liệu

## Mục tiêu

Các tài liệu trong `document/backend/` đã trôi dạt khỏi trạng thái thực tế của code (một số do code thay đổi sau khi viết docs, một số do docs mô tả kế hoạch chưa triển khai). Phase này cập nhật lại để tài liệu phản ánh đúng trạng thái code sau khi các phase 1-6 hoàn tất, tránh gây hiểu nhầm cho người phát triển tiếp theo.

## Việc cụ thể

### 7.1 — `document/backend/api_contract.md` (ghi ngày 2026-06-27, tự nhận "Verified directly against routes.ts" — nay đã lệch)
Các điểm cần sửa lại cho khớp code thật (đã xác minh trực tiếp trong đợt review):
- COD (`payment_method: "cash"`) **đã được** hỗ trợ trong `orders.schema.ts` — xóa mục TODO_BACKEND liên quan trong tài liệu.
- Route admin được mount ở prefix riêng `/admin/*` (VD: `POST /admin/categories`), không lồng trực tiếp dưới path public như tài liệu mô tả.
- Không có `DELETE /categories/:id`, `DELETE /coupons/:id`, `DELETE /products/:id` — chỉ có `PATCH .../status` để toggle active. Sửa lại phần liệt kê endpoint cho đúng.
- Route toggle review là `PATCH /admin/reviews/:id/visibility`, không phải `/reviews/:id/status` như tài liệu ghi.
- Payment webhook mount ở `/webhooks/payment`, không phải `/orders/payment-webhook`.

### 7.2 — `document/backend/gap_analysis.md`
- Cập nhật các gap đã được đóng trong Phase 1-5: X-Session-Id header (đã dùng cookie session, không còn gap), cart merge sau login (method đã tồn tại — xác nhận đã được gọi tự động sau login hay chưa, nếu Phase 1 không sửa việc này thì ghi lại thành gap còn tồn tại), COD/`payment_method` (đã resolve).
- Thêm gap mới phát hiện trong đợt review này nếu Phase 5 quyết định không triển khai `VoucherInventory` — ghi rõ đây là tính năng có schema nhưng cố ý chưa triển khai, không phải bug.
- Cập nhật trạng thái GAP-014 (`GET /admin/customers`) nếu vẫn còn thiếu sau các phase.

### 7.3 — `document/audit_report.md`
- Đối chiếu lại toàn bộ nội dung sau khi Phase 1-6 hoàn tất, cập nhật các mục đã được audit trước đó nhưng nay đã thay đổi trạng thái.

### 7.4 — `document/loyalty_rule.md`
- Nếu Phase 5 triển khai cơ chế trigger đánh giá tier (endpoint hoặc cron), bổ sung mô tả cơ chế thực tế vào tài liệu này (hiện tài liệu chỉ mô tả quy tắc tính toán, không mô tả cách nó được thực thi).

## Skill khi thực thi

- Không cần skill đặc biệt — đọc code mới nhất sau khi Phase 1-6 hoàn tất, đối chiếu từng file tài liệu, sửa trực tiếp bằng Edit. Đây là công việc đối chiếu thủ công, không cần agent riêng.

## Definition of Done

- [ ] `api_contract.md` khớp 100% với route thật trong `backend/src/routes/index.ts` và từng `*.routes.ts` (kiểm tra lại bằng cách liệt kê route thật và so sánh dòng-theo-dòng).
- [ ] `gap_analysis.md` phản ánh đúng gap còn tồn tại sau Phase 1-6, không còn liệt kê gap đã đóng.
- [ ] `audit_report.md` cập nhật theo trạng thái mới nhất.
- [ ] `loyalty_rule.md` mô tả đúng cơ chế trigger thực tế (nếu có thay đổi ở Phase 5).
