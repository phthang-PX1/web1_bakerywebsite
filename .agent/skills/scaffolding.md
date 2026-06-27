# Skill: Tạo cấu trúc project (Phase 1)

**Ngữ cảnh:** Dự án backend WeBee, đã có file `implementation-plan.md`, `tech-stack.md`, `project-structure.md`.

**Nhiệm vụ:**
- Tạo toàn bộ cấu trúc thư mục như trong `project-structure.md`.
- Tạo `package.json` với các dependency đã liệt kê (Express, TypeScript, Prisma, Zod, JWT, bcrypt, ioredis, cloudinary, multer, nodemailer, swagger-ui-express, swagger-jsdoc, cors, morgan, passport, passport-google-oauth20).
- Tạo `tsconfig.json` với `strict: true`.
- Tạo `src/app.ts` và `src/server.ts`, có endpoint `GET /health` trả về `{status: "ok"}`.
- Tạo `src/config/env.ts` dùng Zod để validate biến môi trường (đọc từ `.env`).
- Tạo `src/middlewares/errorHandler.ts` (class AppError).
- Cấu hình CORS cho phép origin `http://localhost:4200` và domain production.
- Cài đặt `morgan` để log request.

**Đầu ra:** Liệt kê các file đã tạo và các bước thủ công tôi cần chạy (npm install, tạo file .env, chạy dev server).

**Chú ý:** Không chạy lệnh `npm install` hay `tsc` tự động; chỉ tạo nội dung file.