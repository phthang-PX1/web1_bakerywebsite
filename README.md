# 🍰 WeBee Bakery - Website

Một nền tảng thương mại điện tử hiện đại được xây dựng dành riêng cho tiệm bánh. Hệ thống cung cấp trải nghiệm mua sắm toàn diện với các tính năng quản lý đơn hàng, chương trình thành viên trung thành, và quản lý sản phẩm chi tiết.

## 📋 Mục Lục

- [Tính Năng Chính](#tính-năng-chính)
- [Tech Stack](#tech-stack)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Chạy Dự Án](#chạy-dự-án)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [API Documentation](#api-documentation)
- [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
- [Đóng Góp](#đóng-góp)

---

## ✨ Tính Năng Chính

### 🛍️ Mua Sắm
- Duyệt danh mục sản phẩm bánh với bộ lọc nâng cao
- Tùy chỉnh bánh theo các tùy chọn (size, hương vị, lớp phủ)
- Giỏ hàng lưu trữ cục bộ và đồng bộ

### 👤 Xác Thực & Tài Khoản
- Đăng ký / Đăng nhập tài khoản
- OAuth với Google
- Quản lý hồ sơ cá nhân
- Quản lý địa chỉ giao hàng

### 💳 Đặt Hàng & Thanh Toán
- Quy trình thanh toán đơn giản
- Hỗ trợ chuyển khoản ngân hàng QR tĩnh
- Theo dõi trạng thái đơn hàng
- Lịch sử đơn hàng

### 🎁 Chương Trình Thành Viên
- Tích điểm từ mỗi đơn hàng
- Xếp hạng thành viên (Bronze, Silver, Gold, Diamond)
- Đánh giá và nâng cấp hạng thành viên định kỳ theo chu kỳ 6 tháng (`POST /admin/loyalty/cycles/evaluate`)
- Ưu đãi đặc biệt cho từng cấp độ

### 📦 Quản Lý Sản Phẩm
- Danh mục sản phẩm được tổ chức
- Tùy chọn sản phẩm linh hoạt
- Đánh giá và bình luận từ khách hàng
- Ảnh sản phẩm từ Cloudinary

### 📊 Hệ Thống & Bảo Mật (Production-Ready)
- Bộ theo dõi yêu cầu (Request tracking) với ID định danh và logging cấu trúc JSON
- Kiểm tra sức khỏe hệ thống theo thời gian thực (`GET /health` kiểm tra Database và Redis)
- Tự động hóa chiến lược kết nối lại Redis với exponential backoff
- Gửi thông báo và email mẫu HTML chuyên nghiệp
- Bộ kiểm thử tự động toàn diện (`npm test` với 11 kịch bản E2E integration test)
- Google Analytics 4
- Microsoft Clarity (người dùng)
- Endpoint phân tích nội bộ

---

## 🛠️ Tech Stack

### Backend
| Thành phần | Công Nghệ |
|---|---|
| **Runtime** | Node.js + TypeScript |
| **Framework** | Express.js |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Cache** | Redis (ioredis) |
| **Validation** | Zod |
| **Authentication** | JWT + Passport.js (Google OAuth) |
| **File Storage** | Cloudinary |
| **Email** | Nodemailer + Gmail SMTP |
| **SMS** | Twilio |
| **API Documentation** | Swagger |

### Frontend
| Thành phần | Công Nghệ |
|---|---|
| **Framework** | Angular 22 (Standalone Components) |
| **Styling** | SCSS |
| **HTTP Client** | Angular HttpClient |
| **Routing** | Angular Router |
| **State Management** | Signals & Services |
| **Build Tool** | Angular CLI |

---

## 💻 Yêu Cầu Hệ Thống

- **Node.js**: v18+ 
- **npm**: v10+
- **PostgreSQL**: 15+ (Supabase)
- **Redis**: 6+ 
- **Git**: 2.0+

---

## 📥 Cài Đặt

### 1. Clone Dự Án
```bash
git clone <repository-url>
cd web1_bakerywebsite
```

### 2. Cài Đặt Backend
```bash
cd backend
npm install
```

### 3. Cài Đặt Frontend
```bash
cd ../frontend
npm install
```

### 4. Cấu Hình Biến Môi Trường

#### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/webee_bakery

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Server
PORT=3000
NODE_ENV=development
```

#### Frontend (`frontend/src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 5. Khởi Tạo Cơ Sở Dữ Liệu
```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run seed
```

---

## 🚀 Chạy Dự Án

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend chạy trên: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend chạy trên: `http://localhost:4200`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Công cụ xây dựng sản phẩm trong thư mục dist/
```

---

## 📂 Cấu Trúc Dự Án

```
web1_bakerywebsite/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Khởi tạo Express app
│   │   ├── server.ts           # Server entry point
│   │   ├── config/             # Cấu hình (DB, Redis, Cloudinary)
│   │   ├── middlewares/        # Express middlewares
│   │   ├── modules/            # Modules chức năng
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── reviews/
│   │   │   ├── coupons/
│   │   │   ├── loyalty/
│   │   │   ├── analytics/
│   │   │   └── options/
│   │   ├── routes/             # Route aggregator
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utilities
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.ts             # Seed data
│   │   └── migrations/         # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.ts             # Bootstrap
│   │   ├── index.html          # HTML chính
│   │   ├── app/
│   │   │   ├── app.routes.ts   # Route config
│   │   │   ├── app.config.ts   # Angular config
│   │   │   ├── core/           # Services, interceptors
│   │   │   ├── features/       # Feature modules
│   │   │   ├── layouts/        # Layout components
│   │   │   └── shared/         # Shared components
│   │   ├── environments/       # Environment configs
│   │   └── styles.scss
│   ├── package.json
│   └── tsconfig.json
│
├── document/                   # Tài liệu chi tiết
│   ├── api_contract.md
│   ├── schema.md
│   ├── erd.md
│   ├── dfd.md
│   ├── tech_stack.md
│   └── ...
│
└── README.md                   # File này
```

---

## 📚 API Documentation

### Swagger UI
Sau khi chạy backend, truy cập API documentation tại:
```
http://localhost:3000/api-docs
```

### Các Module API Chính

#### 🔐 Authentication (`/api/auth`)
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới token
- `POST /auth/google` - Google OAuth

#### 🛍️ Products (`/api/products`)
- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/:id` - Chi tiết sản phẩm
- `POST /products` - Tạo sản phẩm (Admin)
- `PUT /products/:id` - Cập nhật sản phẩm (Admin)

#### 🛒 Cart (`/api/cart`)
- `GET /cart` - Lấy giỏ hàng
- `POST /cart/items` - Thêm vào giỏ
- `PUT /cart/items/:id` - Cập nhật sản phẩm trong giỏ
- `DELETE /cart/items/:id` - Xóa khỏi giỏ

#### 📦 Orders (`/api/orders`)
- `GET /orders` - Lấy đơn hàng của người dùng
- `POST /orders` - Tạo đơn hàng mới
- `GET /orders/:id` - Chi tiết đơn hàng
- `PUT /orders/:id/status` - Cập nhật trạng thái

#### 👤 Users (`/api/users`)
- `GET /users/profile` - Lấy hồ sơ
- `PUT /users/profile` - Cập nhật hồ sơ
- `GET /users/addresses` - Danh sách địa chỉ
- `POST /users/addresses` - Thêm địa chỉ

#### 🎁 Loyalty (`/api/loyalty`)
- `GET /loyalty/member` - Thông tin thành viên
- `GET /loyalty/points` - Lịch sử điểm
- `POST /loyalty/redeem` - Sử dụng điểm

---

## 🗄️ Cơ Sở Dữ Liệu

### ERD (Entity Relationship Diagram)
Xem chi tiết tại [document/erd.md](document/erd.md)

### Schema Prisma
Xem tại [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

### Migrations
Các migration hiện có:
- `20260615185556_init` - Schema ban đầu
- `20260618102000_add_loyalty_membership_cycles` - Thêm chu kỳ thành viên
- `20260627120000_set_membership_tier_member_default` - Đặt tier mặc định

### Seed Data
Để nhập dữ liệu mẫu:
```bash
cd backend
npm run seed
```

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## 🔄 Quy Trình CI/CD

Dự án sử dụng:
- Linting: ESLint + Prettier
- Testing: Jest (Backend), Vitest (Frontend)
- Build: TypeScript Compiler (Backend), Angular CLI (Frontend)

---

## 📖 Tài Liệu Bổ Sung

- [Tech Stack Chi Tiết](document/tech_stack.md)
- [API Contract](document/backend/api_contract.md)
- [Database Schema](document/schema.md)
- [ERD Diagram](document/erd.md)
- [DFD Diagram](document/dfd.md)
- [Quy Tắc Thành Viên Trung Thành](document/loyalty_rule.md)
- [Kế Hoạch UI/UX](document/ui_improvement_plan.md)
- [Audit Report](document/audit_report.md)

---

## 🤝 Đóng Góp

### Quy Trình
1. Fork dự án
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Tiêu Chuẩn Code
- Tuân theo cấu hình ESLint & Prettier
- Viết TypeScript với strict mode
- Bao gồm unit tests cho các tính năng mới
- Tài liệu API bằng JSDoc/Swagger comments

---

## 📝 Cấp Phép

Dự án này được phát triển cho WeBee Bakery. Vui lòng liên hệ để biết chi tiết cấp phép.

---

## 📧 Liên Hệ & Hỗ Trợ

- **Email**: support@webee-bakery.com
- **Issues**: Báo cáo lỗi tại GitHub Issues
- **Documentation**: Xem thư mục `document/`

---

## 🎯 Roadmap

- [ ] Tích hợp thanh toán trực tuyến
- [ ] Mobile app (React Native)
- [ ] Hệ thống CRM cho quản lý khách hàng
- [ ] Tính năng đặt bánh tùy chỉnh nâng cao
- [ ] AI chatbot hỗ trợ khách hàng
- [ ] Báo cáo và phân tích chi tiết hơn

---

**Cập nhật lần cuối**: 2026-06-27

Map skill → trang trong WeBee
Trang	Skill khuyến nghị
Homepage (hero, categories, featured products)	high-end-visual-design
Product list (/products)	design-taste-frontend (DENSITY=6)
Product detail (/products/:slug)	high-end-visual-design
Cart (/cart)	design-taste-frontend
Checkout (/checkout)	redesign-existing-projects → design-taste-frontend
Order tracking	design-taste-frontend
Custom cake configurator	high-end-visual-design (split-screen showcase)
Account pages (profile, orders, loyalty)	design-taste-frontend
Blog / Policies / Membership	design-taste-frontend
Admin panel	minimalist-ui (editorial, data-dense)
Bất kỳ trang nào cần code đầy đủ	Thêm full-output-enforcement vào prompt