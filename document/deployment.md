# 🚀 Hướng Dẫn Triển Khai Production (Deployment Guide) — WeBee Bakery

Tài liệu này hướng dẫn chi tiết quy trình đưa hệ thống **WeBee Bakery** (Backend Node.js/Express + Frontend Angular 19/22) lên môi trường máy chủ sản xuất (Production).

---

## 📋 1. Yêu Cầu Hệ Thống (System Requirements)

- **OS**: Ubuntu 22.04 LTS / Debian 11+ / Windows Server
- **Node.js**: v20.x hoặc v22.x (LTS)
- **Database**: PostgreSQL v15+
- **Cache**: Redis v7+
- **Process Manager**: PM2 hoặc Docker / Docker Compose
- **Web Server / Reverse Proxy**: Nginx hoặc Caddy

---

## 🔧 2. Cấu Hình Biến Môi Trường (Environment Variables)

### 2.1. Backend (`backend/.env`)

Tạo file `.env` tại thư mục `backend/` với các cấu hình chuẩn cho production:

```env
# Server Config
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://webee.vn,https://admin.webee.vn

# Database (PostgreSQL with Connection Pooling)
DATABASE_URL="postgresql://user:password@localhost:5432/webee_prod?schema=public&connection_limit=20&pool_timeout=10"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Security & JWT
JWT_ACCESS_SECRET="your-super-strong-access-secret-key-production"
JWT_REFRESH_SECRET="your-super-strong-refresh-secret-key-production"
SESSION_SECRET="your-session-secret-key-production"

# Email Service (SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="no-reply@webee.vn"
EMAIL_PASS="your-app-password"

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 2.2. Frontend (`frontend/src/environments/environment.ts`)

Đảm bảo file `environment.ts` (production) chỉ định đúng URL API:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.webee.vn/api',
  siteUrl: 'https://webee.vn'
};
```

---

## 🏗️ 3. Quy Trình Build & Triển Khai (Build & Deploy Flow)

### 3.1. Chuẩn bị Cơ Sở Dữ Liệu & Migration (Backend)

```bash
cd backend
npm ci
# Chạy migration để cập nhật schema mới nhất lên DB Production
npx prisma migrate deploy

# (Tùy chọn) Nạp dữ liệu seed ban đầu nếu là môi trường mới
npm run seed

# Build TypeScript sang JavaScript (thư mục dist/)
npm run build
```

### 3.2. Build Giao Diện Khách Hàng (Frontend)

```bash
cd ../frontend
npm ci
# Build production bundle với tối ưu hóa và tree-shaking
npm run build -- --configuration production
```
Sản phẩm build sẽ nằm tại `frontend/dist/webee-frontend/browser/`.

---

## 🏃‍♂️ 4. Quản Lý Tiến Trình với PM2 (Process Management)

Để đảm bảo Backend hoạt động liên tục (zero-downtime reload, tự động khởi động lại khi crash):

```bash
# Cài đặt PM2 toàn cục
npm install -g pm2

# Khởi chạy Backend với PM2
cd backend
pm2 start dist/src/server.js --name "webee-api" --max-memory-restart 500M --env production

# Lưu cấu hình PM2 để tự khởi động cùng hệ điều hành
pm2 save
pm2 startup
```

---

## 🌐 5. Cấu Hình Nginx Reverse Proxy & SSL

Tạo file cấu hình `/etc/nginx/sites-available/webee.vn`:

```nginx
server {
    listen 80;
    server_name webee.vn www.webee.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name webee.vn www.webee.vn;

    ssl_certificate /etc/letsencrypt/live/webee.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webee.vn/privkey.pem;

    # Phục vụ file tĩnh Frontend Angular
    root /var/www/webee/frontend/dist/webee-frontend/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy API Requests tới Backend Node.js
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

---

## 🧪 6. Kiểm Tra Sức Khỏe & Giám Sát (Health Check & Monitoring)

### 6.1. Kiểm tra Health Endpoint
Sau khi triển khai, kiểm tra API Health Check để xác nhận kết nối Database và Redis:
```bash
curl https://api.webee.vn/health
```
**Kết quả mong đợi (HTTP 200):**
```json
{
  "status": "ok",
  "database": { "status": "ok", "latencyMs": 2 },
  "redis": { "status": "ok", "latencyMs": 1 },
  "timestamp": "2026-07-05T20:50:00.000Z"
}
```

### 6.2. Chạy Bộ Kiểm Thử Tự Động (Automated Smoke Test)
Trên môi trường Staging/Production, có thể chạy trực tiếp bộ test tự động để xác nhận toàn bộ luồng mua hàng và thanh toán:
```bash
cd backend
npm test
```

---

## 🔒 7. Bảo Mật & Danh Sách Kiểm Tra Khắc Phục Sự Cố (Troubleshooting Checklist)

1. **CORS & Cookies**: Đảm bảo `allowedOrigins` trong `env.ts` chứa đầy đủ tên miền Frontend (cả HTTP và HTTPS).
2. **Rate Limiting**: Đã bật giới hạn 30 request/15 phút cho `/api/auth` và 300 request/15 phút cho `/api`.
3. **Quản lý Kết Nối DB**: Prisma được cấu hình `connection_limit=20` trong `DATABASE_URL` để tránh lỗi *Too many clients already*.
4. **Redis Reconnection**: Nếu Redis tạm thời mất kết nối, hệ thống tự động thử lại với chiến lược Exponential Backoff và ghi log lỗi cấu trúc JSON mà không làm sập ứng dụng.
