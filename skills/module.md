# Skill: Tạo module hoàn chỉnh từ API spec

**Ngữ cảnh:** Dự án đã có scaffold, Prisma schema, và file `api-spec.md`.

**Nhiệm vụ:** Tạo module `<tên-module>` (ví dụ: `auth`, `users`, `products` …) dựa trên phần tương ứng trong `api-spec.md`.

**Quy trình bắt buộc:**
1. Đọc đoạn API spec của module đó.
2. Tạo 5 file trong `src/modules/<tên-module>/`:
   - `<tên-module>.routes.ts`
   - `<tên-module>.controller.ts`
   - `<tên-module>.service.ts`
   - `<tên-module>.schema.ts` (Zod)
   - `<tên-module>.types.ts`
3. Trong `routes.ts`, định nghĩa các endpoint, gán middleware: `auth` (nếu cần), `role` (nếu cần), `validate` (dùng schema Zod).
4. Trong `controller.ts`, chỉ gọi service, không logic phức tạp, bắt lỗi và gọi `next(error)`.
5. Trong `service.ts`, implement logic theo mô tả "Logic end-to-end" trong API spec.
6. Trong `schema.ts`, định nghĩa Zod schema cho request body, params, query.
7. Trong `types.ts`, export các interface cần thiết (nếu có).
8. Sử dụng `AppError` để throw lỗi (import từ `middlewares/errorHandler`).
9. Tích hợp route vào `src/routes/index.ts`.

**Đầu ra:**
- Liệt kê các endpoint đã tạo, path và method.
- Với mỗi endpoint, giải thích ngắn gọn logic end-to-end.
- Đề xuất request mẫu để test qua Swagger.

**Lưu ý:** Không tự ý thêm endpoint ngoài API spec. Nếu có gì chưa rõ, hỏi tôi trước.
Với module Orders, bám theo `api.md` và `implementation-plan.md` để implement luồng QR tĩnh + webhook `/webhooks/payment`.
