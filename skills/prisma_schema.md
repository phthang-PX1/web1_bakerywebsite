# Skill: Tạo Prisma schema từ ERD

**Ngữ cảnh:** Đã có file `erd.md` (14 bảng, quan hệ, kiểu dữ liệu).

**Nhiệm vụ:**
1. Đọc `erd.md` và tạo file `prisma/schema.prisma`.
2. Chuyển các bảng thành model Prisma, đúng tên, kiểu, khóa chính (UUID dùng `@default(uuid())`).
3. Chuyển các ENUM thành `enum` của Prisma.
4. Định nghĩa các quan hệ (1-N, 1-1) qua `@relation`.
5. Thêm `@@index` cho các trường hay truy vấn: `email`, `phone`, `slug`.
6. Thêm `updatedAt` tự động cập nhật: `@@updatedAt` nếu cần.
7. Tạo `prisma/seed.ts` theo hướng dẫn trong `implementation-plan.md` (seed categories, products, options, admin user, vài users, coupons).

**Đầu ra:**
- Nội dung file `schema.prisma`.
- Nội dung file `seed.ts`.
- Giải thích các relation đã map đúng với ERD chưa (đối chiếu cardinality).

**Lưu ý:** Tôi sẽ tự chạy `npx prisma migrate dev` sau. Không tự động chạy lệnh.