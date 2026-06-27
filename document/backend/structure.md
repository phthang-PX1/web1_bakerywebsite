# Cấu trúc thư mục dự án
src/
├── config/
│ ├── database.ts
│ ├── redis.ts
│ ├── cloudinary.ts
│ ├── swagger.ts
│ └── env.ts
├── middlewares/
│ ├── auth.ts
│ ├── role.ts
│ ├── validate.ts
│ └── errorHandler.ts
├── modules/
│ ├── auth/
│ ├── users/
│ ├── categories/
│ ├── products/
│ ├── options/
│ ├── cart/
│ ├── orders/
│ ├── coupons/
│ ├── reviews/
│ ├── loyalty/
│ └── analytics/
├── utils/
│ ├── email.ts
│ ├── sms.ts
│ ├── upload.ts
│ ├── jwt.ts
│ └── payment.ts
├── routes/
│ └── index.ts
├── app.ts
└── server.ts

prisma/
├── schema.prisma
└── seed.ts



## Quy ước mỗi module

Mỗi module trong `src/modules/<tên-module>/` gồm 5 file:
- `<tên-module>.routes.ts`
- `<tên-module>.controller.ts`
- `<tên-module>.service.ts`
- `<tên-module>.schema.ts` (Zod)
- `<tên-module>.types.ts`

## Quy tắc code
- Validate input bằng Zod trước controller.
- Controller chỉ gọi service, không logic nghiệp vụ.
- Lỗi throw qua `AppError(statusCode, message)`.
- Không hardcode secret, đọc từ `config/env.ts`.
- Commit theo milestone, message format: `feat(<module>): <mô tả>`.