# Kế hoạch triển khai Backend — Webee

Bắt buộc tuân thủ: Nếu có thay đổi gì trong kế hoạch hay khác so với các tài liệu (trừ mấy cái nhỏ nhỏ như fix), vui lòng hỏi và đề xuất cập nhật các tài liêu liên quan để được đồng bộ
---

## PHASE 0 — Setup môi trường & kết nối công cụ bên thứ ba

Mục tiêu: có đầy đủ tài khoản, API key, connection string trước khi code dòng nào.

| # | Việc cần làm | Ghi chú |
|---|---|---|
| 1 | Tạo repo Git (GitHub/GitLab) | Nhánh `main` + `dev`, bật branch protection cho `main` |
| 2 | Cài Node.js LTS + npm/pnpm | Khuyến nghị pnpm để cài nhanh hơn |
| 3 | Tạo database PostgreSQL | Dùng cloud free tier: **Supabase** — lấy connection string |
| 4 | Tạo Redis instance | **Upstash** (free tier, REST + TCP) |
| 5 | Tạo tài khoản Cloudinary | Lấy `cloud_name`, `api_key`, `api_secret` |
| 6 | Tạo Google Cloud Project | Bật Google OAuth Consent Screen + tạo OAuth Client ID/Secret, khai báo redirect URI |
| 7 | Tạo App Password Gmail | Cho Nodemailer SMTP (cần bật 2FA trước) |
| 8 | Tạo tài khoản Twilio | Lấy `Account SID`, `Auth Token`, số điện thoại trial |
| 9 | Đăng ký VNPay Sandbox | Lấy `TMN Code`, `Hash Secret`, URL sandbox |
| 10 | Tạo file `.env.example` | Liệt kê toàn bộ biến môi trường cần thiết (không chứa giá trị thật) |

**Output của Phase 0:** một file `.env` (local, không commit) chứa toàn bộ secret/connection string ở trên.

---

## PHASE 1 — Project Scaffolding

| # | Việc cần làm |
|---|---|
| 1 | `npm init` + cài TypeScript, ts-node-dev, Express |
| 2 | Cấu hình `tsconfig.json` (strict mode bật) |
| 3 | Tạo cấu trúc thư mục chuẩn (xem dưới) |
| 4 | Cài Prisma, chạy `prisma init` |
| 5 | Viết schema Prisma dựa trên ERD đã thống nhất (14 bảng + relations + enums) |
| 6 | Setup Redis client (`ioredis`) |
| 7 | Setup Cloudinary SDK |
| 8 | Setup middleware: `errorHandler`, `validate` (Zod), `auth` (JWT), `role` |
| 9 | Setup CORS cho phép origin Angular (`localhost:4200` + production domain) |
| 10 | Setup Swagger (`swagger-ui-express` + `swagger-jsdoc`) tại route `/api-docs` |
| 11 | Setup logging cơ bản (`morgan` cho dev) |
| 12 | Viết `app.ts` + `server.ts` khởi động server, test `GET /health` trả 200 |

### Cấu trúc thư mục

```
src/
├── config/
│   ├── database.ts
│   ├── redis.ts
│   ├── cloudinary.ts
│   ├── swagger.ts
│   └── env.ts
├── middlewares/
│   ├── auth.ts
│   ├── role.ts
│   ├── validate.ts
│   └── errorHandler.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── categories/
│   ├── products/
│   ├── options/
│   ├── cart/
│   ├── orders/
│   ├── coupons/
│   ├── reviews/
│   ├── loyalty/
│   └── analytics/
├── utils/
│   ├── email.ts
│   ├── sms.ts
│   ├── upload.ts
│   ├── jwt.ts
│   └── payment.ts
├── routes/
│   └── index.ts
├── app.ts
└── server.ts

prisma/
├── schema.prisma
└── seed.ts
```

### Quy ước mỗi module (áp dụng cho mọi module trong `modules/`)

```
modules/<ten-module>/
├── <ten-module>.routes.ts
├── <ten-module>.controller.ts
├── <ten-module>.service.ts
├── <ten-module>.schema.ts     # Zod schema validate
└── <ten-module>.types.ts
```

**Checkpoint Phase 1:** server chạy được, kết nối DB + Redis thành công, Swagger UI hiển thị tại `/api-docs` (dù chưa có endpoint nào).

---

## PHASE 2 — Database & Seed Data

| # | Việc cần làm |
|---|---|
| 1 | Chạy `prisma migrate dev` tạo schema lần đầu |
| 2 | Viết `prisma/seed.ts`: 3-5 categories, 10-15 products (dùng `picsum.photos` / `placehold.co` cho image_url), mỗi product 2-3 option_groups + option_items |
| 3 | Seed 1 admin account (role=admin, is_active=true) |
| 4 | Seed 2-3 user mẫu (1 active, 1 inactive để test flow account-on-checkout) |
| 5 | Seed 1-2 coupon mẫu (1 percent, 1 fixed) |
| 6 | Chạy `prisma db seed`, kiểm tra dữ liệu qua Prisma Studio (`npx prisma studio`) |

**Checkpoint Phase 2:** mở Prisma Studio thấy đủ dữ liệu mẫu, sẵn sàng để build và test API ngay.

---

## PHASE 3 — Roadmap xây dựng API (theo thứ tự dependency)

> Tài liệu API spec chi tiết: dùng file markdown riêng bạn đã/sẽ tạo. Mỗi mục dưới đây là 1 "milestone" — sau khi xong, test bằng Swagger UI hoặc Postman trước khi sang milestone tiếp theo.

| Milestone | Module | Phụ thuộc | Test bằng |
|---|---|---|---|
| M1 | Auth (register, login, refresh, activate, forgot/reset password) | Users table | Swagger — tạo account, login lấy token |
| M2 | Users (profile, addresses, avatar) | M1 | Token từ M1 |
| M3 | Categories (public + admin CRUD) | — | Swagger |
| M4 | Products (public list/detail + admin CRUD + images) | M3, Cloudinary | Swagger |
| M5 | Options (option_groups + option_items) | M4 | Swagger |
| M6 | Cart (Redis-based) | M4, M5, Redis | Swagger, kiểm tra TTL key trong Redis |
| M7 | Coupons (validate + admin CRUD) | — | Swagger |
| M8 | Orders (tạo đơn hàng, sinh QR động Sepay, webhook thanh toán, admin confirm fallback) | M6, M7, Sepay (QR + webhook), Email/SMS | **Quan trọng nhất** — test luồng: tạo đơn → nhận QR → dùng ngrok expose webhook → mô phỏng thanh toán (hoặc dùng nút "Gọi lại webhook" trên Sepay) → kiểm tra order được cập nhật `payment_status='paid'`, `order_status='confirmed'`; FE polling thành công |
| M9 | Reviews | M8 (cần order_status=delivered) | Update order thủ công trong Prisma Studio để test |
| M10 | Loyalty (internal credit endpoint) | M8 | Trigger qua M8 khi order được đánh dấu delivered |
| M11 | Analytics batch endpoint + admin reports | M8, M10 | Postman gửi batch event |

**Ghi chú M8:**
- Không còn endpoint `/orders/:id/payment` hay webhook VNPay.
- Thay bằng: tạo QR động ngay khi tạo đơn, dùng webhook Sepay để cập nhật thanh toán.
- Cần dùng **ngrok** khi test local để Sepay gọi được webhook.
- Có endpoint admin confirm fallback để xử lý khi webhook lỗi.

**Quy tắc khi làm mỗi milestone với Agent:**
1. Đưa đúng phần API spec của module đó (copy đoạn liên quan từ file markdown API)
2. Yêu cầu Agent tạo đủ 4 file theo cấu trúc module chuẩn
3. Review code trước khi chạy
4. Test từng endpoint qua Swagger trước khi commit
5. Commit riêng theo từng milestone (`feat: auth module`, `feat: products module`...)

---

## PHASE 4 — Tích hợp bên thứ ba (chi tiết)

| Bên thứ ba | Tích hợp ở module nào | Lưu ý |
|---|---|---|
| Google OAuth (Passport.js) | Auth | Redirect flow: FE → Backend `/auth/google/redirect` → Google → Backend `/auth/google/callback` → redirect FE kèm token |
| Cloudinary | Products, Options, Users (avatar), Reviews | Dùng `multer` để nhận file, sau đó upload buffer lên Cloudinary |
| Nodemailer (Gmail SMTP) | Auth, Orders | Dùng template HTML đơn giản cho email kích hoạt/reset/xác nhận đơn |
| Twilio SMS | Auth, Orders | Chỉ kích hoạt khi `users.email` null và `users.phone` có giá trị |
| Sepay (QR động + webhook) | Orders | Tạo QR động qua URL qr.sepay.vn. Nhận webhook tại POST /webhooks/sepay, xác thực bằng API Key. Lưu giao dịch vào bảng transactions, chống duplicate. Cập nhật đơn hàng. |
| GA4 + Clarity | Không thuộc backend | Nhúng script ở Angular `index.html`, không cần code backend |

**Checkpoint Phase 4:** mỗi tích hợp có 1 test case độc lập (vd: gửi thử 1 email, upload thử 1 ảnh, tạo thử 1 URL thanh toán sandbox) trước khi gắn vào luồng chính ở Phase 3.

---

## PHASE 5 — Testing

| Loại test | Công cụ | Phạm vi |
|---|---|---|
| Manual API test | Swagger UI / Postman | Mọi endpoint, theo từng milestone Phase 3 |
| Unit test (tùy chọn, khuyến nghị cho logic phức tạp) | Jest | Service layer: tính giá đơn, validate coupon, tính điểm loyalty |
| Integration test (tùy chọn) | Jest + Supertest | Luồng `POST /orders` end-to-end với DB test riêng |
| Postman Collection | Postman | Export collection cho từng module, dùng làm regression test thủ công |

> Với người mới, **ưu tiên manual test qua Swagger** ở mọi milestone. Unit/integration test có thể thêm sau khi MVP chạy ổn.

---

## PHASE 6 — Deployment

| # | Việc cần làm | Công cụ đề xuất |
|---|---|---|
| 1 | Build production (`tsc` compile TS → JS) | — |
| 2 | Deploy backend | **Render** hoặc **Railway** (free tier, dễ setup cho Node.js) |
| 3 | Database | Neon/Supabase (đã setup ở Phase 0, dùng luôn cho production hoặc tạo project riêng) |
| 4 | Redis | Upstash (đã setup ở Phase 0) |
| 5 | Cấu hình biến môi trường trên platform deploy | Copy từ `.env`, **không commit file `.env`** |
| 6 | Cấu hình CORS cho domain Angular production | Whitelist domain thật |
| 7 | Cập nhật Google OAuth redirect URI + VNPay return URL sang domain production | |
| 8 | Chạy `prisma migrate deploy` trên production DB | |
| 9 | (Tùy chọn) CI/CD đơn giản với GitHub Actions: tự động deploy khi push `main` | |
| 10 | Verify Swagger UI production hoạt động, test 1 luồng đầy đủ (đăng ký → đặt hàng → thanh toán sandbox) | |

**Checkpoint Phase 6:** Angular frontend gọi được API production, luồng checkout chạy end-to-end trên môi trường thật.

---

## PHASE 7 — Sau khi deploy

| # | Việc cần làm |
|---|---|
| 1 | Theo dõi log lỗi (platform deploy thường có log viewer tích hợp sẵn) |
| 2 | Setup uptime monitor miễn phí (vd: UptimeRobot) cho endpoint `/health` |
| 3 | Định kỳ kiểm tra Twilio trial balance, VNPay sandbox vẫn hoạt động |
| 4 | Cập nhật tài liệu API markdown nếu có thay đổi endpoint |

---
