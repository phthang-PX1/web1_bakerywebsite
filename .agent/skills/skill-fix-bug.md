# Skill: Fix lỗi toàn stack (Frontend + Backend)

## Khi nào dùng

Khi gặp lỗi trên một trang cụ thể — lỗi console, lỗi network (4xx/5xx), dữ liệu hiển thị sai, UI bị vỡ, hoặc luồng không hoạt động đúng. Skill này yêu cầu đọc đồng thời code frontend **và** backend liên quan trước khi đề xuất fix.

---

## Thông tin cần cung cấp

Khi dùng skill này, hãy cung cấp:
1. **Tên trang** bị lỗi (ví dụ: trang checkout, trang chi tiết đơn hàng, trang đăng nhập)
2. **Mô tả lỗi** — console error, network tab (status + response), hoặc mô tả hành vi sai
3. **Bước tái hiện** (nếu có) — ví dụ: "click nút Đặt hàng sau khi điền form"
4. **Môi trường** — development hay production

---

## Nhiệm vụ của Agent

### Bước 1 — Đọc code Frontend

Với trang bị lỗi, đọc theo thứ tự:

| Loại file | Vị trí |
|---|---|
| Page component | `frontend/src/app/features/<feature>/pages/<page>.page.ts` |
| Page template | `frontend/src/app/features/<feature>/pages/<page>.page.html` |
| API service | `frontend/src/app/core/api/<module>.api.ts` |
| Data models | `frontend/src/app/core/models/<model>.model.ts` |
| Auth interceptor | `frontend/src/app/core/interceptors/auth.interceptor.ts` |
| Route guard (nếu trang có guard) | `frontend/src/app/core/guards/auth.guard.ts` hoặc `admin.guard.ts` |
| Shared components được dùng | `frontend/src/app/shared/components/<component>/` |
| Auth/Cart service (nếu liên quan) | `frontend/src/app/core/services/auth.service.ts` hoặc `cart.service.ts` |

**Lưu ý đặc biệt:**
- Trang cart/checkout: kiểm tra `withCredentials: true` trong mọi HTTP call của CartApi
- Trang account: kiểm tra `authGuard` đã được apply trong `app.routes.ts`
- Trang admin: kiểm tra `adminGuard` + `AdminApi` endpoint path

### Bước 2 — Đọc code Backend

Xác định module backend mà trang đó gọi API, sau đó đọc:

| File | Vai trò |
|---|---|
| `backend/src/modules/<module>/<module>.routes.ts` | HTTP method, path, middleware |
| `backend/src/modules/<module>/<module>.controller.ts` | Request handling, gọi service |
| `backend/src/modules/<module>/<module>.service.ts` | Business logic, Prisma queries |
| `backend/src/modules/<module>/<module>.schema.ts` | Zod validation — field names, types, required |
| `backend/src/modules/<module>/<module>.types.ts` | TypeScript interfaces |
| `backend/prisma/schema.prisma` | Tên bảng, tên cột, kiểu dữ liệu (nếu lỗi database) |
| `backend/src/middlewares/errorHandler.ts` | Cấu trúc response lỗi |

### Bước 3 — Chẩn đoán

Sau khi đọc xong, output theo format:

```
## Chẩn đoán

**Lớp lỗi:** Frontend / Backend / Cả hai

**Nguyên nhân gốc:**
<Giải thích rõ ràng, không dùng thuật ngữ chuyên sâu không cần thiết>

**File bị ảnh hưởng:**
- `path/to/file.ts` — lý do
- `path/to/file.ts` — lý do

**Luồng lỗi:**
<Mô tả bước nào thất bại trong chuỗi: FE gọi API → interceptor → BE route → controller → service → DB>
```

### Bước 4 — Đề xuất fix

Với mỗi file cần sửa, hiển thị:

```
### Fix: <tên file>

**Trước:**
\`\`\`typescript
// đoạn code hiện tại gây lỗi
\`\`\`

**Sau:**
\`\`\`typescript
// đoạn code đề xuất sửa
\`\`\`

**Lý do:** <giải thích ngắn tại sao thay đổi này fix được lỗi>
```

**Không sửa code trực tiếp** — chờ người dùng xác nhận từng fix trước khi apply.

### Bước 5 — Sau khi fix được xác nhận

1. Apply tất cả các thay đổi đã được xác nhận
2. Chạy `ng build --configuration development` trong thư mục `frontend/`
3. Báo cáo kết quả build: zero errors / còn lỗi nào không
4. Gợi ý dùng skill `skill-verify-feature.md` để kiểm tra chức năng đầy đủ

---

## Đầu ra

- Bản chẩn đoán rõ ràng (lớp lỗi, nguyên nhân, file liên quan)
- Các block code "Trước / Sau" cho từng file cần sửa
- Kết quả `ng build` sau khi fix

---

## Lưu ý

- Đọc **cả hai phía** FE và BE trước khi kết luận — nhiều lỗi xuất phát từ mismatch giữa tên field FE gửi lên và Zod schema BE expect
- Kiểm tra `app.routes.ts` nếu lỗi liên quan đến route không tìm thấy
- Với lỗi 401 Unauthorized: kiểm tra `auth.interceptor.ts` — logic refresh token và skip list
- Với lỗi hiển thị sai dữ liệu: kiểm tra interface model có khớp với response thực tế của BE không (field names, types)
- Với lỗi TypeScript tại build time: ưu tiên fix theo thứ tự lỗi, vì lỗi đầu thường kéo theo các lỗi sau
- Không thêm `any` để bypass lỗi TypeScript — tìm type đúng
