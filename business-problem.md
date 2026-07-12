# BUSINESS PROBLEM — Vấn đề nghiệp vụ & lệch luồng Client ↔ Admin

> Tổng hợp từ review logic nghiệp vụ end-to-end (ngày 2026-07-11).
> Phạm vi: đối chiếu luồng CLIENT (khách) và ADMIN có khớp nhau về logic/dữ liệu không.
> **Đây là tài liệu vấn đề — chưa sửa.** Kế hoạch sửa lỗi kỹ thuật đợt trước ở [PLANNING.md](PLANNING.md).

Mức độ: 🔴 Cao (gãy/mất dữ liệu) · 🟠 Trung bình (bất đối xứng nghiệp vụ) · 🟡 Thấp (hiển thị/UX).

---

## A. ẢNH HƯỞNG THAO TÁC ADMIN → CLIENT (kiểm toán từng trang)

Câu hỏi: admin tạo/sửa/xóa/ẩn thứ gì đó thì **có thật sự tác động DB & client không**, hay chỉ chạy mock/localStorage.

| Trang admin | Tác động DB/client? | Ghi chú |
|---|---|---|
| products-list | ✅ CÓ | Load + toggle + delete đều gọi API thật. `MOCK_PRODUCTS` không dùng. |
| product-form | ✅ CÓ | Create/update/variants/ảnh — API thật toàn bộ. |
| product-detail | ✅ CÓ | Load + toggle status thật. |
| categories | ✅ CÓ | Create/update/toggle thật + reload. |
| coupons-list | ✅ CÓ (nhưng mất field) | Create/update/toggle thật, NHƯNG ném mất `usageLimit` + field ảo (xem C-3). |
| coupon-detail | ✅ đọc | Chỉ đọc; lịch sử dùng coupon là mock rỗng (backend chưa có API). |
| orders-list | ✅ đọc | Phân trang/lọc server thật. |
| order-detail | ✅ CÓ | Update status + confirm payment thật (nhưng xem B-2, B-3). |
| banners-list | ✅ CÓ | CRUD banner thật + reload. |
| dashboard | ⚠️ một phần | Task gắn đơn hàng thật → đổi status thật; task tĩnh chỉ localStorage. |
| reports | ⚠️ đọc | 4 thẻ tổng quan từ API thật; biểu đồ phủ overlay "chưa khả dụng" + mock. |
| loyalty | ⚠️ một phần | "Đánh giá chu kỳ" thật; **"Lưu cấu hình" chỉ localStorage** (xem D-4). |
| **customers** | ❌ KHÔNG | Mock + localStorage; backend không có `/admin/customers`. Template chỉ hiện disclaimer. |
| **customer-detail** | ❌ KHÔNG | Toàn mock, chỉ đọc, template là disclaimer. |
| **blog** | ❌ KHÔNG (DB) | `BlogService` ghi localStorage — không có API. Đồng bộ được với client Blog nhưng **chỉ trên cùng 1 trình duyệt/máy**, không lưu server. |
| **custom-cake-list** | ❌ KHÔNG | Toggle/delete nguyên liệu chỉ localStorage. |
| **custom-cake-detail** | ❌ KHÔNG | Tạo/sửa nguyên liệu chỉ localStorage. |

### Kết luận mục A
- **Nhóm quản lý bán hàng lõi (product, category, coupon, order, banner) đã tác động thật tới client.** ✅
- **Nhóm KHÔNG tác động DB/client (cần backend):** `customers`, `customer-detail`, `blog`, `custom-cake-list`, `custom-cake-detail`. Admin thao tác ở các trang này **không đến được khách hàng thật** (blog chỉ đồng bộ cục bộ 1 máy).
- **Nút giả trong trang thật:** `loyalty.saveConfig` (chỉ localStorage), `dashboard` task tĩnh.

---

## B. LUỒNG ĐƠN HÀNG & THANH TOÁN

### ✅ B-1. [ĐÃ SỬA] Hủy đơn không đối xứng — admin hủy KHÔNG hoàn `loyaltyPointsUsed`
**Sửa:** Thêm helper `refundUsedLoyaltyPoints` (idempotent: reset `loyaltyPointsUsed=0` làm guard chống hoàn trùng). Dùng ở CẢ `cancelMyOrder` (thay block inline) lẫn nhánh cancel admin `updateAdminOrderStatus`. Hai đường hủy giờ đối xứng.

### ✅ B-2. [ĐÃ SỬA] Admin không xác nhận thanh toán được cho đơn COD
**Sửa:** Thêm endpoint admin riêng `PATCH /admin/orders/:id/payment` (auth qua role admin) + service `markOrderPaidByAdmin`. Hoạt động cho **cả cash lẫn transfer**, idempotent (đã paid → trả nguyên trạng), chặn đơn cancelled, **KHÔNG ép orderStatus**. FE `order-detail.page.ts` gọi `adminApi.markOrderPaid()` thay vì `simulatePayment`.

### ✅ B-3. [ĐÃ SỬA] Nút xác nhận thanh toán admin đi nhầm cửa webhook
**Sửa:** Cùng bản B-2 — admin không còn dùng cửa webhook (secret) nữa. `markOrderPaidByAdmin` không đụng `orderStatus` (giữ máy trạng thái độc lập). `simulatePayment` giữ lại `@deprecated` chỉ để test webhook chuyển khoản.

### ✅ B-4. [ĐÃ SỬA] soldCount không giảm khi hủy đơn đã delivered
**Sửa:** Thêm helper `revertSoldCountForOrder` (guard `soldCount >= qty` không cho âm). Gọi trong nhánh cancel admin khi `order.orderStatus === "delivered"` (trạng thái trước khi hủy). Cân bằng với lúc delivered tăng soldCount.

### ✅ B-5. [ĐÃ SỬA] Trạng thái `confirmed` không hiển thị cho khách
**Sửa:** Tracker account order-detail chuyển từ 4 → 5 bước, thêm bước riêng "Đã xác nhận" (`STATUS_TO_STEP`: pending=0, confirmed=1, processing=2, ready=3, delivered=4). Khách thấy được ngay khi admin xác nhận đơn.

### ✅ B-6. [ĐÃ SỬA] Hủy đơn non-pending ở order-tracking thất bại im lặng
**Sửa:** `cancelOrder` (order-tracking) chặn sớm khi status ≠ pending (báo lỗi rõ) và thêm nhánh `error` cho `.subscribe` → không còn thất bại im lặng.

### 🟡 B-7. Guest không tự hủy đơn được; tracking token 7 ngày < vòng đời đơn đặt trước.

---

## C. SẢN PHẨM / DANH MỤC / COUPON

### ✅ C-1. [ĐÃ SỬA] BUG: Hình ảnh danh mục admin ≠ client (KHÁCH BÁO)
**Sửa:** Tạo helper chung `core/utils/category-image.util.ts` (`getCategoryImage(slug)`) map slug → SVG đẹp `/assets/categories/*.svg` (có heuristic cho slug lạ). Cả `home.page.ts` (client) và `categories.page.ts` (admin) đều gọi helper này → hai bên hiển thị GIỐNG HỆT. Bỏ ưu tiên `imageUrl`/bộ IconAdmin ở admin (theo quyết định ưu tiên ảnh client).

---
_Mô tả gốc:_

**Gốc rễ:** cả hai phía **bỏ qua `category.imageUrl` từ DB**, dùng ảnh hardcode theo slug từ **hai bộ asset khác nhau**:
- **Client** (`home.page.ts:122-130`): tìm trong `HOME_CATEGORIES` (`home.data.ts`) theo slug → `/assets/categories/banh-*.svg`. Slug không khớp → fallback cứng `banh-gato.svg`.
- **Admin** (`categories.page.ts:119,222-230`): `category.imageUrl || getCategoryFallbackIcon()` → `/assets/IconAdmin/DanhMuc/ic-*.svg`.
- → Admin ưu tiên ảnh thật đã upload; client **không bao giờ** dùng ảnh upload, luôn hiển thị SVG minh họa cố định. Danh mục mới tạo (slug lạ) → client hiện sai (fallback gato), admin hiện icon admin.

**Hệ quả nghiệp vụ:** admin upload/đổi ảnh danh mục → **client không đổi gì**. Đây vừa là bug hiển thị, vừa là "thao tác admin không tác động client".

**Hướng sửa:** client dùng `category.imageUrl` làm nguồn chính (giống admin), chỉ fallback SVG theo slug khi thiếu ảnh. Cần thống nhất 1 nguồn ảnh.

### 🔴 C-2. isActive product/category — KHỚP TỐT ✅
Client lọc `isActive` triệt để mọi đường (list/detail/search); ẩn category = ẩn toàn bộ product con; không đặt được sản phẩm đã ẩn/xóa (dù không có stock). Không có đường rò.

### ✅ C-3. [ĐÃ SỬA MỘT PHẦN] Admin coupon ném mất `usageLimit` + field ảo
**Đã sửa (`usageLimit`):** Thêm ô "Giới hạn lượt dùng" vào form drawer + `formData.usageLimit`, đưa vào payload `submitVoucher()` (undefined khi trống = vô hạn), map từ backend + set khi create/edit. Coupon giờ tôn trọng giới hạn lượt admin nhập.
**Field ảo — [ĐÃ XỬ LÝ UI]:** Input "Đối tượng" + "Sản phẩm áp dụng" trong form nay bị **disable + gắn nhãn "(sắp có — chưa áp dụng)"** để admin biết chưa có tác dụng, không còn hiểu nhầm là đã giới hạn. Việc giới hạn coupon theo hạng/danh mục thật (cần cột DB + logic validate) vẫn để đợt sau.

### ✅ C-4. [ĐÃ SỬA] Checkout không đọc `res.valid` của coupon
**Sửa:** `validateCoupon` (`checkout.page.ts`) nay kiểm tra `res.valid`; nếu false → hiển thị `res.reason` (hết hạn/hết lượt/chưa đủ điều kiện) và không áp mã, thay vì âm thầm giảm 0đ.

### 🟡 C-5. Không có khái niệm tồn kho (stock) — bán không giới hạn số lượng (nghiệp vụ, không phải lỗ hổng active).

---

## D. TÀI KHOẢN / LOYALTY / KHÁCH HÀNG

### ✅ D-1. [ĐÃ SỬA] Admin Customers không có backend — không quản lý khách thật
**Sửa backend:** Thêm `GET /admin/customers` (list role=member, phân trang, search theo tên/email/phone, lọc isActive, kèm totalOrders + totalSpent) và `GET /admin/customers/:id` (chi tiết + 20 đơn gần nhất + stats). Service `getAdminCustomers`/`getAdminCustomerDetail` trong users module, mount `/admin/customers` ở routes/index.
**Sửa frontend:** `admin.api.ts` thêm `getCustomers`/`getCustomer` + types thật. `customers.page.ts` thay disclaimer+mock bằng bảng thật (server-side search/paging). `customer-detail.page.ts` viết lại gọi API thật, hiển thị profile + stats + đơn gần đây. Xóa toàn bộ MOCK_CUSTOMERS/MOCK_DETAIL/localStorage.

### ✅ D-2. [ĐÃ SỬA] Loyalty redeem gãy end-to-end — đổi điểm lấy voucher vô dụng
**Sửa:** Thêm cấu hình `coupon` vào `REWARD_CATALOG` (loyalty.config.ts) cho các reward giảm giá (save30/save50/percent15). Khi khách redeem, `redeemReward` (loyalty.service.ts) tạo một **Coupon THẬT** `usageLimit=1`, hạn 30 ngày, `code=voucherCode` → nhập được ngay ở checkout. Response thêm `voucher.redeemable`; FE toast phân biệt "nhập khi thanh toán" vs "xuất trình tại cửa hàng" (quà/freeship). _Không cần migration (tái dùng bảng `coupon`)._

### ✅ D-3. [ĐÃ SỬA] Lịch sử điểm hiển thị trống/sai — mismatch field
**Sửa:** Model FE `LoyaltyLog` đổi khớp row Prisma (`pointsDelta`, `reason`, `orderId`, `userId`) thay vì `points`/`description`/`type`. Template `account/loyalty.page.ts` đọc `log.reason` + `log.pointsDelta`.

### ✅ D-4. [ĐÃ SỬA — hướng UI trung thực] Admin loyalty "cấu hình" là giả
**Sửa:** Không nối config lên backend (tính năng lớn), thay vào đó làm UI không gây hiểu nhầm: (1) thêm banner cảnh báo rõ "thông số là mô tả tham khảo, giá trị thực thi cố định ở server, chỉnh chỉ lưu cục bộ"; (2) đổi thông báo `saveConfig` thành "đã lưu ghi chú cục bộ, quy tắc hệ thống không đổi"; (3) sửa mô tả "Logic xử lý" khớp hành vi BE thật (xét lại hạng mỗi kỳ theo 6 tháng, có thể lên/xuống — không "giữ hạng tối thiểu").

### ✅ D-5. [ĐÃ SỬA] Guest checkout trên tài khoản đã active → mất điểm, không có cơ chế "claim"
**Sửa:** Thêm endpoint `POST /orders/me/:id/claim` (auth) + service `claimGuestOrder`: khách đã đăng nhập chứng minh sở hữu bằng tracking token → gắn đơn guest (userId=null) vào tài khoản mình; nếu đơn đã delivered thì cộng điểm ngay. Chặn cướp đơn đã thuộc người khác, idempotent. FE `orders.api.ts` thêm `claimOrder()`.
**[ĐÃ HOÀN THIỆN UI]:** Nút "Nhận đơn này về tài khoản" đã được thêm vào order-tracking — hiện khi khách đăng nhập xem một đơn guest (userId=null) có tracking token; gọi `claimOrder()`.

### 🟡 D-6. Công thức điểm + hệ số + ngưỡng tier — KHỚP TỐT ✅ (BE ↔ admin ↔ membership.page trùng số).
### 🟡 D-7. Toàn bộ endpoint auth (OTP/activate/forgot/reset, đổi email/phone) — KHỚP ✅.
### ✅ D-8. [ĐÃ SỬA] `activateAccount` trả token nhưng client bỏ qua bắt đăng nhập lại
**Sửa:** `authApi.activate` đổi kiểu trả về `AuthResponse`; `activate.page.ts` lưu token + set user + merge cart → **tự đăng nhập** và về trang chủ, không bắt đăng nhập lại. (Phần `account/loyalty.page` không render `rewards` chỉ là dead field, redeem đã tách sang `/rewards` — không ảnh hưởng, để nguyên.)

---

## Trạng thái xử lý (cập nhật cuối)

| Mục | Trạng thái |
|---|---|
| C-1 (ảnh danh mục) | ✅ Đã sửa |
| D-2 (redeem gãy) | ✅ Đã sửa |
| D-3 (lịch sử điểm trống) | ✅ Đã sửa |
| B-2, B-3 (thanh toán COD) | ✅ Đã sửa |
| C-3 (coupon usageLimit + field ảo) | ✅ Đã sửa (usageLimit hoạt động; field ảo disable + gắn nhãn) |
| D-1 (backend Customers) | ✅ Đã sửa (BE + FE thật) |
| B-1 (hủy đơn hoàn điểm tiêu) | ✅ Đã sửa |
| B-4 (soldCount) | ✅ Đã sửa |
| D-4 (loyalty config giả) | ✅ Đã sửa (UI trung thực) |
| D-5 (claim guest order) | ✅ Đã sửa (BE + FE + nút UI) |
| B-5 (hiển thị confirmed) | ✅ Đã sửa |
| B-6 (hủy im lặng) | ✅ Đã sửa |
| C-4 (đọc res.valid coupon) | ✅ Đã sửa |
| D-8 (activate tự đăng nhập) | ✅ Đã sửa |
| C-2, D-6, D-7 | ✅ Vốn đã KHỚP TỐT — không cần sửa |
| **B-7** | ⏳ **Còn lại (giới hạn thiết kế):** guest không tự hủy đơn (chỉ admin — cố ý bảo mật); tracking token 7 ngày < vòng đời đơn đặt trước. Cần quyết định nghiệp vụ nếu muốn nới. |

Các tính năng lớn để đợt sau (đã ghi trong từng mục): giới hạn coupon theo hạng/danh mục thật (C-3), nối cấu hình loyalty lên backend (D-4).
