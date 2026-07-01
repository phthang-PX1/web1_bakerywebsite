# Skill: Cập nhật / sửa đổi module đã có

**Khi nào dùng:** Bạn đã hoàn thành module (theo API spec) nhưng cần:
- Sửa logic trong service (ví dụ: thay đổi cách tính giá, thêm điều kiện)
- Thêm/sửa/xóa endpoint
- Thay đổi validation schema
- Cập nhật response structure
- Sửa lỗi nhỏ không phải debug lỗi runtime (nếu là lỗi runtime, dùng skill-debug.md)

**Cách dùng:** Cung cấp đoạn văn bản mô tả rõ:
- Module nào (auth, users, products...)
- Endpoint nào (nếu liên quan) hoặc chức năng nào
- Thay đổi cụ thể cần làm (thêm điều kiện, sửa công thức, bỏ field...)
- Lý do thay đổi (optional nhưng nên có)

**Nhiệm vụ của AI:**
1. Xác định các file cần sửa trong `src/modules/<ten-module>/` dựa trên mô tả.
2. Trích dẫn code hiện tại (đoạn liên quan).
3. Đề xuất code mới (dạng diff hoặc nguyên block).
4. Giải thích tác động đến các phần khác (ví dụ: có cần migration DB không, có ảnh hưởng đến module khác không).
5. Nếu thay đổi ảnh hưởng đến API response hoặc request, nhắc cập nhật Swagger doc.
6. **Không tự động sửa code – chờ xác nhận.**

**Ví dụ input:**
> Module `orders`, endpoint `POST /orders`. Hiện tại đang cho phép đặt hàng với `fulfillment_type = pickup` mà không cần `delivery_address`. Tôi muốn thêm validation: nếu `fulfillment_type = delivery` thì `delivery_address` là bắt buộc, nếu `pickup` thì không được có `delivery_address`.

**Ví dụ output:**
- File cần sửa: `orders.schema.ts` (Zod schema) và `orders.service.ts` (logic).
- Đoạn code cũ / mới.
- Không cần migration.
- Nhắc cập nhật Swagger.