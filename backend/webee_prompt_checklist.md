# 📋 WeBee — Checklist Hướng dẫn Flow & Prompt cho từng Phase

> **Tổng quan dự án:** WeBee là website thương mại điện tử bán bánh với tính năng customize bánh cho khách hàng (chọn kích cỡ, kem phủ, topping, v.v.). Mục tiêu: triển khai MVP.
>
> **Tech Stack:** Node.js + TypeScript + Express + Prisma + PostgreSQL (Supabase) + Redis + Zod | Frontend: Angular
>
> **Quy tắc vàng khi làm việc với AI:**
> - Luôn đính kèm tài liệu tham chiếu vào đầu prompt (ERD, API spec, implementation-plan)
> - Không để AI tự ý chạy `npm install`, `prisma migrate`, `git commit`
> - Nếu AI đề xuất thay đổi ERD/API spec → hỏi lại và cập nhật tài liệu trước
> - Sau mỗi milestone → test thủ công bằng Swagger trước khi commit

---

## 🗂️ MỤC LỤC NHANH

| Phase | Nội dung | Số lượng task |
|-------|----------|---------------|
| [Phase 0](#phase-0--setup-môi-trường--kết-nối-bên-thứ-ba) | Setup môi trường & API keys | 10 tasks |
| [Phase 1](#phase-1--project-scaffolding) | Tạo khung project backend | 12 tasks |
| [Phase 2](#phase-2--database--seed-data) | Prisma schema + Seed data | 6 tasks |
| [Phase 3](#phase-3--xây-dựng-api-theo-milestone) | Xây dựng 11 module API | 11 milestones |
| [Phase 4](#phase-4--tích-hợp-bên-thứ-ba) | Google OAuth, Cloudinary, Email, SMS, Sepay | 5 tích hợp |
| [Phase 5](#phase-5--testing) | Testing toàn bộ API | 4 loại |
| [Phase 6](#phase-6--deployment) | Deploy lên production | 10 tasks |

---

## PHASE 0 — Setup Môi Trường & Kết Nối Bên Thứ Ba

> **Mục tiêu:** Có đầy đủ tài khoản, API key, connection string trước khi code dòng nào.
> **Skill:** `skill-setup-env.md`

### ✅ Checklist thủ công (bạn tự làm, không cần AI):

- [ ] **1. Tạo repo Git** — Tạo repo trên GitHub/GitLab, tạo 2 nhánh: `main` và `dev`. Bật branch protection cho `main`.
- [ ] **2. Cài Node.js LTS** — Tải từ nodejs.org, cài thêm pnpm: `npm install -g pnpm`
- [ ] **3. Đăng ký Supabase** — Vào supabase.com → New project → Lấy connection string (Settings → Database → Connection string → URI mode)
- [ ] **4. Đăng ký Upstash Redis** — Vào upstash.com → Create Database → Lấy `UPSTASH_REDIS_REST_URL` và `REDIS_URL`
- [ ] **5. Đăng ký Cloudinary** — Vào cloudinary.com → Dashboard → Lấy `cloud_name`, `api_key`, `api_secret`
- [ ] **6. Tạo Google Cloud Project** — console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client ID → Khai báo redirect URI: `http://localhost:3000/auth/google/callback`
- [ ] **7. Tạo Gmail App Password** — Bật 2FA trên tài khoản Gmail → Security → App Passwords → Tạo mới → Copy password
- [ ] **8. Đăng ký Twilio** — twilio.com → Lấy `Account SID`, `Auth Token`, số điện thoại trial (bắt đầu bằng +1...)
- [ ] **9. Đăng ký SePay** — my.sepay.vn → Tích hợp Webhooks → Thêm Webhooks → Chọn tài khoản ngân hàng → Điền URL webhook → Copy API Key
- [ ] **10. Tạo file `.env`** — Copy từ `.env.example`, điền tất cả giá trị thật vào

### 🤖 Prompt gợi ý cho Phase 0:

```
Ngữ cảnh: Dự án backend WeBee (Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis).
Tham khảo: backend/skill/skill-setup-env.md, backend/document/tech-stack.md

Nhiệm vụ: Đọc skill-setup-env.md và liệt kê CHECKLIST CHI TIẾT từng bước để tôi có được
toàn bộ các biến môi trường trong .env.example (Supabase, Upstash, Cloudinary, 
Google OAuth, Gmail App Password, Twilio, SePay).

Đầu ra mong đợi:
- Checklist dạng đánh dấu được (checkbox)
- Mỗi bước có link đăng ký + mô tả ngắn nơi tìm thông tin
- KHÔNG hỏi tôi về secret, chỉ hướng dẫn cách lấy
```

---

## PHASE 1 — Project Scaffolding

> **Mục tiêu:** Server chạy được, kết nối DB + Redis thành công, Swagger UI hiển thị tại `/api-docs`
> **Skill:** `skill-scaffolding.md`

### ✅ Checklist:

- [ ] **1.** npm init + cài TypeScript, ts-node-dev, Express
- [ ] **2.** Cấu hình `tsconfig.json` (strict mode bật)
- [ ] **3.** Tạo cấu trúc thư mục chuẩn (11 module trong `src/modules/`)
- [ ] **4.** Cài Prisma, chạy `prisma init`
- [ ] **5.** Setup Redis client (`ioredis`)
- [ ] **6.** Setup Cloudinary SDK
- [ ] **7.** Setup middleware: `errorHandler`, `validate` (Zod), `auth` (JWT), `role`
- [ ] **8.** Setup CORS (cho phép `localhost:4200` + production domain)
- [ ] **9.** Setup Swagger tại route `/api-docs`
- [ ] **10.** Setup logging (`morgan` cho dev)
- [ ] **11.** Viết `app.ts` + `server.ts`
- [ ] **12.** Test endpoint `GET /health` trả về 200

### 🤖 Prompt cho Phase 1:

```
Ngữ cảnh: Dự án backend WeBee — Node.js + TypeScript + Express + Prisma + Zod + Redis.
Tham khảo: backend/skill/skill-scaffolding.md, backend/document/project-structure.md, backend/document/tech-stack.md

Nhiệm vụ: Tạo toàn bộ khung project theo skill-scaffolding.md:
- package.json với đủ dependencies (Express, TypeScript, Prisma, Zod, JWT, bcrypt, ioredis, 
  cloudinary, multer, nodemailer, swagger-ui-express, swagger-jsdoc, cors, morgan, 
  passport, passport-google-oauth20)
- tsconfig.json strict mode
- Cấu trúc thư mục theo project-structure.md
- src/app.ts + src/server.ts có GET /health trả {status: "ok"}
- src/config/env.ts dùng Zod validate biến môi trường
- src/middlewares/errorHandler.ts (class AppError)
- CORS cho localhost:4200

Đầu ra: Liệt kê file đã tạo + các lệnh thủ công TÔI cần chạy (npm install, tạo .env, dev server).
Không tự chạy lệnh nào.
```

### 🔖 Checkpoint Phase 1:
> Server chạy, `GET /health` → 200, mở `http://localhost:3000/api-docs` thấy Swagger UI

---

## PHASE 2 — Database & Seed Data

> **Mục tiêu:** Mở Prisma Studio thấy đủ dữ liệu mẫu, sẵn sàng test API ngay.

### ✅ Checklist:

- [ ] **1.** Tạo file `prisma/schema.prisma` từ ERD (15 bảng, đúng relations)
- [ ] **2.** Chạy `prisma migrate dev` tạo schema lần đầu *(tự làm)*
- [ ] **3.** Viết `prisma/seed.ts`: 3-5 categories, 10-15 products, mỗi product 2-3 option_groups + option_items
- [ ] **4.** Seed 1 admin account (`role=admin`, `is_active=true`)
- [ ] **5.** Seed 2-3 user mẫu (1 active, 1 inactive)
- [ ] **6.** Seed 1-2 coupon mẫu (1 percent, 1 fixed)
- [ ] **Chạy:** `npx prisma db seed` *(tự làm)*, mở `npx prisma studio` kiểm tra

### 🤖 Prompt A — Tạo Prisma Schema:

```
Ngữ cảnh: Dự án backend WeBee.
Tham khảo: backend/document/erd.md (15 bảng, relations, enums).

Nhiệm vụ theo skill-prisma-schema.md:
1. Đọc erd.md và tạo prisma/schema.prisma đầy đủ:
   - Đúng tên bảng, kiểu dữ liệu, PK (UUID dùng @default(uuid()))
   - Chuyển ENUM sang enum Prisma
   - Định nghĩa đúng relations 1-N, 0-1 với @relation
   - Thêm @@index cho: email, phone, slug
   - Thêm @updatedAt cho trường updatedAt
2. Sau đó đối chiếu lại với ERD: kiểm tra đủ 17 relations chưa

Đầu ra: Nội dung schema.prisma. Giải thích các relation đã map đúng ERD chưa.
Lưu ý: Tôi sẽ tự chạy `npx prisma migrate dev`. Không tự động chạy lệnh.
```

### 🤖 Prompt B — Tạo Seed Data:

```
Ngữ cảnh: Đã có prisma/schema.prisma hoàn chỉnh cho dự án WeBee.
Tham khảo: backend/document/erd.md, backend/document/implementation-plan.md (Phase 2).

Nhiệm vụ: Tạo file prisma/seed.ts với dữ liệu mẫu:
- 3-5 categories (bánh kem, bánh mì, cupcake...)
- 10-15 products mỗi cái có thumbnail_url dùng picsum.photos, có is_customizable=true cho ít nhất 5 sản phẩm
- Mỗi customizable product: 2-3 option_groups (Kích cỡ, Kem phủ, Topping) + option_items tương ứng
- 1 admin user: role=admin, is_active=true, email: admin@webee.vn, password: Admin@123
- 2 user mẫu: 1 active (member), 1 inactive (để test flow kích hoạt)
- 1 coupon percent (WELCOME10 = 10%) + 1 coupon fixed (SAVE50K = giảm 50.000đ, đơn tối thiểu 200k)

Đầu ra: Nội dung seed.ts hoàn chỉnh, có thể chạy bằng `npx prisma db seed`.
```

### 🔖 Checkpoint Phase 2:
> `npx prisma studio` → thấy đủ data, đặc biệt kiểm tra bảng `option_groups` và `option_items`

---

## PHASE 3 — Xây dựng API theo Milestone

> **Quy trình bắt buộc cho mỗi milestone:**
> 1. Copy đúng phần API spec của module vào prompt
> 2. Yêu cầu tạo đủ 5 file theo chuẩn module
> 3. Review code trước khi chạy
> 4. Test từng endpoint qua Swagger
> 5. Commit riêng từng milestone

### 🤖 Template prompt chung cho mọi module:

```
Ngữ cảnh: Dự án backend WeBee. Đã có scaffold, Prisma schema, seed data.
Tham khảo: backend/skill/skill-module.md, backend/document/api.md (phần MODULE: [TÊN MODULE])
Quy tắc code: backend/skill-agent-rules.md

Nhiệm vụ: Tạo module [TÊN MODULE] theo skill-module.md.
[DÁN NỘI DUNG PHẦN API SPEC CỦA MODULE ĐÓ TỪ api.md VÀO ĐÂY]

Tạo 5 file trong src/modules/[tên-module]/:
- [tên].routes.ts (gán middleware auth, role, validate đúng theo Auth column trong API spec)
- [tên].controller.ts (chỉ gọi service, không business logic)
- [tên].service.ts (implement logic theo cột "Logic end-to-end" trong API spec)
- [tên].schema.ts (Zod schema cho body, params, query)
- [tên].types.ts (interface export)

Đầu ra:
- Nội dung 5 file
- Danh sách endpoint đã tạo (method + path)
- Giải thích ngắn logic end-to-end mỗi endpoint
- Request mẫu test qua Swagger
Lưu ý: Không thêm endpoint ngoài API spec. Nếu chưa rõ, hỏi trước.
```

---

### M1 — Module: AUTH

**Phụ thuộc:** Users table đã có trong DB
**Endpoints:** register, login, activate, forgot/reset password, refresh, logout, Google OAuth

#### 🤖 Prompt đặc biệt M1:

```
[Dùng template chung ở trên]

Thêm lưu ý quan trọng cho module Auth:
- Hash password bằng bcrypt (salt rounds = 12)
- JWT: access token 15 phút, refresh token 7 ngày
- Lưu refresh_token_hash vào DB (không lưu raw token)
- Endpoint activate/reset password dùng JWT token riêng (không phải access token)
- Google OAuth: dùng Passport.js, flow redirect FE → BE /auth/google → Google → BE /auth/google/callback → redirect FE kèm token
- Kiểm tra is_active=true khi login — nếu false, trả lỗi 403
```

- [ ] M1 hoàn thành
- [ ] Test: Đăng ký → nhận email → activate → login → nhận access + refresh token

---

### M2 — Module: USERS

**Phụ thuộc:** M1 (cần token)
**Endpoints:** profile, avatar, password, addresses, loyalty

#### 🤖 Prompt đặc biệt M2:

```
[Dùng template chung]

Lưu ý:
- Avatar upload: dùng multer nhận file → upload buffer lên Cloudinary → lưu URL vào DB
- Địa chỉ: khi set is_default=true → reset tất cả địa chỉ khác của user về false trước
- Loyalty: chỉ đọc, không có endpoint chỉnh sửa điểm ở đây (sẽ có ở M10)
```

- [ ] M2 hoàn thành
- [ ] Test: Update profile, upload avatar, thêm/sửa/xóa địa chỉ, xem điểm loyalty

---

### M3 — Module: CATEGORIES

**Phụ thuộc:** Không
**Endpoints:** Public list/detail, Admin CRUD

- [ ] M3 hoàn thành
- [ ] Test: GET /categories → thấy danh mục từ seed. Admin: tạo/sửa/ẩn danh mục

---

### M4 — Module: PRODUCTS

**Phụ thuộc:** M3 (categories), Cloudinary
**Endpoints:** Public list/detail/reviews, Admin CRUD + images

#### 🤖 Prompt đặc biệt M4:

```
[Dùng template chung]

Lưu ý:
- GET /products: hỗ trợ query params: category (slug), search, min_price, max_price, sort (price_asc, price_desc, newest, rating), page, limit
- GET /products/:slug: join product_images, option_groups, option_items → trả về kèm avg_rating
- Admin upload ảnh: multer → Cloudinary → insert product_images
- is_customizable: true nếu product có option_groups
```

- [ ] M4 hoàn thành
- [ ] Test: GET /products?category=banh-kem&sort=price_asc → danh sách có pagination

---

### M5 — Module: OPTIONS (Customize Bánh)

**Phụ thuộc:** M4
**Endpoints:** Public lấy options theo product, Admin CRUD option_groups + option_items

> ⚠️ **Đây là module cốt lõi của tính năng customize bánh!**

#### 🤖 Prompt đặc biệt M5:

```
[Dùng template chung]

Đặc biệt quan trọng — đây là module tùy chỉnh bánh:
- GET /products/:id/options: trả về cây dữ liệu:
  [{ group_id, name, is_required, is_multiple, items: [{item_id, name, extra_price, image_url}] }]
- Khi FE render trang customize bánh, dùng response này để build UI chọn tùy chọn
- Admin có thể ẩn/hiện từng option_item (is_active toggle)
- Khi xóa option_group: kiểm tra không có order đang dùng option_items của group đó
```

- [ ] M5 hoàn thành
- [ ] Test: GET /products/:id/options → thấy cây nhóm-tùy chọn đúng format

---

### M6 — Module: CART (Redis-based)

**Phụ thuộc:** M4, M5, Redis
**Endpoints:** get, add item, update quantity, delete item, clear, merge

#### 🤖 Prompt đặc biệt M6:

```
[Dùng template chung]

Lưu ý kỹ về cách lưu cart trong Redis:
- Key: cart:{session_id} cho guest, cart:{user_id} cho member (TTL: 7 ngày)
- Value: JSON array các cart items, mỗi item gồm: {cartItemId, product_id, quantity, option_item_ids[], unit_price, item_total}
- Khi GET /cart: tính lại tổng tiền theo giá DB hiện tại (đề phòng giá sản phẩm thay đổi)
- POST /cart/merge: merge giỏ guest vào giỏ member, không trùng lặp product+options
- session_id lấy từ cookie, user_id từ JWT nếu đã đăng nhập

Sau khi tạo module, liệt kê key Redis mẫu để tôi kiểm tra bằng redis-cli.
```

- [ ] M6 hoàn thành
- [ ] Test: Thêm bánh + options vào giỏ, kiểm tra TTL key trong Redis

---

### M7 — Module: COUPONS

**Phụ thuộc:** Không
**Endpoints:** validate coupon (Public), Admin CRUD

- [ ] M7 hoàn thành
- [ ] Test: POST /coupons/validate với code WELCOME10 + order_value 300000 → tính được discount

---

### M8 — Module: ORDERS ⭐ QUAN TRỌNG NHẤT

**Phụ thuộc:** M6, M7, SePay, Email/SMS
**Endpoints:** tạo đơn, lịch sử, chi tiết (polling), hủy, webhook SePay, admin confirm fallback, admin list/detail/update-status

> ⚠️ **Cần ngrok để test webhook local!** Cài ngrok, chạy `ngrok http 3000`, lấy URL public và cập nhật webhook URL tạm thời trên my.sepay.vn

#### 🤖 Prompt đặc biệt M8:

```
Ngữ cảnh: Dự án WeBee. Đây là module QUAN TRỌNG NHẤT.
Tham khảo: backend/document/api.md (MODULE: ORDERS), backend/skill/skill-payment-sepay.md
Quy tắc: backend/skill-agent-rules.md

Đọc KỸ skill-payment-sepay.md TRƯỚC khi code module Orders.

Điểm quan trọng cần implement đúng:
1. POST /orders:
   - Lấy giỏ từ Redis → validate coupon → tính subtotal/discount/shipping/total
   - Insert orders + order_items + order_item_options (snapshot tên + giá tại thời điểm đặt)
   - Xóa giỏ Redis sau khi tạo đơn thành công
   - Tạo QR URL: https://qr.sepay.vn/img?acc={ACCOUNT}&bank={BANK}&amount={total}&des=DH{order_id}&template=compact
   - Nếu email/phone chưa có tài khoản active: tạo user is_active=false
   - Gửi email/SMS xác nhận đơn + QR code
   - Trả về: order_id, tóm tắt đơn, payment_qr_url

2. POST /webhooks/sepay (QUAN TRỌNG):
   - Xác thực header: Authorization: Apikey {SEPAY_API_KEY}
   - Kiểm tra transferType='in'
   - Chống duplicate: kiểm tra sepay_transaction_id trong bảng transactions
   - Lưu vào bảng transactions
   - Dùng regex /DH(\w+)/ trích xuất order_id từ transaction_content
   - Tìm order có total_amount = amount_in, payment_status='pending'
   - Cập nhật payment_status='paid', order_status='confirmed', sepay_transaction_id
   - Trả về 200 ngay (không để SePay timeout)

3. GET /orders/me/:id: FE polling mỗi 2-3 giây để phát hiện payment_status='paid'

Tạo đủ 5 file + tích hợp route vào index.ts.
```

#### 🤖 Prompt test M8 với ngrok:

```
Tôi cần test luồng thanh toán Sepay local với ngrok.
URL ngrok của tôi là: [ĐIỀN URL NGROK VÀO ĐÂY]

Hãy hướng dẫn tôi:
1. Cập nhật webhook URL trên my.sepay.vn tạm thời sang URL ngrok
2. Tạo đơn test qua Swagger (request body mẫu hoàn chỉnh)
3. Mô phỏng webhook SePay gửi về (curl command mẫu)
4. Kiểm tra order được cập nhật đúng trong DB
5. Kiểm tra FE polling phát hiện payment_status='paid'
```

- [ ] M8 hoàn thành
- [ ] Test đầy đủ: Tạo đơn → thấy QR → webhook → order cập nhật → polling FE nhận được

---

### M9 — Module: REVIEWS

**Phụ thuộc:** M8 (cần order_status=delivered)

> 💡 Tip: Dùng Prisma Studio cập nhật thủ công 1 order sang status=delivered để test

#### 🤖 Prompt M9:

```
[Dùng template chung]

Lưu ý:
- Kiểm tra: order_item thuộc về user đang gửi review
- Kiểm tra: order status = 'delivered' (nếu không → 403)
- Kiểm tra: order_item chưa có review nào (nếu có rồi → 409)
- Sau khi insert review: tính lại avg_rating cho product (round 2 decimal)
  → UPDATE products SET avg_rating = (SELECT AVG(rating) FROM reviews JOIN order_items...)
- Upload ảnh review: multer → Cloudinary (optional field)
```

- [ ] M9 hoàn thành
- [ ] Test: Thêm review → kiểm tra avg_rating trên product cập nhật

---

### M10 — Module: LOYALTY

**Phụ thuộc:** M8 (trigger khi order delivered)
**Endpoints:** Internal /internal/loyalty/credit

#### 🤖 Prompt M10:

```
[Dùng template chung]

Đây là internal endpoint, chỉ được gọi từ module Orders (khi admin đổi status sang delivered).

Logic cộng điểm:
- 1.000đ = 1 điểm (làm tròn xuống)
- Insert loyalty_logs (points_delta dương, reason='order_delivered')
- Update users.loyalty_points += points_delta
- Kiểm tra ngưỡng nâng hạng:
  * Bronze → Silver: 500 điểm
  * Silver → Gold: 2000 điểm
- Nếu đủ ngưỡng → update membership_tier

Lưu ý: Module Orders gọi endpoint này ở PATCH /admin/orders/:id/status khi status='delivered'.
```

- [ ] M10 hoàn thành

---

### M11 — Module: ANALYTICS

**Phụ thuộc:** M8, M10
**Endpoints:** batch events (Public), admin overview, admin behavior, admin customers

#### 🤖 Prompt M11:

```
[Dùng template chung]

Lưu ý:
- POST /analytics/events/batch: nhận mảng tối đa 20 events → bulk insert → 204 No Content
  (Angular gọi mỗi 10s hoặc khi đủ 20 events, dùng navigator.sendBeacon khi đóng tab)
- GET /admin/analytics/overview: nhận query params date_from, date_to
  → tổng hợp: tổng doanh thu, số đơn, số khách mới, top 5 sản phẩm bán chạy
- GET /admin/analytics/behavior: group analytics_events theo event_type, page_url, utm_source
- GET /admin/customers: join users + orders → thông tin, hạng, điểm, số đơn
```

- [ ] M11 hoàn thành

---

## PHASE 4 — Tích Hợp Bên Thứ Ba

> **Quy trình:** Tạo test endpoint độc lập → test OK → gắn vào module chính
> **Skill:** `skill-integration.md`

### 🤖 Prompt template cho mỗi tích hợp:

```
Ngữ cảnh: Dự án WeBee backend, đã có scaffold hoàn chỉnh.
Tham khảo: backend/skill/skill-integration.md, backend/document/implementation-plan.md (Phase 4)

Tích hợp: [TÊN DỊCH VỤ]
Module sẽ dùng: [TÊN MODULE]

Nhiệm vụ:
1. Tạo file src/utils/[tên].ts với các hàm tiện ích
2. Thêm biến môi trường vào src/config/env.ts nếu chưa có
3. Tạo endpoint test riêng: [POST /test/tên-dịch-vụ]
4. Giải thích luồng gọi API của dịch vụ
5. Sau khi tôi xác nhận test OK → hướng dẫn gắn vào module thật
```

### ✅ Checklist tích hợp:

- [ ] **Google OAuth (Passport.js)** — Module: Auth
  - Flow: FE → BE `/auth/google/redirect` → Google → BE `/auth/google/callback` → redirect FE kèm token trong query param

- [ ] **Cloudinary** — Module: Products, Users (avatar), Reviews
  - Dùng `multer` nhận file → upload buffer → lấy URL → lưu DB

- [ ] **Nodemailer (Gmail SMTP)** — Module: Auth, Orders
  - Email kích hoạt tài khoản, reset password, xác nhận đơn (kèm QR code SePay)

- [ ] **Twilio SMS** — Module: Auth, Orders
  - Chỉ kích hoạt khi user có `phone` nhưng không có `email`

- [ ] **SePay QR + Webhook** — Module: Orders
  - Đã covered trong M8. Nhớ dùng ngrok khi test local.

---

## PHASE 5 — Testing

### ✅ Checklist testing:

- [ ] **Manual test qua Swagger UI** — Test từng endpoint sau mỗi milestone *(ưu tiên cao nhất)*
- [ ] **Postman Collection** — Export collection cho từng module làm regression test
- [ ] **Unit test (optional)** — Jest: service layer tính giá đơn, validate coupon, tính điểm loyalty
- [ ] **Integration test (optional)** — Jest + Supertest: luồng POST /orders end-to-end

### 🤖 Prompt debug khi gặp lỗi:

```
Dùng skill: backend/skill/skill-debug.md

Tôi gặp lỗi khi gọi [METHOD] [ENDPOINT]:

Request body/params:
[DÁN REQUEST VÀO ĐÂY]

Response lỗi:
[DÁN RESPONSE/LOG VÀO ĐÂY]

Nhiệm vụ của bạn:
1. Đọc các file liên quan: [tên-module].routes.ts, controller.ts, service.ts, schema.ts
2. Xác định nguyên nhân (validation, logic, DB, middleware?)
3. Giải thích nguyên nhân rõ ràng
4. ĐỀ XUẤT cách sửa — KHÔNG tự sửa, chờ tôi xác nhận
```

### 🤖 Prompt review & commit sau mỗi milestone:

```
Dùng skill: backend/skill/skill-review-commit.md

Tôi vừa hoàn thành module [TÊN MODULE].

Nhiệm vụ:
1. Tổng hợp các file đã tạo/sửa
2. Tóm tắt logic chính các endpoint
3. Chỉ ra edge cases cần test kỹ
4. Đề xuất commit message theo format: feat(<module>): <mô tả>
5. Liệt kê các bước tôi cần làm trước khi commit (lint, test, migration check)
```

---

## PHASE 6 — Deployment

> **Mục tiêu:** Angular frontend gọi được API production, luồng checkout chạy end-to-end

### ✅ Checklist deployment:

- [ ] **1.** Build TypeScript: `npx tsc` → kiểm tra không có lỗi compile
- [ ] **2.** Deploy backend lên **Render** hoặc **Railway** (free tier)
- [ ] **3.** Cấu hình biến môi trường trên platform (copy từ `.env`, KHÔNG commit file `.env`)
- [ ] **4.** Cấu hình CORS whitelist domain Angular production
- [ ] **5.** Cập nhật Google OAuth redirect URI sang domain production
- [ ] **6.** Cập nhật webhook URL SePay sang domain production
- [ ] **7.** Chạy `prisma migrate deploy` trên production DB
- [ ] **8.** Verify Swagger UI production hoạt động: `https://yourdomain.com/api-docs`
- [ ] **9.** Test 1 luồng đầy đủ: đăng ký → đặt hàng → thanh toán → nhận xác nhận
- [ ] **10.** (Optional) Setup GitHub Actions CI/CD: auto deploy khi push `main`

### 🤖 Prompt deployment:

```
Ngữ cảnh: Backend WeBee hoàn chỉnh, cần deploy lên Render/Railway.
Tham khảo: backend/document/implementation-plan.md (Phase 6)

Nhiệm vụ: Hướng dẫn chi tiết từng bước deploy backend Node.js + TypeScript lên [RENDER/RAILWAY]:
1. Cấu hình build command (tsc) và start command
2. Cách set biến môi trường trên platform
3. Cách chạy prisma migrate deploy (không phải migrate dev)
4. Cập nhật CORS, Google OAuth redirect URI, SePay webhook URL cho production
5. Cách verify deployment thành công

Đầu ra: Checklist thủ công từng bước theo thứ tự.
```

---

## PHASE 7 — Sau Khi Deploy (Monitoring)

### ✅ Checklist post-deploy:

- [ ] Setup **UptimeRobot** (free) monitor endpoint `GET /health` mỗi 5 phút
- [ ] Kiểm tra log lỗi định kỳ trên platform dashboard (Render/Railway)
- [ ] Theo dõi Twilio trial balance (hết balance sẽ không gửi được SMS)
- [ ] Cập nhật tài liệu `api.md` nếu có thay đổi endpoint
- [ ] Backup DB định kỳ (Supabase có auto backup)

---

## 📌 BẢNG TÓM TẮT QUICK REFERENCE

### Các tài liệu cần đính kèm vào prompt:

| Khi làm gì | Đính kèm tài liệu |
|------------|-------------------|
| Setup môi trường | `skill-setup-env.md`, `tech-stack.md` |
| Scaffolding project | `skill-scaffolding.md`, `project-structure.md` |
| Prisma schema | `erd.md` + `skill-prisma-schema.md` |
| Bất kỳ module nào | `skill-module.md` + đoạn API spec tương ứng từ `api.md` + `skill-agent-rules.md` |
| Module Orders | Thêm: `skill-payment-sepay.md` |
| Tích hợp 3rd-party | `skill-integration.md` |
| Debug lỗi | `skill-debug.md` + files của module lỗi |
| Review & commit | `skill-review-commit.md` |

### Thứ tự dependency giữa các module:

```
M3 (Categories) → M4 (Products) → M5 (Options) → M6 (Cart) → M8 (Orders)
M1 (Auth) → M2 (Users)                                           ↓
M7 (Coupons) ─────────────────────────────────────────────────→ M8
                                                                  ↓
M9 (Reviews) ←──────────────── M8 (order_status=delivered) ──→ M10 (Loyalty)
                                                                  ↓
                                                               M11 (Analytics)
```

### Flow tùy chỉnh bánh (Customize Flow) — Điểm cốt lõi MVP:

```
1. Khách vào trang product detail (is_customizable=true)
2. FE gọi GET /products/:id/options → nhận cây option_groups + option_items
3. Khách chọn: Kích cỡ (required) + Kem phủ (required) + Topping (multiple, optional)
4. FE tính realtime: base_price + Σ(extra_price của các item đã chọn)
5. Khách nhấn "Thêm vào giỏ" → POST /cart/items (gửi kèm option_item_ids[])
6. Giỏ hàng lưu Redis với snapshot giá
7. Checkout → POST /orders → sinh QR SePay → hiển thị QR
8. Khách chuyển khoản → SePay webhook → order updated → FE polling nhận paid
```

---

> **Ghi chú cuối:** Luôn test checkpoint của từng phase trước khi sang phase tiếp theo.
> Commit theo từng milestone với message format: `feat(<module>): <mô tả ngắn>`
