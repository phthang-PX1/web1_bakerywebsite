# ERD — Hệ thống Webee (chuẩn 3NF)

> Dùng file này làm nguồn duy nhất (single source of truth) khi sinh `prisma/schema.prisma`. Không tự ý đổi tên bảng/field hoặc thêm bảng mới khi chưa xác nhận. Nếu có sự thay đổi ở dataschema hay bất cứ điều gì liên quan tới cấu trúc dữ liệu sau khi người dùng xác nhận thì phải chỉnh sửa luôn ở tài liệu này để đồng bộ.

---

## 1. Danh sách bảng & thuộc tính (14 bảng — không có bảng transactions)

### 1.1 users

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| user_id | UUID | PK |
| email | VARCHAR(255) | Nullable (nếu chỉ có SĐT), unique nếu không null |
| phone | VARCHAR(20) | Nullable (nếu chỉ có email), unique nếu không null |
| password_hash | VARCHAR(255) | Nullable (nếu đăng nhập Google) |
| full_name | VARCHAR(100) | |
| avatar_url | VARCHAR(500) | Nullable |
| auth_provider | ENUM(local, google) | |
| google_id | VARCHAR(100) | Nullable |
| role | ENUM(member, admin) | |
| loyalty_points | INT | Default 0 |
| membership_tier | ENUM(bronze, silver, gold) | Default bronze |
| is_active | BOOLEAN | Default false |
| refresh_token_hash | VARCHAR(255) | Nullable — hash refresh token hiện tại, dùng để invalidate khi logout/reset password |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 1.2 addresses

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| address_id | UUID | PK |
| user_id | UUID | FK → users.user_id |
| recipient_name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| street | VARCHAR(255) | |
| district | VARCHAR(100) | |
| city | VARCHAR(100) | |
| is_default | BOOLEAN | Default false |
| created_at | TIMESTAMP | |

### 1.3 categories

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| category_id | UUID | PK |
| name | VARCHAR(100) | |
| slug | VARCHAR(100) | Unique |
| description | TEXT | Nullable |
| image_url | VARCHAR(500) | Nullable |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

### 1.4 products

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| product_id | UUID | PK |
| category_id | UUID | FK → categories.category_id |
| name | VARCHAR(255) | |
| slug | VARCHAR(255) | Unique |
| description | TEXT | Nullable |
| base_price | DECIMAL(10,2) | |
| thumbnail_url | VARCHAR(500) | Nullable |
| is_customizable | BOOLEAN | Default false |
| avg_rating | DECIMAL(3,2) | Default 0 |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 1.5 product_images

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| image_id | UUID | PK |
| product_id | UUID | FK → products.product_id |
| image_url | VARCHAR(500) | |
| sort_order | INT | Default 0 |

### 1.6 option_groups

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| group_id | UUID | PK |
| product_id | UUID | FK → products.product_id |
| name | VARCHAR(100) | Vd: Kích cỡ, Kem phủ, Topping |
| is_required | BOOLEAN | Default false |
| is_multiple | BOOLEAN | Default false |
| sort_order | INT | Default 0 |

### 1.7 option_items

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| item_id | UUID | PK |
| group_id | UUID | FK → option_groups.group_id |
| name | VARCHAR(100) | Vd: 16cm, Kem tươi |
| extra_price | DECIMAL(10,2) | Default 0 |
| image_url | VARCHAR(500) | Nullable |
| is_active | BOOLEAN | Default true |
| sort_order | INT | Default 0 |

### 1.8 coupons

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| coupon_id | UUID | PK |
| code | VARCHAR(50) | Unique |
| discount_type | ENUM(percent, fixed) | |
| discount_value | DECIMAL(10,2) | |
| min_order_value | DECIMAL(10,2) | Default 0 |
| max_discount_amount | DECIMAL(10,2) | Nullable |
| usage_limit | INT | Nullable |
| used_count | INT | Default 0 |
| start_date | TIMESTAMP | |
| end_date | TIMESTAMP | |
| is_active | BOOLEAN | Default true |

### 1.9 orders

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| order_id | UUID | PK |
| user_id | UUID | FK → users.user_id, Nullable |
| coupon_id | UUID | FK → coupons.coupon_id, Nullable |
| recipient_name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| fulfillment_type | ENUM(delivery, pickup) | |
| delivery_address | TEXT | Nullable (null nếu pickup) |
| delivery_date | DATE | |
| delivery_time_slot | VARCHAR(50) | |
| subtotal | DECIMAL(10,2) | |
| discount_amount | DECIMAL(10,2) | Default 0 |
| shipping_fee | DECIMAL(10,2) | Default 0 |
| total_amount | DECIMAL(10,2) | |
| payment_method | ENUM(cash, transfer, card) | |
| payment_status | ENUM(pending, paid, failed) | |
| order_status | ENUM(pending, confirmed, processing, ready, delivered, cancelled) | |
| note | TEXT | Nullable |
| loyalty_points_earned | INT | Default 0 |
| loyalty_points_used | INT | Default 0 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 1.10 order_items

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| order_item_id | UUID | PK |
| order_id | UUID | FK → orders.order_id |
| product_id | UUID | FK → products.product_id |
| product_name_snapshot | VARCHAR(255) | Lưu tên SP tại thời điểm đặt |
| unit_price_snapshot | DECIMAL(10,2) | Lưu giá SP tại thời điểm đặt |
| quantity | INT | |
| is_custom | BOOLEAN | Default false |
| custom_note | TEXT | Nullable |
| item_total | DECIMAL(10,2) | |

### 1.11 order_item_options

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| id | UUID | PK |
| order_item_id | UUID | FK → order_items.order_item_id |
| item_id | UUID | FK → option_items.item_id |
| option_name_snapshot | VARCHAR(100) | Lưu tên tùy chọn tại thời điểm đặt |
| option_price_snapshot | DECIMAL(10,2) | Lưu giá tùy chọn tại thời điểm đặt |

### 1.12 reviews

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| review_id | UUID | PK |
| order_item_id | UUID | FK → order_items.order_item_id |
| user_id | UUID | FK → users.user_id |
| rating | TINYINT | 1–5 |
| comment | TEXT | Nullable |
| image_url | VARCHAR(500) | Nullable |
| is_visible | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

### 1.13 loyalty_logs

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| log_id | UUID | PK |
| user_id | UUID | FK → users.user_id |
| order_id | UUID | FK → orders.order_id |
| points_delta | INT | Dương = cộng, Âm = trừ |
| reason | VARCHAR(255) | |
| created_at | TIMESTAMP | |

### 1.14 analytics_events

| Thuộc tính | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| event_id | UUID | PK |
| session_id | VARCHAR(100) | |
| user_id | UUID | FK → users.user_id, Nullable |
| event_type | ENUM(page_view, click, add_to_cart, checkout_start, purchase) | |
| page_url | VARCHAR(500) | |
| referrer | VARCHAR(500) | Nullable |
| device_type | VARCHAR(50) | |
| os | VARCHAR(50) | |
| browser | VARCHAR(50) | |
| utm_source | VARCHAR(100) | Nullable |
| utm_medium | VARCHAR(100) | Nullable |
| utm_campaign | VARCHAR(100) | Nullable |
| meta | JSON | Nullable |
| created_at | TIMESTAMP | |



---

## 2. Mối quan hệ đầy đủ (16 quan hệ)

Ký hiệu: `Bảng A (x,y) — (m,n) Bảng B` nghĩa là một bản ghi của A liên kết với (m,n) bản ghi của B, và một bản ghi của B liên kết với (x,y) bản ghi của A.

| # | Quan hệ |
|---|---|
| 1 | users (1,1) — (0,N) addresses |
| 2 | users (1,1) — (0,N) orders |
| 3 | users (1,1) — (0,N) reviews |
| 4 | users (1,1) — (0,N) loyalty_logs |
| 5 | users (1,1) — (0,N) analytics_events |
| 6 | categories (1,1) — (0,N) products |
| 7 | products (1,1) — (0,N) product_images |
| 8 | products (1,1) — (0,N) option_groups |
| 9 | products (1,1) — (0,N) order_items |
| 10 | option_groups (1,1) — (1,N) option_items |
| 11 | option_items (1,1) — (0,N) order_item_options |
| 12 | coupons (1,1) — (0,N) orders |
| 13 | orders (1,1) — (1,N) order_items |
| 14 | orders (1,1) — (0,N) loyalty_logs |
| 15 | order_items (1,1) — (0,N) order_item_options |
| 16 | order_items (1,1) — (0,1) reviews |

---

## 3. Ghi chú chuẩn 3NF

- **1NF:** Mọi thuộc tính nguyên tử, không có nhóm lặp.
- **2NF:** Mọi thuộc tính phụ thuộc hoàn toàn vào PK — các bảng trung gian (`order_item_options`) được tách riêng đúng cách.
- **3NF:** Không có phụ thuộc bắc cầu. `product_name_snapshot`, `unit_price_snapshot` (trong `order_items`) và `option_name_snapshot`, `option_price_snapshot` (trong `order_item_options`) là **dữ liệu lịch sử lưu có chủ đích** (snapshot tại thời điểm đặt hàng), không phải vi phạm 3NF — giá/tên sản phẩm có thể thay đổi sau này nhưng đơn hàng cũ phải giữ nguyên giá trị đã chốt.
- **Quyết định đã chốt:** `reviews` KHÔNG có `product_id` trực tiếp. Để lấy đánh giá theo sản phẩm, truy vấn qua `reviews → order_items.product_id → products`. Đây là quyết định có chủ đích để giữ ERD sạch, không denormalize.