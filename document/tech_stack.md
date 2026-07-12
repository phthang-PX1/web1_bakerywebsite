## Tech Stack tổng hợp

> Phiên bản lấy từ `backend/package.json` và `frontend/package.json` (cập nhật khi nâng cấp deps).

### Backend
| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Runtime / Ngôn ngữ | Node.js + TypeScript | Node 20+ · TS ^5.8 |
| Framework | Express.js | ^4.21 |
| Database | PostgreSQL (Supabase) | 15+ |
| ORM | Prisma (`@prisma/client`) | ^6.10 |
| Cache / Cart | Redis (`ioredis`) | ^5.6 |
| Validation | Zod | ^3.25 |
| Auth | JWT (`jsonwebtoken`) + Passport (Google OAuth) | jwt ^9 · passport ^0.7 |
| Mã hóa mật khẩu | bcrypt | ^6.0 |
| File Storage / Upload | Cloudinary + Multer | cloudinary ^2.7 · multer ^2.0 |
| Email | Nodemailer + Gmail SMTP | ^6.10 |
| SMS | Twilio (gọi REST API trực tiếp qua `fetch`, không dùng SDK) | — |
| Payment | QR chuyển khoản ngân hàng (ảnh tĩnh, không cổng thanh toán) | — |
| Bảo mật HTTP | Helmet + CORS + express-rate-limit | helmet ^8 · rate-limit ^8 |
| Logging | Morgan + logger JSON nội bộ | morgan ^1.10 |
| API Docs | Swagger (`swagger-jsdoc` + `swagger-ui-express`) tại `/api-docs` | — |

### Frontend
| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Angular (Standalone Components) | ^22.0 |
| Ngôn ngữ | TypeScript | ~6.0 |
| State | Angular Signals + Services | — |
| HTTP | Angular HttpClient + Interceptors | — |
| Reactive | RxJS | ~7.8 |
| Styling | SCSS | — |
| Build | Angular CLI | ^22.0 |

### Analytics & Deploy
| Thành phần | Công nghệ |
|---|---|
| Analytics | GA4 + Microsoft Clarity (client-side) + endpoint batch nội bộ (`/analytics`) |
| Frontend host | Vercel (SPA rewrite + CSP headers, xem `vercel.json`) |
| Backend host | Render (`webee-backend.onrender.com`) |
