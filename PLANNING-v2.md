# PLANNING v2 — Client bánh + Admin connect/nghiệp vụ + UI/UX

> Nguồn: yêu cầu ngày 2026-07-11 + điều tra thực tế codebase.
> **Phát hiện then chốt:** phần lớn trang admin ĐÃ nối API thật. Cảm giác "chưa connect"
> đến từ: (a) 2 endpoint admin trả `HttpErrorResponse` (orders + analytics overview),
> (b) mock/overlay che biểu đồ, (c) lỗi bị **nuốt im lặng** (chỉ `console.error`),
> (d) vài mismatch nhỏ. Chỉ **Blog** thực sự thiếu backend.
>
> Ký hiệu: `[ ]` chưa · `[~]` đang · `[x]` xong · `[!]` deferred

---

## PHASE 0 — Chẩn đoán lỗi thật ✅ HOÀN THÀNH (2026-07-11)

Đã dựng backend (DB Supabase remote + Redis Upstash) và test trực tiếp bằng curl.

### Kết quả kiểm tra
- [x] **0.1** Backend chạy OK, `/health` = 200 (DB + Redis đều ok). Seed có sẵn admin: `admin@webee.vn` / `Admin@123`, role `admin`, isActive true.
- [x] **0.2** Login admin → 200, token payload có `"role":"admin"`. **KHÔNG phải lỗi role/seed.**
- [x] **0.3** Gọi 2 endpoint "đang fail" với token admin:
  - `GET /api/admin/orders` → **200**, trả 36 đơn đầy đủ.
  - `GET /api/admin/analytics/overview` → **200**, trả revenue=12.670.050, totalOrders=36, topProducts thật.
  - → **Backend hoàn toàn đúng.** Endpoint không lỗi.
- [x] **CORS**: preflight OPTIONS = 204, `Access-Control-Allow-Origin: http://localhost:4200` + `Allow-Headers: authorization` + credentials. Cross-origin GET = 200. **CORS OK.**
- [x] **Refresh flow**: login 1 lần rồi refresh ngay = 200. Đúng. (Refresh fail chỉ khi dùng token đã bị login khác ghi đè — single-session.)
- [x] **environment.ts (dev)** trỏ đúng `http://localhost:3000/api`.

### 🎯 KẾT LUẬN NGUYÊN NHÂN
Lỗi `HttpErrorResponse` (loadOrders + loadOverview) **KHÔNG ở backend** mà ở phía client, do cơ chế **token hết hạn + single-session**:

1. Access token TTL chỉ **15 phút** (`exp - iat = 900s`).
2. Backend chỉ lưu **1** `refreshTokenHash`/user (single-session). Login lại (tab khác / lần khác) → refresh token cũ trong localStorage **bị vô hiệu**.
3. Khi access token hết hạn → interceptor gọi refresh bằng token (có thể đã cũ) → nếu refresh fail → `clearTokens()` → mọi request admin ném `HttpErrorResponse` → dashboard/orders **hiển thị trống**.

Ngoài ra các trang **nuốt lỗi im lặng** (`console.error` rồi để trống) khiến hiểu nhầm "chưa connect".

### ✅ XÁC NHẬN TỪ BROWSER (sau khi đăng nhập lại)
- Network: request `overview` + `orders` = **200** (đã connect).
- Dashboard: **KPI có số thật** (tổng đơn, doanh thu). Chỉ **BIỂU ĐỒ trống** (mock/overlay vì BE chưa có API time-series).
- Console: **không có dòng đỏ**. Request "đỏ" bạn thấy ban đầu là `localhost:4200/@vite/client` (HMR của Vite, không phải API).
- → **KHÔNG có bug kết nối.** `HttpErrorResponse` trong log cũ là do **token phiên cũ hết hạn** (TTL 15 phút). Đăng nhập lại là hết.
- → "Chưa hiển thị gì" = **biểu đồ trống** = đúng hiện trạng đã biết → giải quyết ở **Phase 2** (API time-series).

### ➡️ Điều chỉnh Phase 1 (không còn phải sửa backend orders/analytics)
- Không cần sửa endpoint (chúng đúng). Thay vào đó:
  - **1.a** Tăng TTL access token hợp lý (vd 1h) HOẶC đảm bảo interceptor refresh chạy đúng trước khi kết luận lỗi. Kiểm tra `JWT_ACCESS_EXPIRES_IN` trong env.
  - **1.b** Cân nhắc refresh token đa phiên (đã note ở PLANNING gốc mục 5.3) nếu cần nhiều tab — hoặc tối thiểu: khi refresh fail thì điều hướng về login rõ ràng thay vì để trang trống.
  - **1.c** **Bỏ nuốt lỗi im lặng** (mục 1.2 cũ) — quan trọng nhất để hết cảm giác "chưa connect": khi API lỗi phải hiện toast/thông báo, không để màn hình trống.
  - **1.d** Hướng dẫn/đảm bảo: chỉ đăng nhập admin ở 1 nơi; hoặc reload sau khi token mới.

---

## PHASE 1 — Admin: sửa kết nối & bỏ nuốt lỗi ✅ HOÀN THÀNH

- [x] **1.1 Nguyên nhân gốc** (theo Phase 0): endpoint KHÔNG lỗi — do access token TTL 15 phút hết hạn. **Đã tăng `JWT_ACCESS_EXPIRES_IN` default `15m` → `1h`** (env.ts). Refresh token vẫn 7d.
- [x] **1.2 Phiên hết hạn → điều hướng login** (không để trang trống): thêm `AuthService.sessionExpired()` (dọn token + xoá user + navigate `/auth/login?returnUrl=`). Interceptor gọi `sessionExpired()` thay `clearTokens()` khi refresh fail / thiếu refresh token.
- [x] **1.3 Bỏ "nuốt lỗi im lặng"**: thêm toast báo lỗi (chỉ khi status ≠ 401, vì 401 đã được interceptor điều hướng) ở `dashboard` (loadOrders + loadOverview), `coupons` (loadVouchers), `reports` (overview). Đã rà: `product-form`, `products-list`, `order-detail`, `customers`, `product-detail` **đã có toast từ trước** — giữ nguyên. `categories.loadProducts` chỉ để đếm, không phải data chính — bỏ qua.
- [x] **1.4 Categories — mismatch slug validation**: đồng bộ regex FE `^[a-z0-9]+(?:-[a-z0-9]+)*$` khớp BE (trước đây FE lỏng hơn → slug `-` đầu/cuối/kép qua FE nhưng BE 400).
- [x] **Verify**: backend + frontend typecheck sạch, frontend build thành công.

> Kết luận: Phase 0 đã chứng minh mọi endpoint admin hoạt động; Phase 1 loại bỏ nguyên nhân "trang trống không báo" (token ngắn + nuốt lỗi). Từ giờ nếu API lỗi thật → có toast; nếu phiên hết hạn → về login rõ ràng.

---

## PHASE 2 — Admin: Dashboard & Báo cáo dùng API thật (biểu đồ chính)

Backend chưa có API time-series → thêm mới. **Quyết định: làm API thật cho biểu đồ chính.**

## ✅ HOÀN THÀNH (2026-07-11) — verify bằng curl trên port 3001, typecheck + build 2 phía sạch.

- [x] **2.1 BE: 4 endpoint analytics mới** (analytics.service/controller/routes, tái dùng `dateRangeQuerySchema`):
  - `GET /admin/analytics/revenue-trend` → `points[{date,revenue,orders}]` dùng `$queryRaw` + `generate_series` (đủ mọi ngày kể cả 0 đơn). **Verify: 200, 7 điểm liên tục.**
  - `GET /admin/analytics/order-status` → `{total, byStatus[]}`. **Verify: 200, 32 đơn/6 trạng thái.**
  - `GET /admin/analytics/category-distribution` → `{totalRevenue, byCategory[]}`. **Verify: 200, revenue theo danh mục.**
  - `GET /admin/analytics/tier-distribution` → `{total, byTier[]}`. **Verify: 200.**
- [x] **2.2 FE dashboard**: thêm computed `revenueChart` (tự tính toạ độ SVG line chart từ data thật: points/lineD/fillD/yLabels/xLabels ngày dd/MM) + `orderStatusChart` (thanh %). Gỡ overlay "chưa khả dụng"; thay khối "Trạng thái vận hành" (doughnut giao/pickup mock) bằng **"Phân bổ trạng thái đơn"** thật. Trạng thái trống thật khi kỳ không có đơn.
- [x] **2.3 FE reports**: nối `category-distribution` (donut) + `tier-distribution` (tier bars) — override `currentData().donutData`/`tierData` khi API có data. Marketing/kênh giữ overlay "chưa khả dụng" (chưa có API — không mock giả). Field ảo `stock` đã = 0 (BACKEND_GAP note sẵn).
- [x] **2.4** Export: giữ CSV client-side (không đổi).

> Ghi chú: KPI dashboard/reports (doanh thu, đơn, khách, top SP) vốn đã thật từ trước. Phase 2 bổ sung các BIỂU ĐỒ còn trống. Cần **restart backend** để endpoint mới có hiệu lực.

---

## PHASE 3 — Admin: Blog/Tin tức (tạo backend mới + upload ảnh)

Blog là trang DUY NHẤT thực sự thiếu backend (đang chạy localStorage).

- [x] **3.1 BE schema**: thêm model `BlogPost` + migration `20260711130000_add_blog_posts`. **Đã `migrate deploy` lên DB** (kèm cả migration index Order còn treo từ đợt hardening).
- [x] **3.2 BE module `blog/`**: types/schema/service/controller/routes. Public `GET /blog`, `GET /blog/:slug` (chỉ isActive). Admin `GET/POST/PUT/PATCH status/DELETE` với `upload.fields(coverImage + galleryImages)` + Cloudinary folder `webee/blog` + auth/role. Mount `/blog` + `/admin/blog`.
- [x] **3.3 FE admin blog**: `coverImage` text→**file upload + preview**; thêm input file `galleryImages`; thêm field `category`; submit qua **FormData** (`admin.api` `createBlogPost/updateBlogPost/toggle/delete`); bỏ banner cảnh báo. Nội dung tách đoạn theo dòng trống → mảng.
- [x] **3.4 FE client blog**: `BlogService` + `BlogApi` gọi `/blog`; `blog-list`/`blog-detail` đọc từ API thay hằng số `BLOG_POSTS` (sửa bug admin sửa mà client không đổi).
- [x] **Verify runtime**: dựng BE test → tạo/list/get-by-slug/delete blog qua API đều 200; slug tự sinh, content parse mảng, readingTime tự tính. Public list phản ánh bài đã tạo.

- [x] **3.5 Seed dữ liệu blog**: bảng `blog_posts` ban đầu RỖNG nên client không thấy bài nào (không phải lỗi code). Thêm `prisma/seed-blog.ts` (idempotent, KHÔNG xóa data khác) + script `npm run seed:blog`. Đã seed 3 bài từ `BLOG_POSTS`. Verify: `/blog` trả 3 bài, `/blog/:slug` trả chi tiết.

✅ Backend port 3000 đã tự reload bản mới (tsx watch): overview + revenue-trend + /blog đều 200. Client blog chỉ cần **reload trang** là thấy 3 bài.

---

## PHASE 4 — Admin: các trang còn lại (xác nhận đã thật)

- [x] **4.1 Products (thêm sản phẩm)**: verify `GET /admin/products` 200 + upload file/multipart đúng (đã kiểm ở Phase 0). Sửa nuốt lỗi `saveVariants` + `createOptionGroup` → toast báo rõ "sản phẩm đã lưu nhưng biến thể/kích cỡ chưa lưu" thay vì im lặng.
- [x] **4.2 Orders list**: verify `GET /admin/orders` 200, order detail có `items`/`cardType`/`loyaltyPointsUsed`. Hoạt động thật.
- [x] **4.3 Voucher**: verify `GET /admin/coupons` 200, trả `usedCount`/`usageLimit` thật (MEMBER15 usedCount=3/150). Hoạt động thật.
- [x] **4.4 Tích điểm**: logic BE đã kiểm tra ĐÚNG (công thức/tier/credit/revoke/redeem→coupon idempotent). `tier-distribution` 200 (49 khách). Customers list trả `totalOrders`/`totalSpent`, detail trả `recentOrders` — verify 200. **Không đổi logic** (đúng theo nghiệm thu). 2 điểm nghiệp vụ đã note (freeship reward không giảm tiền thật; config admin chỉ localStorage) giữ nguyên.

> Kết luận Phase 4: mọi endpoint admin (products/orders/coupons/customers/categories/analytics) verify **200 + data thật**. Chỉ sửa 1 chỗ nuốt lỗi ở product-form. Không có trang admin nào "chưa connect".

---

## PHASE 5 — Client: Trang chi tiết sản phẩm

- [x] **5.1 Lọc option chỉ "nhân" + "topping"**: tách util chung `core/utils/option-display.util.ts` (`optionKindFromName`, `getOptionImage`). Product-detail render `fillingGroups` + `toppingGroups`. Nhóm ẩn (size/kem phủ) auto-chọn item đầu tiên (`autoSelectHiddenGroups`) để giá đúng + qua ràng buộc required. `canAddToCart` giữ đúng.
- [x] **5.2 Ảnh option dùng asset**: `optionImage(item)` = `getOptionImage(item.name)` (asset theo tên), thay `item.imageUrl`. Custom-cake cũng refactor dùng chung util (bỏ code trùng).
- [x] **5.3 Hai nút**: "Thêm vào giỏ" thu nhỏ (`--compact`) + "Mua ngay" nổi bật bên cạnh (`.product-actions`). `buyNow()` = add/replace item → `router.navigate(['/checkout'])`.
- [x] **5.4 Thiệp chúc mừng**: GIỮ nguyên cơ chế giỏ→checkout. "Mua ngay" vẫn qua `/checkout` nên bước điền thiệp không bị phá.
- [x] **Verify**: typecheck + build FE sạch.

---

## PHASE 6 — Client: Trang tùy chỉnh bánh

- [x] **6.1 Preview theo option**: `previewImageUrl` chọn ảnh asset của lựa chọn theo ưu tiên nhân→kem→topping (`getOptionImage`), fallback ảnh sản phẩm — phản ánh đúng lựa chọn thay vì xoay theo số lượng.
- [x] **6.2 Hai nút**: "Thêm vào giỏ" thu nhỏ (`--compact`, →/cart) + "Mua ngay" (→/checkout). Tách helper `addSelectedToCart`.
- [x] **6.3 Thiệp chúc mừng**: giữ nguyên cơ chế hiện tại.
- [x] **Verify**: typecheck + build FE sạch.

---

## PHASE 6.5 — Admin "Quản lý thành phần" (thành phần dùng chung) ✅

Nhu cầu: trang admin quản lý các option (nhân/topping/kích cỡ/kem phủ) mà client dùng khi tùy chỉnh bánh. Quyết định: **thành phần DÙNG CHUNG toàn hệ thống** (không thuộc 1 sản phẩm), giá 1 `extraPrice`/item, giữ cả option riêng theo product cũ.

- [x] **BE schema**: `OptionGroup.productId` → nullable (null = dùng chung). Migration `20260712100000_option_group_shared` (đổi cột NOT NULL→nullable + FK) đã `migrate deploy`.
- [x] **BE endpoints**: `GET /options/shared` (client, item active), `GET /admin/option-groups` (list admin, kèm item ẩn), `POST /admin/option-groups` (tạo group dùng chung). Tái dùng CRUD group/item sẵn có. Mount `/options`.
- [x] **FE client**: `optionsApi.getSharedOptions()`; custom-cake `loadCustomCake` gộp **shared + option riêng** của product (forkJoin). Model `OptionGroup.productId` → nullable.
- [x] **FE admin**: viết lại `custom-cake-list.page.ts` thành trang "Quản lý thành phần" thật — accordion nhóm + CRUD item (upload ảnh file), gọi `adminApi` (getSharedOptionGroups/createSharedOptionGroup/update/delete/createOptionItem/updateOptionItem/toggle). Bỏ mock localStorage + xóa `custom-cake-detail` + route detail. Thêm sidebar "Quản lý thành phần" → `/admin/custom-cake`.
- [x] **Verify**: typecheck + build 2 phía sạch.

⚠️ **BẮT BUỘC restart backend**: Prisma client runtime đang là bản cũ (16/06, engine bị khoá do server chạy suốt) nên endpoint thành phần dùng chung (productId=null) báo lỗi. Trước khi `npm run dev`: **tắt server → `npx prisma generate` → `npm run dev`**. Sau đó tạo vài nhóm/thành phần ở trang admin để client custom-cake hiển thị.

---

## PHASE 7 — UI/UX Admin ✅ (cải tiến, không đại tu — theo skill "improve the existing design")

Nguyên tắc: giữ nguyên nhận diện/màu/font/component/cấu trúc; chỉ sửa chỗ gây khó dùng/thiếu nhất quán; ưu tiên thay đổi ít gây xáo trộn nhất.

- [x] **7.1 Chuẩn hóa status badge**: thêm util `core/utils/admin-status.util.ts` (nhãn + màu đơn hàng; nhãn/màu active-ẩn dùng chung). orders-list + order-detail bỏ code lặp, dùng util. customer-detail: bảng đơn hiển thị badge trạng thái + mã `WB-xxxx` thay vì `orderStatus` thô.
- [x] **7.2 Ẩn thông tin kỹ thuật cho người quản lý**: coupon-detail bỏ hàng "ID ưu đãi" (UUID); categories bỏ cột slug khỏi bảng (giữ trong form). (product-detail/product-form slug: để lại — ít ảnh hưởng, tránh xáo trộn.)
- [x] **7.3 Ảnh = upload file**: khảo sát xác nhận TẤT CẢ form ảnh đã dùng upload file (blog/banner/product/category/thành phần). Không còn ô nhập URL. Không cần sửa.
- [x] **7.4 Bảng gọn hơn**: coupons-list gỡ 2 cột "Đối tượng"/"Áp dụng danh mục" (hệ thống chưa hỗ trợ — chính panel đánh dấu "sắp có"), 10→8 cột. Sửa colspan empty state cho khớp.
- [x] **7.5 Bỏ số giả + empty state ngôn ngữ nghiệp vụ**: coupon-detail bỏ `usedCount || 2` + fallback ngày '2026-01-01'. Đổi các empty state lộ chữ "Backend/API" (coupon-detail, dashboard, reports) sang ngôn ngữ nghiệp vụ ("Chưa có... được ghi nhận", "Tính năng đang được hoàn thiện").
- [x] **7.6 Giảm nút primary cạnh tranh**: loyalty header — nút "Lưu cấu hình" (đen) chỉ hiện khi đang chỉnh sửa (trước đó luôn hiện + disabled cạnh 2 nút khác). View mode còn 1 primary "Đánh giá chu kỳ".
- [x] **Verify**: typecheck + build FE sạch.

> Chủ ý KHÔNG làm (theo "least disruption"): đại tu đồng bộ page header hàng loạt (nhiều trang header đã ổn, ép về 1 kiểu rủi ro vỡ layout); dashboard/reports layout giữ nguyên (đã dùng data thật ở Phase 2). Có thể làm sau nếu cần.

---

## Thứ tự thực thi
0 → 1 → (2, 3 song song được) → 4 (verify) → 5 → 6 → 7 (UI cuối, khi data đã thật).

## Nguyên tắc
- Mỗi phase: build/typecheck 2 phía trước khi qua phase sau.
- Backend đổi schema (blog) → cần migration + có thể seed.
- Không commit trừ khi được yêu cầu.
- Verify bằng chạy thật (đặc biệt Phase 0), không chỉ typecheck.
