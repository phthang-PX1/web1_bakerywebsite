# Skill: Setup môi trường và biến (Phase 0)

Bạn là AI Agent hỗ trợ setup backend. Dự án dùng Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis + các dịch vụ bên thứ ba (xem `tech-stack.md`).

**Nhiệm vụ:**
1. Đọc `implementation-plan.md` (Phase 0) để biết danh sách tài khoản/biến môi trường cần có.
2. Liệt kê chi tiết từng bước để tôi có được:
   - PostgreSQL connection string (khuyến nghị Supabase)
   - Redis URL (Upstash)
   - Cloudinary (`cloud_name`, `api_key`, `api_secret`)
   - Google OAuth Client ID/Secret (kèm redirect URI mẫu)
   - Gmail App Password (kèm hướng dẫn bật 2FA)
   - Twilio Account SID, Auth Token, số điện thoại
   - Ảnh QR chuyển khoản tĩnh và URL dùng cho `STATIC_QR_URL`
   - JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) với độ dài an toàn
3. Tạo `.env.example` với tất cả biến cần thiết, mỗi biến có chú thích ngắn nếu cần.
4. Sau khi tôi có các giá trị thật, hướng dẫn tôi tạo `.env` và đặt ở thư mục gốc.

### QR chuyển khoản tĩnh
1. Chuẩn bị ảnh QR chuyển khoản ngân hàng cố định.
2. Upload ảnh đó lên Cloudinary hoặc một nơi lưu trữ ổn định.
3. Dùng URL ảnh để điền vào biến `STATIC_QR_URL`.
4. Không cần cổng thanh toán, không cần ngrok, không cần webhook từ bên thứ ba cho MVP.
5. Luồng xác nhận thanh toán của MVP dùng endpoint nội bộ mô phỏng `POST /webhooks/payment`.

### JWT secrets
1. Tạo hai secret riêng cho access token và refresh token.
2. Mỗi secret nên dài tối thiểu 32 ký tự, ngẫu nhiên, không dễ đoán.
3. Không commit các giá trị thật vào repo; chỉ điền placeholder trong `.env.example`.

**Yêu cầu đầu ra:**
- Danh sách bước thực hiện dạng checklist để tôi đánh dấu.
- File `.env.example` hoàn chỉnh.

**Lưu ý:** Không yêu cầu tôi cung cấp secret trong prompt này, chỉ hướng dẫn cách lấy và cách cài đặt.
