# Skill: Tích hợp dịch vụ bên thứ ba

**Ngữ cảnh:** Tích hợp một dịch vụ (Cloudinary, Google OAuth, Nodemailer, Twilio) hoặc hoàn thiện utility thanh toán QR tĩnh vào module cụ thể, theo `implementation-plan.md` Phase 4.

**Nhiệm vụ:**
1. Xác định dịch vụ và module sẽ dùng.
2. Thêm các biến môi trường cần thiết vào `src/config/env.ts` (nếu chưa có) và cập nhật `.env.example`.
3. Tạo file trong `src/utils/` (ví dụ `upload.ts`, `oauth.ts`, `email.ts`, `sms.ts`, `payment.ts`) với các hàm tiện ích.
4. Viết một endpoint test riêng (ví dụ `POST /test/email` hoặc `GET /test/cloudinary-upload`) để tôi có thể kiểm tra tích hợp hoạt động trước khi gắn vào luồng chính.
5. Giải thích cách lấy credential nếu tôi chưa có (dẫn link đăng ký, lấy key).
6. Sau khi tôi xác nhận test OK, hướng dẫn tích hợp vào module thật (gọi hàm từ service).

**Đầu ra:**
- Các file mới hoặc cập nhật.
- Hướng dẫn test endpoint.
- Giải thích chi tiết luồng gọi API của dịch vụ đó.
