# Skill: Debug lỗi API

**Khi tôi gặp lỗi, tôi sẽ cung cấp:**
- Method và endpoint gây lỗi.
- Nội dung request (nếu có).
- Response lỗi hoặc log chi tiết.

**Nhiệm vụ của bạn:**
1. Đọc các file liên quan trong module đó (routes, controller, service, schema).
2. Xác định nguyên nhân lỗi (validation sai, logic service, lỗi database, lỗi middleware…).
3. Giải thích rõ nguyên nhân bằng ngôn ngữ dễ hiểu.
4. Đề xuất cách sửa (cụ thể dòng code nào cần thay đổi, thêm gì).
5. **Không sửa code trực tiếp** – chờ tôi xác nhận hướng fix.

**Ví dụ output:**
Lỗi 400 Bad Request khi gọi POST /auth/login.
Nguyên nhân: Zod schema yêu cầu trường 'email' nhưng request gửi lên lại là 'username'.
Đề xuất sửa: đổi tên trường trong schema thành 'username' hoặc yêu cầu FE gửi đúng 'email'.