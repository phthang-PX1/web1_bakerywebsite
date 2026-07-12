# PLANNING — Kế hoạch sửa lỗi WeBee Bakery

> Nguồn: review toàn bộ source (frontend Angular + backend Express/Prisma) ngày 2026-07-11.
> Thứ tự ưu tiên: **runtime-breaking → tiền/coupon → contract mismatch → hardening**.
> Refresh token → HttpOnly cookie: **hoãn sang Phase 5** (theo quyết định).

Ký hiệu trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong · `[!]` bỏ qua/deferred

---

## PHASE 1 — Runtime-breaking (tính năng gãy ngay hôm nay)

Mục tiêu: khách/admin dùng được các flow đang lỗi. Rủi ro thấp, ROI cao.

- [x] **1.1 Analytics contract** — FE gửi `{eventType, payload, timestamp}` nhưng BE bắt buộc `{session_id, event_type, page_url, device_type, os, browser}` (snake_case) → mọi batch 400.
  - File FE: `frontend/src/app/core/services/analytics.service.ts`, `core/models/analytics.model.ts`, `core/api/analytics.api.ts`
  - File BE: `backend/src/modules/analytics/analytics.schema.ts`
  - Cách sửa: FE phát đúng field BE yêu cầu (session id, page url, device/os/browser, enum chung). Enum FE (`product_view/search/...`) vs BE (`click/checkout_start/...`) phải hợp nhất.
  - **Verify:** mở app, chuyển trang → Network tab thấy `POST /api/analytics/events/batch` trả 2xx.

- [x] **1.2 Analytics beacon sai origin** — `sendBeacon` dùng `window.location.origin` thay vì `environment.apiUrl` → prod bắn về host FE (không có endpoint).
  - File: `frontend/src/app/core/services/analytics.service.ts:40-42`
  - Cách sửa: build URL từ `environment.apiUrl`. (Đi kèm 1.1.)

- [x] **1.3 Coupon create 400** — Đã thêm type `AdminCouponCreateRequest` (start/end required). Ghi chú: call-site `coupons-list.page.ts:1120` đã có fallback default dates nên runtime không 400; thay đổi này siết type ở compile-time. — FE gửi `startDate/endDate` optional, BE `createCouponBodySchema` bắt buộc → admin bỏ trống là 400.
  - File FE: `frontend/src/app/core/api/admin.api.ts:83-93,215-217`
  - File BE: `backend/src/modules/coupons/coupons.schema.ts:53-54`
  - Cách sửa: làm `startDate/endDate` required ở `AdminCouponRequest` (create path) + form validate bắt buộc. **Verify:** tạo coupon từ admin thành công.

- [x] **1.4 `getMyOrders` bỏ qua filter `status`** — member lọc theo trạng thái nhưng BE trả mọi đơn.
  - File BE: `backend/src/modules/orders/orders.service.ts:545-547`
  - Cách sửa: áp `query.status` vào Prisma `where`. **Verify:** lịch sử đơn lọc đúng trạng thái.

---

## PHASE 2 — Tiền & Coupon (chính xác giao dịch)

Mục tiêu: không mất tiền / lạm dụng coupon. Cần test transaction kỹ.

- [x] **2.1 Webhook confirm sai đơn COD** — Chặn `paymentMethod !== "transfer"`, thêm đối chiếu `transfer_content` với `DH<orderId>` (optional, tương thích ngược), giữ guard idempotency (đơn không còn pending → 409). — `confirmPaymentWebhook` chỉ so số tiền, flip `paid` cho cả đơn `cash`; không idempotency.
  - File BE: `backend/src/modules/orders/orders.service.ts:689-718`
  - Cách sửa: chặn `paymentMethod !== "transfer"`; yêu cầu mã tham chiếu khớp `DH<orderId>`; guard idempotency (đơn đã `paid` thì no-op).
  - **Verify:** webhook cho đơn COD → bị từ chối; đơn transfer đúng mã → confirmed; replay → no-op.

- [x] **2.2 Coupon `usedCount` không hoàn khi hủy** — Thêm helper `releaseCouponUsage` (guard `usedCount > 0`), gọi trong cả `cancelMyOrder` và nhánh cancel của `updateAdminOrderStatus`. — hủy đơn hoàn điểm loyalty nhưng không hoàn lượt coupon.
  - File BE: `backend/src/modules/orders/orders.service.ts` (nhánh `cancelMyOrder:641`, `updateAdminOrderStatus` cancel:887)
  - Cách sửa: nếu `order.couponId` set → `coupon.update decrement usedCount` trong cùng transaction (không âm).
  - **Verify:** tạo đơn có coupon → hủy → `usedCount` giảm lại.

- [x] **2.3 Guest order gắn nhầm tài khoản + rò loyalty** — `resolveOrderUser`: nếu contact trùng tài khoản ĐÃ active → tạo đơn guest-only (userId=null), không gửi activation. Chỉ tái dùng shell account chưa active. — email/phone khách trùng user có sẵn → đơn gán vào user đó không xác thực, cộng điểm cho người lạ.
  - File BE: `backend/src/modules/orders/orders.service.ts:220-278`
  - Cách sửa: chỉ link vào user có sẵn khi đã chứng minh sở hữu (đang login / OTP đã verify); nếu không, giữ đơn guest-only.
  - **Verify:** guest checkout với email của user khác → đơn KHÔNG vào lịch sử user đó, KHÔNG cộng điểm.

- [x] **2.4 OTP dùng `Math.random()`** → đã đổi sang `crypto.randomInt(100000, 1000000)`.
  - File BE: `backend/src/modules/auth/auth.service.ts:118`

- [!] **2.5 (tùy) `clearCart` sau commit → đơn trùng** — DEFERRED sang Phase 5 (idempotency key) để không mở rộng scope đợt này.

---

## PHASE 3 — Contract mismatch FE↔BE (field undefined, endpoint thiếu)

Mục tiêu: dữ liệu hiển thị đúng, không `undefined` âm thầm.

- [x] **3.1 Coupon response** — Model `Coupon` sửa dùng đúng field BE (`usedCount`, `startDate`, `endDate`), bỏ `usageCount`/`expiresAt` legacy. Sửa `coupon-detail.page.ts:85` `expiresAt`→`endDate`.
- [x] **3.2 `Order.cardType/cardMessage`** — Thêm cả hai vào `formatOrderSummary` (BE) + type (cardType non-null theo Prisma default "none").
- [x] **3.3 `Product.updatedAt`** — Mark optional ở model (list không trả, chỉ detail có). Nới `formatDate(string|undefined)` ở product-detail.
- [x] **3.4 Admin categories chỉ thấy active** — Thêm `getAllCategories` service + `getAdminCategoriesController` + route `GET /admin/categories`. FE `admin.api.ts` gọi `/admin/categories`.
- [x] **3.5 `validate` middleware leak Zod message** — Thêm `formatZodError` dùng `flatten()`, trả field-level message gọn. **Kèm M2:** `errorHandler` guard `instanceof Error` để không nổ trên non-Error throw.

---

## PHASE 4 — State / UX frontend

- [x] **4.1 Interceptor treo request khi refresh lỗi** — Đổi `BehaviorSubject` → `Subject<boolean>` phát true/false mỗi chu kỳ; nhánh catchError refresh `next(false)` để waiter dừng thay vì treo.
- [x] **4.2 Guest cash order mất QR khi refresh** — Xác minh BE luôn trả `trackingToken` cho MỌI đơn (kể cả cash) → luồng thực tế không lỗi. Bổ sung phòng thủ: success page coi token `"undefined"`/`"null"` như không có.
- [x] **4.3 Checkout `valueChanges` thiếu `takeUntilDestroyed`** — Đã thêm `takeUntilDestroyed(destroyRef)`.
- [x] **4.4 `SessionService`** — KHÔNG xóa: được tái sử dụng làm `session_id` cho analytics (Phase 1.1). Giữ nguyên.
  - Ghi chú: `AnalyticsService.track()` hiện chưa được call-site nào gọi (dead path phía FE) — sửa contract để sẵn sàng khi dùng.

---

## PHASE 5 — Hardening / Bảo mật nâng cao (làm sau cùng)

> Đợt này chỉ làm nhóm ÍT RỦI RO (5.2, 5.6, 5.7) theo quyết định. Token/OAuth & idempotency để đợt sau.

- [!] **5.1 Refresh token → HttpOnly cookie** — DEFERRED (đợt sau).
- [x] **5.2 XSS mô tả SP** — Thêm `utils/sanitizeHtml.ts` (allowlist tối giản, không thêm dep), áp vào create/update product BE. Thêm CSP + security headers vào `vercel.json` (script-src 'self', img-src Cloudinary+data/blob, connect-src API origin, frame-ancestors 'none'...).
- [!] **5.3 Rotate refresh token** — DEFERRED (đợt sau).
- [!] **5.4 JWT_ACTION_SECRET riêng** — DEFERRED (đợt sau).
- [!] **5.5 Google OAuth linking** — DEFERRED (đợt sau).
- [x] **5.6 Thiếu index DB** — Thêm `@@index([orderStatus])`, `@@index([paymentStatus])`, `@@index([createdAt])` vào Order + migration `20260711120000_add_order_status_indexes`. ⚠️ Cần chạy `prisma migrate deploy` trên DB thật.
- [x] **5.7 `trust proxy` + body limit** — `app.set("trust proxy", 1)` + `express.json({ limit: "1mb" })`.
- [!] **5.8 Google callback tokens trong query string** — DEFERRED (đợt sau).

---

## Nguyên tắc thực thi
1. Làm tuần tự từng phase; mỗi mục xong thì tick `[x]` trong file này.
2. Mỗi thay đổi BE có transaction/tiền → chạy build/typecheck trước khi qua mục sau.
3. Không commit trừ khi được yêu cầu; báo cáo trung thực (test fail thì nói rõ).
4. Cuối mỗi phase: tóm tắt đã sửa gì + cần verify gì thủ công.
