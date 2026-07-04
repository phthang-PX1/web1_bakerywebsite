# Phase 2 — Bảo mật

## Mục tiêu

Xử lý các lỗ hổng bảo mật đã xác minh trước khi đưa hệ thống lên môi trường production, tập trung vào các endpoint thiếu kiểm soát truy cập và thiếu giới hạn tài nguyên.

## Việc cụ thể

### 2.1 — `/internal/loyalty/credit` endpoint không có auth bắt buộc
- Route: `backend/src/modules/loyalty/loyalty.routes.ts:862-874`
- `requireInternalKey` middleware gọi `next()` ngay lập tức nếu `env.INTERNAL_API_KEY` không được set.
- `INTERNAL_API_KEY` hiện là `.optional()` trong `backend/src/config/env.ts:30`.
- Hậu quả nếu key không được set trong môi trường triển khai: bất kỳ ai gọi được endpoint này đều có thể POST `order_id` để cộng điểm loyalty tùy ý cho user bất kỳ, không cần xác thực.
- Route này hiện **không được gọi bởi code nội bộ nào** — `backend/src/modules/orders/orders.service.ts` gọi thẳng `creditDeliveredOrderLoyaltyInTransaction()` trong cùng process, không qua HTTP.
- **Fix (chọn 1 trong 2)**:
  - (a) Bắt buộc `INTERNAL_API_KEY` (bỏ `.optional()` trong `env.ts`) để app crash khi khởi động nếu thiếu key, đảm bảo không bao giờ chạy production thiếu bảo vệ; hoặc
  - (b) Xóa hẳn route HTTP `/internal/loyalty/credit` nếu xác nhận không có hệ thống ngoài nào cần gọi nó — giảm bề mặt tấn công triệt để hơn.
  - Khuyến nghị: (b) nếu không có nhu cầu tích hợp ngoài, vì "endpoint chết nhưng có lỗ hổng" là rủi ro không cần thiết.

### 2.2 — Upload file không giới hạn kích thước ở tầng multer
- `multer({ storage: multer.memoryStorage() })` không có `limits: { fileSize }`, khiến file được buffer toàn bộ vào RAM trước khi tầng ứng dụng tự kiểm tra giới hạn 5MB.
- Các nơi bị ảnh hưởng: `backend/src/modules/categories/categories.service.ts`, `products.service.ts`, `options.service.ts`, `users.service.ts` (avatar), `reviews.service.ts`.
- File cấu hình multer dùng chung: `backend/src/utils/upload.ts`.
- Rủi ro: gửi file rất lớn (VD: hàng trăm MB) có thể gây memory-exhaustion DoS trước khi app kịp reject.
- **Fix**: thêm `limits: { fileSize: 5 * 1024 * 1024 }` trực tiếp vào cấu hình `multer()` trong `upload.ts` — multer sẽ reject request ngay khi vượt giới hạn, không buffer hết vào RAM trước.

### 2.3 — JWT secret entropy thấp / secret thật nằm trong `.env`
- `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` trong `backend/.env` là chuỗi hex 32 ký tự (~128 bit entropy) — thỏa mãn `.min(32)` trong `env.ts:12-13` nhưng ở mức tối thiểu.
- File `.env` không bị commit vào git (đã xác minh qua `git ls-files`/`git log --all`), nhưng vẫn là secret thật nằm trên đĩa dạng plaintext.
- **Fix**: trước khi deploy production, rotate `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` sang giá trị dài hơn/ngẫu nhiên hơn (khuyến nghị ≥ 64 ký tự từ charset rộng, hoặc dùng `crypto.randomBytes(48).toString('base64')`). Không cần thay đổi code, chỉ cần thay giá trị env khi deploy.

## Skill khi thực thi

- Dùng `/security-review` để quét lại toàn bộ codebase sau khi tự sửa 2.1 và 2.2 thủ công — mục đích là tìm các endpoint upload/internal khác chưa được liệt kê ở đây (review này chỉ xác minh những gì đã tìm thấy trong đợt khảo sát ban đầu, có thể còn sót).
- Sau khi sửa, dùng `/verify` để xác nhận hành vi thực tế: gọi `/internal/loyalty/credit` khi thiếu key phải bị từ chối (401/403) chứ không phải `next()` im lặng; upload file vượt 5MB phải bị multer reject ngay, không phải sau khi xử lý xong.

## Definition of Done

- [ ] `/internal/loyalty/credit` không thể gọi thành công nếu thiếu `INTERNAL_API_KEY` hợp lệ (hoặc route đã bị xóa hoàn toàn).
- [ ] Mọi endpoint upload (category, product, option, avatar, review) reject file > 5MB ngay ở tầng multer, xác minh bằng request thử với file giả lớn.
- [ ] JWT secret trong `.env` môi trường production (không phải dev) đã được rotate sang giá trị mới, độ dài/entropy cao hơn.
- [ ] `/security-review` chạy lại không phát hiện thêm phát hiện nghiêm trọng nào liên quan đến các endpoint đã liệt kê.
