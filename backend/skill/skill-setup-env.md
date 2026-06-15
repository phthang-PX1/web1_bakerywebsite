# Skill: Setup môi trường và biến (Phase 0)

Bạn là AI Agent hỗ trợ setup backend. Dự án dùng Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis + các dịch vụ bên thứ ba (Xem tài liệu `tech-stack.md`).

**Nhiệm vụ:**
1. Đọc file `implementation-plan.md` (Phase 0) để biết danh sách tài khoản/API key cần có.
2. Liệt kê chi tiết từng bước tôi cần làm để có được:
   - PostgreSQL connection string (khuyến nghị Supabase)
   - Redis URL (Upstash)
   - Cloudinary (cloud_name, api_key, api_secret)
   - Google OAuth Client ID/Secret (kèm redirect URI mẫu)
   - Gmail App Password (kèm hướng dẫn bật 2FA)
   - Twilio Account SID, Auth Token, số điện thoại
   - SePay TMN Code, Hash Secret, URL sandbox
3. Tạo file `.env.example` với tất cả biến cần thiết, mỗi biến kèm chú thích.
4. Sau khi tôi có các giá trị thật, hướng dẫn tôi tạo file `.env` và đặt vào thư mục gốc.

### Sepay (thay thế VNPay)
1. Đăng ký tài khoản tại [my.sepay.vn](https://my.sepay.vn) (gói miễn phí).
2. Xác thực email và đăng nhập.
3. Vào mục **Tích hợp Webhooks** → **Thêm Webhooks**.
4. Điền:
   - **Khi tài khoản ngân hàng là**: Chọn tài khoản ngân hàng của bạn.
   - **Gọi đến URL**: `https://yourdomain.com/webhooks/sepay` (sau khi deploy, dùng ngrok khi test local).
   - **Kiểu chứng thực**: `API Key`. Hệ thống sẽ sinh ra một API Key.
5. Copy API Key đó vào biến `SEPAY_API_KEY` và `SEPAY_WEBHOOK_SECRET` (giống nhau).
6. Lấy số tài khoản và mã ngân hàng (VD: `MBBank`, `Vietcombank`) điền vào `SEPAY_ACCOUNT_NUMBER` và `SEPAY_BANK_CODE`.
7. Để test local, dùng [ngrok](https://ngrok.com) để expose port 3000 và cập nhật webhook URL tạm thời.

**Yêu cầu đầu ra:** 
- Danh sách các bước thực hiện dạng checklist để tôi đánh dấu.
- File `.env.example` hoàn chỉnh.

**Lưu ý:** Không yêu cầu tôi cung cấp secret trong prompt này, chỉ hướng dẫn cách lấy và cách cài đặt.