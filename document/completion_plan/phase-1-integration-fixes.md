# Phase 1 — Sửa lỗi kết nối frontend↔backend

## Mục tiêu

Đây là các lỗi mức ưu tiên cao nhất: kiến trúc đúng nhưng điểm nối giữa frontend và backend bị lệch (sai HTTP method, sai tên field, sai enum), khiến các luồng thực tế — đăng nhập/refresh token, reset password, quản trị sản phẩm/coupon/đơn hàng — lỗi khi chạy thật dù cả hai phía code "trông" đều hợp lý riêng lẻ.

## Việc cụ thể

### 1.1 — Enum trạng thái đơn hàng sai: `delivering` (frontend) vs `ready` (backend)
- Backend enum thật: `pending, confirmed, processing, ready, delivered, cancelled` — [backend/src/modules/orders/orders.schema.ts:13-20](../../backend/src/modules/orders/orders.schema.ts#L13-L20)
- Frontend dùng `'delivering'` thay vì `'ready'` — [frontend/src/app/core/models/order.model.ts:1](../../frontend/src/app/core/models/order.model.ts#L1)
- Lan ra các map nhãn trạng thái tại:
  - `frontend/src/app/features/admin/pages/order-detail.page.ts` (STATUS_FLOW, STATUS_LABELS)
  - `frontend/src/app/features/account/pages/order-detail.page.ts`
  - `frontend/src/app/features/checkout/pages/order-tracking.page.ts`
- **Fix**: đổi `'delivering'` → `'ready'` trong `order.model.ts` và mọi map nhãn liên quan; đối chiếu nhãn tiếng Việt hiển thị cho đúng ngữ nghĩa (VD: "Sẵn sàng giao" thay vì "Đang giao").

### 1.2 — Sai HTTP method: frontend `PATCH`, backend chỉ có `PUT` cho update đầy đủ
- `AdminApi.updateProduct()` dùng `http.patch` — [frontend/src/app/core/api/admin.api.ts:63-65](../../frontend/src/app/core/api/admin.api.ts#L63-L65)
- Backend chỉ có `adminRouter.put("/:id", ...)` — [backend/src/modules/products/products.routes.ts:224](../../backend/src/modules/products/products.routes.ts#L224); PATCH chỉ tồn tại cho `/:id/status` (toggle active).
- Tương tự `AdminApi.updateCoupon()` dùng `.patch` — [frontend/src/app/core/api/admin.api.ts:97-99](../../frontend/src/app/core/api/admin.api.ts#L97-L99), backend là `PUT /admin/coupons/:id`.
- `toggleActive()` trong `frontend/src/app/features/admin/pages/products-list.page.ts:131-143` đang gọi nhầm `updateProduct` (full PUT) thay vì endpoint toggle status chuyên dụng `PATCH /:id/status`.
- **Fix**: đổi `.patch` → `.put` cho update đầy đủ trong `admin.api.ts`; thêm method riêng gọi đúng `PATCH /:id/status` cho việc chỉ đổi trạng thái, và sửa `toggleActive()` gọi method đó.

### 1.3 — Sai field name multipart khi upload ảnh sản phẩm
- Frontend: `form.append('image', file)` (số ít) — [frontend/src/app/core/api/admin.api.ts:69](../../frontend/src/app/core/api/admin.api.ts#L69)
- Backend: `upload.array("images", 10)` (số nhiều) — [backend/src/modules/products/products.routes.ts:293](../../backend/src/modules/products/products.routes.ts#L293) → multer ném `LIMIT_UNEXPECTED_FILE`, upload luôn lỗi.
- **Fix**: đổi field name thành `'images'`; cân nhắc cho phép chọn nhiều file trong UI vì backend hỗ trợ tối đa 10 ảnh/lần.

### 1.4 — Sai tên field trong order line items
- Backend `formatOrderItem()` trả về `productNameSnapshot`, `unitPriceSnapshot`, `optionNameSnapshot`, `optionPriceSnapshot` — `backend/src/modules/orders/orders.service.ts:51-81`
- Frontend `OrderItem` model khai báo `productName`, `unitPrice`, `options: {name, extraPrice}` — [frontend/src/app/core/models/order.model.ts:6-14](../../frontend/src/app/core/models/order.model.ts#L6-L14)
- Đang dùng thật tại `frontend/src/app/features/admin/pages/order-detail.page.ts:80-86` → tên sản phẩm/đơn giá/tùy chọn hiển thị `undefined`.
- **Fix**: chọn một hướng nhất quán — khuyến nghị sửa backend trả field tên gọn (`productName`, `unitPrice`, `name`, `extraPrice`) vì đây là response DTO công khai, không cần lộ hậu tố `Snapshot` (chi tiết lưu trữ nội bộ) ra ngoài; cập nhật `formatOrderItem()` và mọi nơi tiêu thụ nó trong backend, giữ nguyên frontend model.

### 1.5 — Refresh token response thiếu field, làm hỏng token lưu trữ
- Backend `refreshAccessToken()` chỉ trả `{ accessToken }` — `backend/src/modules/auth/auth.service.ts:257-262`
- Frontend `AuthTokens` mong đợi `{ accessToken, refreshToken }`; interceptor gọi `storeTokens(tokens)` ghi đè `refreshToken: undefined` vào localStorage sau mỗi lần refresh → người dùng bị đăng xuất ngoài ý muốn ở lần refresh tiếp theo.
- **Fix**: backend trả kèm refresh token hiện tại (không cần rotate nếu không có yêu cầu bảo mật đó) trong response `/auth/refresh`; đồng thời sửa `AuthService.storeTokens()` (frontend) chỉ ghi đè field nào có giá trị thật, tránh xóa nhầm dữ liệu cũ.

### 1.6 — Reset password sai tên field
- Frontend gửi `{ newPassword }` — `frontend/src/app/core/models/auth.model.ts:27-29`
- Backend `resetPasswordBodySchema` yêu cầu `{ password }` — `backend/src/modules/auth/auth.schema.ts:49-51` → Zod luôn reject 400.
- **Fix**: sửa frontend gửi đúng field `password` (giữ backend nguyên trạng vì đây là API đã ổn định).

### 1.7 — Sai path: `loyalty-logs` (frontend) vs `loyalty/logs` (backend)
- Frontend gọi `GET /users/me/loyalty-logs` — `frontend/src/app/core/api/users.api.ts:64`
- Backend route thật: `GET /users/me/loyalty/logs` — `backend/src/modules/users/users.routes.ts:266`
- **Fix**: sửa path ở frontend cho khớp.

### 1.8 — Admin "Tạo sản phẩm mới" chưa hoạt động
- `frontend/src/app/features/admin/pages/product-form.page.ts:166` — `submit()` chỉ hiện toast "đang phát triển" khi ở chế độ tạo mới (`// TODO_BACKEND`), dù backend đã có sẵn `POST /admin/products` hoàn chỉnh (multipart, `createProductBodySchema`).
- **Fix**: nối `submit()` vào `AdminApi` (thêm method `createProduct()` nếu chưa có), xử lý multipart cho ảnh ban đầu nếu cần. Đây là việc **frontend-only**, không cần chờ backend.

### 1.9 — Category chọn bằng ô nhập UUID thô
- `frontend/src/app/features/admin/pages/product-form.page.ts:49` — input text với placeholder `"category-id"`.
- **Fix**: thay bằng `<select>` load danh sách category thật qua `CategoriesApi` (đã tồn tại ở `core/api/categories.api.ts`), hiển thị tên category, submit đúng `categoryId`.

## Skill khi thực thi

- Trước khi sửa mỗi cặp: dùng `/code-review` (effort medium) trên diff liên quan để rà soát không bỏ sót call site nào còn dùng field/verb/path cũ (VD: `toggleActive()` gọi `updateProduct` gián tiếp).
- Sau khi sửa xong một cụm liên quan (VD: toàn bộ luồng auth: 1.5 + 1.6), dùng `/verify` để chạy thử end-to-end qua UI thật (không chỉ dựa vào type-check).
- Không cần `/security-review` ở phase này — các lỗi đều là lỗi chức năng, không phải lỗ hổng bảo mật.

## Definition of Done

- [ ] Đăng nhập → chờ access token hết hạn (hoặc set thời gian ngắn tạm thời để test) → refresh thành công, không bị đăng xuất.
- [ ] Forgot-password → reset-password hoạt động end-to-end qua UI thật, không còn lỗi 400.
- [ ] Admin: tạo sản phẩm mới thành công, sửa sản phẩm thành công (PUT), toggle trạng thái active thành công (PATCH), upload ảnh sản phẩm thành công.
- [ ] Admin: sửa coupon thành công (PUT).
- [ ] Admin: đổi trạng thái đơn hàng sang "ready" thành công, nhãn hiển thị đúng cả 2 phía admin/customer.
- [ ] Trang chi tiết đơn hàng admin hiển thị đúng tên sản phẩm, đơn giá, tùy chọn (không còn `undefined`).
- [ ] Trang loyalty logs của user tải được dữ liệu (không còn 404).
- [ ] Category trong form sản phẩm admin là dropdown chọn từ danh sách thật.
