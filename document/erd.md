# ERD — Hệ thống WeBee Bakery

> Nguồn chuẩn (single source of truth): [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).
> Tài liệu này được sinh lại từ schema thực tế. Khi schema đổi, hãy cập nhật lại file này để đồng bộ.
>
> Quy ước: tên cột dưới đây là tên **cột database** (snake_case, qua `@map`); field Prisma trong code là camelCase tương ứng.

---

## 1. Tổng quan

Cơ sở dữ liệu **PostgreSQL**, quản lý qua **Prisma ORM**. Tổng cộng **19 bảng** và **9 enum**.

| Nhóm | Bảng |
|---|---|
| Người dùng & xác thực | `users`, `addresses`, `auth_action_tokens` |
| Danh mục & sản phẩm | `categories`, `products`, `product_images`, `option_groups`, `option_items` |
| Đơn hàng | `orders`, `order_items`, `order_item_options` |
| Khuyến mãi & thành viên | `coupons`, `vouchers_inventory`, `loyalty_logs`, `membership_cycles` |
| Nội dung & marketing | `banners`, `blog_posts` |
| Đánh giá & phân tích | `reviews`, `analytics_events` |

---

## 2. Enum

| Enum | Giá trị |
|---|---|
| `AuthProvider` | `local`, `google` |
| `UserRole` | `member`, `admin` |
| `MembershipTier` | `member`, `bronze`, `silver`, `gold`, `diamond` |
| `VoucherTier` | `bronze`, `silver`, `gold`, `diamond` |
| `DiscountType` | `percent`, `fixed` |
| `FulfillmentType` | `delivery`, `pickup` |
| `PaymentMethod` | `cash`, `transfer`, `card` |
| `PaymentStatus` | `pending`, `paid`, `failed` |
| `OrderStatus` | `pending`, `confirmed`, `processing`, `ready`, `delivered`, `cancelled` |
| `AnalyticsEventType` | `page_view`, `click`, `add_to_cart`, `checkout_start`, `purchase` |

---

## 3. Bảng & thuộc tính

### 3.1 users
| Cột | Kiểu | Ghi chú |
|---|---|---|
| user_id | UUID | PK |
| email | VARCHAR(255) | Nullable, unique |
| phone | VARCHAR(20) | Nullable, unique |
| password_hash | VARCHAR(255) | Nullable (đăng nhập Google) |
| full_name | VARCHAR(100) | |
| avatar_url | VARCHAR(500) | Nullable |
| auth_provider | ENUM AuthProvider | Default `local` |
| google_id | VARCHAR(100) | Nullable, unique |
| role | ENUM UserRole | Default `member` |
| is_active | BOOLEAN | Default false |
| otp_hash | VARCHAR(255) | Nullable |
| otp_expires_at | TIMESTAMP | Nullable |
| pending_email | VARCHAR(255) | Nullable — email chờ xác nhận đổi |
| pending_phone | VARCHAR(20) | Nullable — SĐT chờ xác nhận đổi |
| loyalty_points | INT | Default 0 |
| membership_tier | ENUM MembershipTier | Default `member` |
| refresh_token_hash | VARCHAR(255) | Nullable — invalidate khi logout/reset |
| created_at / updated_at | TIMESTAMP | |

Index: `email`, `phone`.

### 3.2 addresses
| Cột | Kiểu | Ghi chú |
|---|---|---|
| address_id | UUID | PK |
| user_id | UUID | FK → users (cascade) |
| recipient_name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| street | VARCHAR(255) | |
| district | VARCHAR(100) | |
| city | VARCHAR(100) | |
| is_default | BOOLEAN | Default false |
| created_at | TIMESTAMP | |

### 3.3 auth_action_tokens
Token 1 lần cho reset mật khẩu / đổi email-SĐT (lưu hash, không lưu token gốc).
| Cột | Kiểu | Ghi chú |
|---|---|---|
| token_id | UUID | PK |
| user_id | UUID | FK → users (cascade) |
| token_hash | VARCHAR(64) | Unique |
| purpose | VARCHAR(32) | vd: reset_password, change_email |
| expires_at | TIMESTAMP | |
| used_at | TIMESTAMP | Nullable |
| created_at | TIMESTAMP | |

### 3.4 categories
| Cột | Kiểu | Ghi chú |
|---|---|---|
| category_id | UUID | PK |
| name | VARCHAR(100) | |
| slug | VARCHAR(100) | Unique |
| description | TEXT | Nullable |
| image_url | VARCHAR(500) | Nullable |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

### 3.5 products
| Cột | Kiểu | Ghi chú |
|---|---|---|
| product_id | UUID | PK |
| category_id | UUID | FK → categories |
| name | VARCHAR(255) | |
| slug | VARCHAR(255) | Unique |
| description | TEXT | Nullable |
| base_price | DECIMAL(10,2) | |
| thumbnail_url | VARCHAR(500) | Nullable |
| is_customizable | BOOLEAN | Default false |
| avg_rating | DECIMAL(3,2) | Default 0 |
| sold_count | INT | Default 0 |
| is_active | BOOLEAN | Default true |
| created_at / updated_at | TIMESTAMP | |

Index: `category_id`, `slug`, `sold_count`.

### 3.6 product_images
| Cột | Kiểu | Ghi chú |
|---|---|---|
| image_id | UUID | PK |
| product_id | UUID | FK → products (cascade) |
| image_url | VARCHAR(500) | |
| sort_order | INT | Default 0 |

### 3.7 option_groups
Nhóm thành phần tùy chỉnh bánh.
| Cột | Kiểu | Ghi chú |
|---|---|---|
| group_id | UUID | PK |
| product_id | UUID | Nullable, FK → products (cascade). **null = nhóm dùng chung cho mọi bánh tùy chỉnh** |
| name | VARCHAR(100) | |
| is_required | BOOLEAN | Default false |
| is_multiple | BOOLEAN | Default false |
| max_select | INT | Nullable — số lượng tối đa được chọn |
| free_quantity | INT | Default 0 — số lựa chọn đầu miễn phụ phí |
| surcharge_per_extra | DECIMAL(10,2) | Default 0 — phụ phí mỗi lựa chọn vượt free_quantity |
| sort_order | INT | Default 0 |

### 3.8 option_items
| Cột | Kiểu | Ghi chú |
|---|---|---|
| item_id | UUID | PK |
| group_id | UUID | FK → option_groups (cascade) |
| name | VARCHAR(100) | |
| extra_price | DECIMAL(10,2) | Default 0 |
| image_url | VARCHAR(500) | Nullable |
| is_active | BOOLEAN | Default true |
| sort_order | INT | Default 0 |

### 3.9 coupons
| Cột | Kiểu | Ghi chú |
|---|---|---|
| coupon_id | UUID | PK |
| code | VARCHAR(50) | Unique |
| discount_type | ENUM DiscountType | |
| discount_value | DECIMAL(10,2) | |
| min_order_value | DECIMAL(10,2) | Default 0 |
| max_discount_amount | DECIMAL(10,2) | Nullable — trần giảm giá |
| usage_limit | INT | Nullable |
| used_count | INT | Default 0 |
| start_date / end_date | TIMESTAMP | |
| is_active | BOOLEAN | Default true |

### 3.10 orders
| Cột | Kiểu | Ghi chú |
|---|---|---|
| order_id | UUID | PK |
| user_id | UUID | Nullable, FK → users (đơn khách vãng lai) |
| coupon_id | UUID | Nullable, FK → coupons |
| recipient_name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| fulfillment_type | ENUM FulfillmentType | |
| delivery_address | TEXT | Nullable |
| delivery_date | DATE | |
| delivery_time_slot | VARCHAR(50) | |
| subtotal | DECIMAL(10,2) | |
| discount_amount | DECIMAL(10,2) | Default 0 |
| shipping_fee | DECIMAL(10,2) | Default 0 |
| total_amount | DECIMAL(10,2) | |
| payment_method | ENUM PaymentMethod | |
| payment_status | ENUM PaymentStatus | Default `pending` |
| order_status | ENUM OrderStatus | Default `pending` |
| note | TEXT | Nullable |
| card_type | VARCHAR(20) | Default `none` — loại thiệp |
| card_message | VARCHAR(300) | Nullable — lời nhắn thiệp |
| loyalty_points_earned | INT | Default 0 |
| loyalty_points_used | INT | Default 0 |
| buyer_name | VARCHAR(100) | Nullable — người đặt (khác người nhận) |
| buyer_phone | VARCHAR(20) | Nullable |
| created_at / updated_at | TIMESTAMP | |

Index: `user_id`, `coupon_id`, `order_status`, `payment_status`, `created_at`.

### 3.11 order_items
Lưu **snapshot** giá và tên tại thời điểm đặt.
| Cột | Kiểu | Ghi chú |
|---|---|---|
| order_item_id | UUID | PK |
| order_id | UUID | FK → orders (cascade) |
| product_id | UUID | FK → products |
| product_name_snapshot | VARCHAR(255) | |
| unit_price_snapshot | DECIMAL(10,2) | |
| quantity | INT | |
| is_custom | BOOLEAN | Default false |
| custom_note | TEXT | Nullable |
| item_total | DECIMAL(10,2) | |

### 3.12 order_item_options
Snapshot thành phần tùy chỉnh của mỗi dòng đơn.
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | UUID | PK |
| order_item_id | UUID | FK → order_items (cascade) |
| item_id | UUID | FK → option_items |
| option_name_snapshot | VARCHAR(100) | |
| option_price_snapshot | DECIMAL(10,2) | |

### 3.13 reviews
| Cột | Kiểu | Ghi chú |
|---|---|---|
| review_id | UUID | PK |
| order_item_id | UUID | Unique, FK → order_items (cascade) — mỗi dòng đơn 1 đánh giá |
| user_id | UUID | FK → users (cascade) |
| rating | INT | |
| comment | TEXT | Nullable |
| image_url | VARCHAR(500) | Nullable |
| is_visible | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

### 3.14 loyalty_logs
Nhật ký cộng/trừ điểm (points_delta âm khi hủy đơn).
| Cột | Kiểu | Ghi chú |
|---|---|---|
| log_id | UUID | PK |
| user_id | UUID | FK → users (cascade) |
| order_id | UUID | Nullable, FK → orders (cascade) |
| points_delta | INT | |
| reason | VARCHAR(255) | |
| created_at | TIMESTAMP | |

### 3.15 membership_cycles
Kết quả xét hạng theo chu kỳ (6 tháng).
| Cột | Kiểu | Ghi chú |
|---|---|---|
| cycle_id | UUID | PK |
| user_id | UUID | FK → users (cascade) |
| cycle_start / cycle_end | DATE | |
| total_orders | INT | |
| total_revenue | DECIMAL(10,2) | |
| tier_result | ENUM MembershipTier | |
| created_at | TIMESTAMP | |

### 3.16 vouchers_inventory
Kho voucher phát theo hạng thành viên.
| Cột | Kiểu | Ghi chú |
|---|---|---|
| voucher_template_id | UUID | PK |
| tier | ENUM VoucherTier | |
| coupon_id | UUID | FK → coupons (cascade) |
| quantity_per_month | INT | |
| is_active | BOOLEAN | Default true |

### 3.17 banners
| Cột | Kiểu | Ghi chú |
|---|---|---|
| banner_id | UUID | PK |
| title | VARCHAR(255) | |
| subtitle | VARCHAR(500) | Nullable |
| image_url | VARCHAR(500) | |
| link_url | VARCHAR(500) | Nullable |
| sort_order | INT | Default 0 |
| is_active | BOOLEAN | Default true |
| created_at / updated_at | TIMESTAMP | |

### 3.18 blog_posts
| Cột | Kiểu | Ghi chú |
|---|---|---|
| post_id | UUID | PK |
| slug | VARCHAR(255) | Unique |
| title | VARCHAR(255) | |
| excerpt | VARCHAR(500) | |
| cover_image | VARCHAR(500) | |
| category | VARCHAR(100) | |
| reading_time | VARCHAR(50) | |
| content | TEXT[] | Mảng các đoạn văn bản |
| gallery_images | TEXT[] | |
| published_at | TIMESTAMP | Default now |
| is_active | BOOLEAN | Default true |
| created_at / updated_at | TIMESTAMP | |

### 3.19 analytics_events
| Cột | Kiểu | Ghi chú |
|---|---|---|
| event_id | UUID | PK |
| session_id | VARCHAR(100) | |
| user_id | UUID | Nullable, FK → users |
| event_type | ENUM AnalyticsEventType | |
| page_url | VARCHAR(500) | |
| referrer | VARCHAR(500) | Nullable |
| device_type / os / browser | VARCHAR(50) | |
| utm_source / utm_medium / utm_campaign | VARCHAR(100) | Nullable |
| meta | JSON | Nullable |
| created_at | TIMESTAMP | |

---

## 4. Quan hệ chính

- **users** 1—N addresses, orders, reviews, loyalty_logs, membership_cycles, auth_action_tokens, analytics_events.
- **categories** 1—N products.
- **products** 1—N product_images, option_groups, order_items.
- **option_groups** 1—N option_items. `option_groups.product_id` null = nhóm dùng chung.
- **orders** 1—N order_items; **order_items** 1—N order_item_options; **order_items** 1—1 reviews.
- **coupons** 1—N orders, 1—N vouchers_inventory.
- **option_items** 1—N order_item_options (tham chiếu snapshot).

Xóa cascade áp dụng cho quan hệ sở hữu (địa chỉ, ảnh sản phẩm, dòng đơn, tùy chọn dòng đơn, log điểm, chu kỳ hạng, token).
