# API Documentation – WeBee

> **Base URL:** `/api/v1`  
> **Auth phân loại:**  
> - `[Public]` – không cần token  
> - `[Member]` – cần JWT member  
> - `[Admin]` – cần JWT admin  
> - `[Internal]` – chỉ gọi nội bộ giữa các module  

---

## MODULE: AUTH

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| POST | `/auth/register` | Public | Đăng ký | Validate email/phone/password → kiểm tra trùng → hash password → tạo user `is_active=false` → tạo activation JWT (24h) → gửi email/SMS → trả về message |
| POST | `/auth/activate/:token` | Public | Kích hoạt tài khoản | Verify activation JWT → tìm user → set `is_active=true` → trả về access token + refresh token |
| POST | `/auth/login` | Public | Đăng nhập | Validate → tìm user theo email/phone → bcrypt.compare → kiểm tra `is_active` → tạo access token (15p) + refresh token (7 ngày) → lưu refresh token hash vào DB → trả về |
| POST | `/auth/google/redirect` | Public | Khởi động Google OAuth | Redirect sang Google consent screen (Passport.js) |
| GET | `/auth/google/callback` | Public | Google OAuth callback | Google redirect về → Passport.js lấy profile → tìm hoặc tạo user theo `google_id`/email → tạo token → redirect về Angular kèm token trong query param |
| POST | `/auth/refresh` | Public | Làm mới access token | Nhận refresh token → hash → tìm trong DB → verify chưa hết hạn → tạo access token mới → trả về |
| POST | `/auth/forgot-password` | Public | Quên mật khẩu | Nhận email/phone → tìm user → tạo reset JWT (15p) → gửi email/SMS → trả về message |
| POST | `/auth/reset-password/:token` | Public | Đặt lại mật khẩu | Verify reset JWT → hash password mới → update DB → invalidate token → trả về message |
| POST | `/auth/logout` | Member/Admin | Đăng xuất | Nhận refresh token → xóa khỏi DB → trả về message |

---

## MODULE: USERS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| GET | `/users/me` | Member | Lấy thông tin cá nhân | Lấy `user_id` từ JWT → query DB → trả về (bỏ `password_hash`) |
| PUT | `/users/me` | Member | Cập nhật hồ sơ | Validate `full_name`, `phone` → update DB → trả về user mới |
| POST | `/users/me/avatar` | Member | Upload avatar | Nhận file → upload Cloudinary → lưu URL vào DB → trả về `avatar_url` |
| PUT | `/users/me/password` | Member | Đổi mật khẩu | Verify `old_password` → hash `new_password` → update DB |
| GET | `/users/me/addresses` | Member | Danh sách địa chỉ | Query addresses theo `user_id` → trả về |
| POST | `/users/me/addresses` | Member | Thêm địa chỉ | Validate → nếu `is_default=true` thì reset các địa chỉ khác → insert DB |
| PUT | `/users/me/addresses/:id` | Member | Cập nhật địa chỉ | Kiểm tra thuộc user → update → xử lý `is_default` |
| DELETE | `/users/me/addresses/:id` | Member | Xóa địa chỉ | Kiểm tra thuộc user → xóa → nếu là default thì pick địa chỉ khác làm default |
| GET | `/users/me/loyalty` | Member | Điểm & hạng thành viên | Query user → trả về `loyalty_points`, `membership_tier` |
| GET | `/users/me/loyalty/logs` | Member | Lịch sử điểm | Query `loyalty_logs` theo `user_id` → phân trang → trả về |

---

## MODULE: CATEGORIES

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| GET | `/categories` | Public | Danh sách danh mục | Query categories `is_active=true` → trả về |
| GET | `/categories/:slug` | Public | Chi tiết danh mục | Query theo slug → trả về danh mục + danh sách sản phẩm active |
| POST | `/admin/categories` | Admin | Tạo danh mục | Validate → upload ảnh Cloudinary → insert DB |
| PUT | `/admin/categories/:id` | Admin | Cập nhật danh mục | Validate → update DB |
| PATCH | `/admin/categories/:id/status` | Admin | Ẩn/hiện danh mục | Toggle `is_active` → update DB |

---

## MODULE: PRODUCTS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| GET | `/products` | Public | Danh sách sản phẩm | Query params: `category`, `search`, `min_price`, `max_price`, `sort`, `page`, `limit` → build query động → trả về danh sách + pagination |
| GET | `/products/:slug` | Public | Chi tiết sản phẩm | Query theo slug → join `product_images`, `option_groups`, `option_items` → trả về kèm `avg_rating` |
| GET | `/products/:id/reviews` | Public | Đánh giá sản phẩm | Query `reviews` → join qua `order_items` theo `product_id` → join user (tên, avatar) → phân trang → trả về |
| POST | `/admin/products` | Admin | Tạo sản phẩm | Validate → upload thumbnail + ảnh Cloudinary → insert `products` + `product_images` |
| PUT | `/admin/products/:id` | Admin | Cập nhật sản phẩm | Validate → update DB |
| PATCH | `/admin/products/:id/status` | Admin | Ẩn/hiện sản phẩm | Toggle `is_active` |
| POST | `/admin/products/:id/images` | Admin | Thêm ảnh sản phẩm | Upload Cloudinary → insert `product_images` |
| DELETE | `/admin/products/:id/images/:imageId` | Admin | Xóa ảnh sản phẩm | Xóa Cloudinary → xóa DB |

---

## MODULE: OPTIONS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| GET | `/products/:id/options` | Public | Tùy chọn của sản phẩm | Query `option_groups` + `option_items` theo `product_id` → trả về cây nhóm-tùy chọn |
| POST | `/admin/products/:id/option-groups` | Admin | Tạo nhóm tùy chọn | Validate → insert `option_groups` |
| PUT | `/admin/option-groups/:id` | Admin | Cập nhật nhóm tùy chọn | Update `name`, `is_required`, `is_multiple`, `sort_order` |
| DELETE | `/admin/option-groups/:id` | Admin | Xóa nhóm tùy chọn | Kiểm tra không có đơn đang dùng → xóa cascade `option_items` |
| POST | `/admin/option-groups/:id/items` | Admin | Tạo chi tiết tùy chọn | Validate → upload ảnh nếu có → insert `option_items` |
| PUT | `/admin/option-items/:id` | Admin | Cập nhật chi tiết tùy chọn | Update `name`, `extra_price`, `image`, `sort_order` |
| PATCH | `/admin/option-items/:id/status` | Admin | Ẩn/hiện chi tiết tùy chọn | Toggle `is_active` |

---

## MODULE: COUPONS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| POST | `/coupons/validate` | Public | Kiểm tra mã giảm giá | Nhận `code` + `order_value` → tìm coupon → kiểm tra `is_active`, còn hạn, `used_count < usage_limit`, `order_value >= min_order_value` → tính discount (capped bởi `max_discount_amount`) → trả về kết quả |
| POST | `/admin/coupons` | Admin | Tạo coupon | Validate → insert DB |
| GET | `/admin/coupons` | Admin | Danh sách coupon | Query all → trả về |
| PUT | `/admin/coupons/:id` | Admin | Cập nhật coupon | Validate → update DB |
| PATCH | `/admin/coupons/:id/status` | Admin | Ẩn/hiện coupon | Toggle `is_active` |

---

## MODULE: REVIEWS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| POST | `/reviews` | Member | Gửi đánh giá | Nhận `order_item_id` + `rating` + `comment` + ảnh → kiểm tra order_item thuộc user → kiểm tra order status = `delivered` → kiểm tra chưa có review → upload ảnh Cloudinary → insert `reviews` → tính lại `avg_rating` trên `products` → trả về |
| GET | `/admin/reviews` | Admin | Danh sách đánh giá | Query `reviews` + join `user` + join `order_items` → phân trang → trả về |
| PATCH | `/admin/reviews/:id/visibility` | Admin | Ẩn/hiện đánh giá | Toggle `is_visible` → update DB |

---

## MODULE: LOYALTY

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| POST | `/internal/loyalty/credit` | Internal | Cộng điểm sau đơn | Nhận `order_id` → query `total_amount` → tính điểm (vd: 1.000đ = 1 điểm) → insert `loyalty_logs` (points_delta dương) → update `users.loyalty_points` → kiểm tra ngưỡng nâng hạng (bronze/silver/gold) → update `membership_tier` nếu đủ → trả về |

---

## MODULE: ANALYTICS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| POST | `/analytics/events/batch` | Public | Ghi batch sự kiện nghiệp vụ | Nhận mảng sự kiện (tối đa 20) → validate từng event → bulk insert vào `analytics_events` → trả về 204 No Content. *Angular gọi mỗi 10 giây hoặc khi đủ 20 sự kiện. Dùng `navigator.sendBeacon()` khi đóng tab.* |
| GET | `/admin/analytics/overview` | Admin | Tổng quan báo cáo | Query tổng hợp theo khoảng thời gian: doanh thu, số đơn, số khách mới, top sản phẩm → trả về |
| GET | `/admin/analytics/behavior` | Admin | Báo cáo hành vi nội bộ | Query `analytics_events` → group theo `event_type`, `utm_source`, `page_url` → trả về |
| GET | `/admin/customers` | Admin | Danh sách khách hàng | Query users `role=member` → trả về thông tin, hạng, điểm, số đơn |
| GET | `/admin/customers/:id` | Admin | Chi tiết khách hàng | Query user + addresses + orders + loyalty_logs → trả về hành trình đầy đủ |

---

## MODULE: CART

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| GET | `/cart` | Public | Lấy giỏ hàng | Lấy `cart_key` từ cookie `session_id` hoặc `user_id` → query Redis → tính lại tổng tiền theo giá DB hiện tại → trả về |
| POST | `/cart/items` | Public | Thêm vào giỏ | Validate `product_id`, `quantity`, `option_item_ids` → kiểm tra product + options còn active → tính giá → lưu Redis → trả về giỏ mới |
| PUT | `/cart/items/:cartItemId` | Public | Cập nhật số lượng | Update Redis → trả về giỏ mới |
| DELETE | `/cart/items/:cartItemId` | Public | Xóa 1 sản phẩm | Xóa item khỏi Redis → trả về giỏ mới |
| DELETE | `/cart` | Public | Xóa toàn bộ giỏ | Xóa key Redis → trả về |
| POST | `/cart/merge` | Member | Merge giỏ guest vào member | Lấy giỏ guest (`session_id`) + giỏ member (`user_id`) → merge không trùng → lưu vào key `user_id` → xóa key session → trả về giỏ đã merge |

---

## MODULE: ORDERS

| Method | Endpoint | Auth | Mô tả | Logic end-to-end |
|--------|----------|------|-------|------------------|
| POST | `/orders` | Public | Tạo đơn hàng | Validate thông tin giao hàng → lấy giỏ từ Redis → validate coupon nếu có → tính subtotal, discount, shipping_fee, total → insert `orders` (`payment_status='pending'`, `order_status='pending'`) + `order_items` + `order_item_options` (snapshot) → xóa giỏ Redis → tạo QR thanh toán động: `qr_url = https://qr.sepay.vn/img?acc={SEPAY_ACCOUNT_NUMBER}&bank={SEPAY_BANK_CODE}&amount={total}&des=DH{order_id}&template=compact` → kiểm tra email/phone chưa có tài khoản active thì tạo user `is_active=false` → gửi email/SMS xác nhận đơn + kích hoạt tài khoản (kèm QR code) → trả về `order_id`, tóm tắt đơn, `payment_qr_url` |
| GET | `/orders/me` | Member | Lịch sử đơn hàng | Query orders theo `user_id` → phân trang → trả về danh sách |
| GET | `/orders/me/:id` | Member | Chi tiết đơn hàng (polling) | Query order + items + options → kiểm tra thuộc user → trả về kèm `payment_status`, `order_status`. FE gọi mỗi 2-3 giây để phát hiện khi `payment_status='paid'`. |
| PATCH | `/orders/me/:id/cancel` | Member | Hủy đơn | Kiểm tra thuộc user → kiểm tra status còn `pending` hoặc `confirmed` → update `order_status='cancelled'` → hoàn `loyalty_points` nếu đã dùng → insert `loyalty_logs` âm → trả về |
| POST | `/webhooks/sepay` | Public (xác thực API Key) | Webhook thanh toán Sepay | Xác thực header `Authorization: Apikey {SEPAY_API_KEY}`. Nhận JSON, kiểm tra `transferType='in'`. Dùng `sepay_transaction_id` chống duplicate (kiểm tra bảng `transactions`). Lưu giao dịch vào `transactions`. Dùng regex `/DH(\d+)/` trích xuất `order_id` từ `content`. Tìm order với `id=order_id`, `total=amount_in`, `payment_status='pending'`. Nếu hợp lệ: cập nhật `payment_status='paid'`, `order_status='confirmed'`, lưu `sepay_transaction_id`. Trả về 200. |
| POST | `/admin/orders/:id/confirm-payment` | Admin | Xác nhận thanh toán thủ công (fallback) | Kiểm tra order tồn tại, `payment_status='pending'`. Cập nhật `payment_status='paid'`, `order_status='confirmed'`. Ghi log lý do (admin + timestamp). Trả về thông tin đơn. |
| GET | `/admin/orders` | Admin | Danh sách đơn hàng | Query params: `status`, `payment_status`, `date_from`, `date_to`, `search` → build query → trả về + pagination |
| GET | `/admin/orders/:id` | Admin | Chi tiết đơn hàng | Query đầy đủ order + items + options + thông tin khách + thông tin giao dịch Sepay (nếu có) → trả về |
| PATCH | `/admin/orders/:id/status` | Admin | Cập nhật trạng thái đơn | Validate chuyển trạng thái hợp lệ theo thứ tự (`pending` → `confirmed` → `processing` → `ready` → `delivered`; hoặc `cancelled`). Nếu chuyển sang `delivered`: gọi internal endpoint `POST /internal/loyalty/credit` để cộng điểm. Cập nhật `order_status` → trả về. |