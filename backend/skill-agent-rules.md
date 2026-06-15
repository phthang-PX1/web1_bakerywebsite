# Project Rules – Webee Backend
Nếu có gì chưa rõ cần phải hỏi lại để có sự xác nhận, nếu có thay đổi gì phải check lại tài liệu, kế hoạch liên quan để chỉnh sửa lại bổ sung để cho đồng bộ (cần phải đưa tôi check lại). Code phải gọn gàng, không cần note quá chi tiết

- Khi làm module Orders, bắt buộc đọc tài liệu Sepay và tuân theo `skill-payment-sepay.md`.
## Format response mong đợi từ AI
- **Đối với code:** giải thích logic trước, sau đó đưa code (hoặc diff).
- **Đối với debug:** xác định nguyên nhân → đề xuất hướng fix → không tự sửa.
- **Đối với cập nhật:** chỉ ra file cần sửa, code cũ → code mới, tác động.

## Những điều cấm AI làm
- Tự ý chạy `npm install`, `prisma migrate`, `git commit`.
- Tự ý xóa file mà không hỏi.
- Đề xuất thay đổi ERD hoặc API spec mà không có lý do chính đáng.

## Tech stack
Node.js + TypeScript + Express + Prisma + PostgreSQL (Supabase) + Redis + Zod.

## Cấu trúc module
Mỗi module trong src/modules/<name>/ gồm:
- <name>.routes.ts
- <name>.controller.ts
- <name>.service.ts
- <name>.schema.ts (Zod)
- <name>.types.ts

## Quy tắc code
- Toàn bộ input request phải validate bằng Zod trước khi vào controller.
- Controller chỉ gọi service, không chứa business logic.
- Mọi lỗi throw qua errorHandler dùng class AppError(statusCode, message).
- Không hardcode secret — luôn đọc qua src/config/env.ts.
- Sau khi tạo code, giải thích ngắn gọn logic end-to-end của endpoint đó.

## Tài liệu tham khảo
- ERD: backend/document/erd.md
- API spec: backend/document/api-spec.md
- Kế hoạch: backend/document/implementation-plan.md
- Cấu trúc: backend/document/project-structure.md