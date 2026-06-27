# ERD â€” Há»‡ thá»‘ng Webee (chuáº©n 3NF)

> DÃ¹ng file nÃ y lÃ m nguá»“n duy nháº¥t (single source of truth) khi sinh `prisma/schema.prisma`. KhÃ´ng tá»± Ã½ Ä‘á»•i tÃªn báº£ng/field hoáº·c thÃªm báº£ng má»›i khi chÆ°a xÃ¡c nháº­n. Náº¿u cÃ³ sá»± thay Ä‘á»•i á»Ÿ dataschema hay báº¥t cá»© Ä‘iá»u gÃ¬ liÃªn quan tá»›i cáº¥u trÃºc dá»¯ liá»‡u sau khi ngÆ°á»i dÃ¹ng xÃ¡c nháº­n thÃ¬ pháº£i chá»‰nh sá»­a luÃ´n á»Ÿ tÃ i liá»‡u nÃ y Ä‘á»ƒ Ä‘á»“ng bá»™.

---

## 1. Danh sÃ¡ch báº£ng & thuá»™c tÃ­nh (16 báº£ng â€” khÃ´ng cÃ³ báº£ng transactions)

### 1.1 users

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| user_id | UUID | PK |
| email | VARCHAR(255) | Nullable (náº¿u chá»‰ cÃ³ SÄT), unique náº¿u khÃ´ng null |
| phone | VARCHAR(20) | Nullable (náº¿u chá»‰ cÃ³ email), unique náº¿u khÃ´ng null |
| password_hash | VARCHAR(255) | Nullable (náº¿u Ä‘Äƒng nháº­p Google) |
| full_name | VARCHAR(100) | |
| avatar_url | VARCHAR(500) | Nullable |
| auth_provider | ENUM(local, google) | |
| google_id | VARCHAR(100) | Nullable |
| role | ENUM(member, admin) | |
| loyalty_points | INT | Default 0 |
| membership_tier | ENUM(member, bronze, silver, gold, diamond) | Default member |
| is_active | BOOLEAN | Default false |
| refresh_token_hash | VARCHAR(255) | Nullable â€” hash refresh token hiá»‡n táº¡i, dÃ¹ng Ä‘á»ƒ invalidate khi logout/reset password |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 1.2 addresses

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| address_id | UUID | PK |
| user_id | UUID | FK â†’ users.user_id |
| recipient_name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| street | VARCHAR(255) | |
| district | VARCHAR(100) | |
| city | VARCHAR(100) | |
| is_default | BOOLEAN | Default false |
| created_at | TIMESTAMP | |

### 1.3 categories

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| category_id | UUID | PK |
| name | VARCHAR(100) | |
| slug | VARCHAR(100) | Unique |
| description | TEXT | Nullable |
| image_url | VARCHAR(500) | Nullable |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

### 1.4 products

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| product_id | UUID | PK |
| category_id | UUID | FK â†’ categories.category_id |
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

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| image_id | UUID | PK |
| product_id | UUID | FK â†’ products.product_id |
| image_url | VARCHAR(500) | |
| sort_order | INT | Default 0 |

### 1.6 option_groups

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| group_id | UUID | PK |
| product_id | UUID | FK â†’ products.product_id |
| name | VARCHAR(100) | Vd: KÃ­ch cá»¡, Kem phá»§, Topping |
| is_required | BOOLEAN | Default false |
| is_multiple | BOOLEAN | Default false |
| sort_order | INT | Default 0 |

### 1.7 option_items

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| item_id | UUID | PK |
| group_id | UUID | FK â†’ option_groups.group_id |
| name | VARCHAR(100) | Vd: 16cm, Kem tÆ°Æ¡i |
| extra_price | DECIMAL(10,2) | Default 0 |
| image_url | VARCHAR(500) | Nullable |
| is_active | BOOLEAN | Default true |
| sort_order | INT | Default 0 |

### 1.8 coupons

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
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

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| order_id | UUID | PK |
| user_id | UUID | FK â†’ users.user_id, Nullable |
| coupon_id | UUID | FK â†’ coupons.coupon_id, Nullable |
| recipient_name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| fulfillment_type | ENUM(delivery, pickup) | |
| delivery_address | TEXT | Nullable (null náº¿u pickup) |
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

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| order_item_id | UUID | PK |
| order_id | UUID | FK â†’ orders.order_id |
| product_id | UUID | FK â†’ products.product_id |
| product_name_snapshot | VARCHAR(255) | LÆ°u tÃªn SP táº¡i thá»i Ä‘iá»ƒm Ä‘áº·t |
| unit_price_snapshot | DECIMAL(10,2) | LÆ°u giÃ¡ SP táº¡i thá»i Ä‘iá»ƒm Ä‘áº·t |
| quantity | INT | |
| is_custom | BOOLEAN | Default false |
| custom_note | TEXT | Nullable |
| item_total | DECIMAL(10,2) | |

### 1.11 order_item_options

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| id | UUID | PK |
| order_item_id | UUID | FK â†’ order_items.order_item_id |
| item_id | UUID | FK â†’ option_items.item_id |
| option_name_snapshot | VARCHAR(100) | LÆ°u tÃªn tÃ¹y chá»n táº¡i thá»i Ä‘iá»ƒm Ä‘áº·t |
| option_price_snapshot | DECIMAL(10,2) | LÆ°u giÃ¡ tÃ¹y chá»n táº¡i thá»i Ä‘iá»ƒm Ä‘áº·t |

### 1.12 reviews

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| review_id | UUID | PK |
| order_item_id | UUID | FK â†’ order_items.order_item_id |
| user_id | UUID | FK â†’ users.user_id |
| rating | TINYINT | 1â€“5 |
| comment | TEXT | Nullable |
| image_url | VARCHAR(500) | Nullable |
| is_visible | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

### 1.13 loyalty_logs

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| log_id | UUID | PK |
| user_id | UUID | FK â†’ users.user_id |
| order_id | UUID | FK â†’ orders.order_id |
| points_delta | INT | DÆ°Æ¡ng = cá»™ng, Ã‚m = trá»« |
| reason | VARCHAR(255) | |
| created_at | TIMESTAMP | |

### 1.14 membership_cycles

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| cycle_id | UUID | PK |
| user_id | UUID | FK â†’ users.user_id |
| cycle_start | DATE | |
| cycle_end | DATE | |
| total_orders | INT | Sá»‘ Ä‘Æ¡n trong chu ká»³ |
| total_revenue | DECIMAL(10,2) | Doanh thu trong chu ká»³ |
| tier_result | ENUM(member, bronze, silver, gold, diamond) | Háº¡ng Ä‘Æ°á»£c xÃ©t cuá»‘i chu ká»³ |
| created_at | TIMESTAMP | |

### 1.15 vouchers_inventory

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| voucher_template_id | UUID | PK |
| tier | ENUM(bronze, silver, gold, diamond) | Háº¡ng Ä‘Æ°á»£c nháº­n voucher |
| coupon_id | UUID | FK â†’ coupons.coupon_id |
| quantity_per_month | INT | Sá»‘ lÆ°á»£ng issue má»—i thÃ¡ng cho háº¡ng nÃ y |
| is_active | BOOLEAN | Default true |

### 1.16 analytics_events

| Thuá»™c tÃ­nh | Kiá»ƒu dá»¯ liá»‡u | Ghi chÃº |
|---|---|---|
| event_id | UUID | PK |
| session_id | VARCHAR(100) | |
| user_id | UUID | FK â†’ users.user_id, Nullable |
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

## 2. Má»‘i quan há»‡ Ä‘áº§y Ä‘á»§ (18 quan há»‡)

KÃ½ hiá»‡u: `Báº£ng A (x,y) â€” (m,n) Báº£ng B` nghÄ©a lÃ  má»™t báº£n ghi cá»§a A liÃªn káº¿t vá»›i (m,n) báº£n ghi cá»§a B, vÃ  má»™t báº£n ghi cá»§a B liÃªn káº¿t vá»›i (x,y) báº£n ghi cá»§a A.

| # | Quan há»‡ |
|---|---|
| 1 | users (1,1) â€” (0,N) addresses |
| 2 | users (1,1) â€” (0,N) orders |
| 3 | users (1,1) â€” (0,N) reviews |
| 4 | users (1,1) â€” (0,N) loyalty_logs |
| 5 | users (1,1) â€” (0,N) membership_cycles |
| 6 | users (1,1) â€” (0,N) analytics_events |
| 7 | categories (1,1) â€” (0,N) products |
| 8 | products (1,1) â€” (0,N) product_images |
| 9 | products (1,1) â€” (0,N) option_groups |
| 10 | products (1,1) â€” (0,N) order_items |
| 11 | option_groups (1,1) â€” (1,N) option_items |
| 12 | option_items (1,1) â€” (0,N) order_item_options |
| 13 | coupons (1,1) â€” (0,N) orders |
| 14 | coupons (1,1) â€” (0,N) vouchers_inventory |
| 15 | orders (1,1) â€” (1,N) order_items |
| 16 | orders (1,1) â€” (0,N) loyalty_logs |
| 17 | order_items (1,1) â€” (0,N) order_item_options |
| 18 | order_items (1,1) â€” (0,1) reviews |

---

## 3. Ghi chÃº chuáº©n 3NF

- **1NF:** Má»i thuá»™c tÃ­nh nguyÃªn tá»­, khÃ´ng cÃ³ nhÃ³m láº·p.
- **2NF:** Má»i thuá»™c tÃ­nh phá»¥ thuá»™c hoÃ n toÃ n vÃ o PK â€” cÃ¡c báº£ng trung gian (`order_item_options`) Ä‘Æ°á»£c tÃ¡ch riÃªng Ä‘Ãºng cÃ¡ch.
- **3NF:** KhÃ´ng cÃ³ phá»¥ thuá»™c báº¯c cáº§u. `product_name_snapshot`, `unit_price_snapshot` (trong `order_items`) vÃ  `option_name_snapshot`, `option_price_snapshot` (trong `order_item_options`) lÃ  **dá»¯ liá»‡u lá»‹ch sá»­ lÆ°u cÃ³ chá»§ Ä‘Ã­ch** (snapshot táº¡i thá»i Ä‘iá»ƒm Ä‘áº·t hÃ ng), khÃ´ng pháº£i vi pháº¡m 3NF â€” giÃ¡/tÃªn sáº£n pháº©m cÃ³ thá»ƒ thay Ä‘á»•i sau nÃ y nhÆ°ng Ä‘Æ¡n hÃ ng cÅ© pháº£i giá»¯ nguyÃªn giÃ¡ trá»‹ Ä‘Ã£ chá»‘t.
- **Quyáº¿t Ä‘á»‹nh Ä‘Ã£ chá»‘t:** `reviews` KHÃ”NG cÃ³ `product_id` trá»±c tiáº¿p. Äá»ƒ láº¥y Ä‘Ã¡nh giÃ¡ theo sáº£n pháº©m, truy váº¥n qua `reviews â†’ order_items.product_id â†’ products`. ÄÃ¢y lÃ  quyáº¿t Ä‘á»‹nh cÃ³ chá»§ Ä‘Ã­ch Ä‘á»ƒ giá»¯ ERD sáº¡ch, khÃ´ng denormalize.
- **Loyalty:** `loyalty_points` lÃ  sá»‘ Ä‘iá»ƒm dÃ¹ng Ä‘á»•i voucher, khÃ´ng pháº£i tiÃªu chÃ­ xÃ©t háº¡ng. `membership_tier` Ä‘Æ°á»£c xÃ©t theo chu ká»³ 6 thÃ¡ng dá»±a trÃªn `total_orders` + `total_revenue`, vÃ  lá»‹ch sá»­ xÃ©t háº¡ng Ä‘Æ°á»£c lÆ°u trong `membership_cycles`.
# Data Model Schema

> Source: `backend/prisma/schema.prisma` (single source of truth for data models)  
> Date: 2026-06-27

---

## Models detected

### User
Source: `prisma/schema.prisma` â†’ model `User`

| Field | Type | Required | Notes |
|---|---|---|---|
| userId | String (UUID) | âœ… | PK |
| email | String? | âŒ | Unique (nullable â€” if only has phone) |
| phone | String? | âŒ | Unique (nullable â€” if only has email) |
| passwordHash | String? | âŒ | Null for Google OAuth users |
| fullName | String | âœ… | Max 100 chars |
| avatarUrl | String? | âŒ | Cloudinary URL |
| authProvider | Enum: `local` \| `google` | âœ… | Default: `local` |
| googleId | String? | âŒ | Unique |
| role | Enum: `member` \| `admin` | âœ… | Default: `member` |
| loyaltyPoints | Int | âœ… | Default: 0 |
| membershipTier | Enum: `member` \| `bronze` \| `silver` \| `gold` \| `diamond` | âœ… | Default: `member` |
| isActive | Boolean | âœ… | Default: false (must activate via email/SMS) |
| refreshTokenHash | String? | âŒ | SHA-256 hash of current refresh token |
| createdAt | DateTime | âœ… | Auto |
| updatedAt | DateTime | âœ… | Auto (`@updatedAt`) |

### Address
Source: model `Address`

| Field | Type | Required | Notes |
|---|---|---|---|
| addressId | String (UUID) | âœ… | PK |
| userId | String (UUID) | âœ… | FK â†’ users.userId |
| recipientName | String | âœ… | Max 100 chars |
| phone | String | âœ… | Max 20 chars |
| street | String | âœ… | Max 255 chars |
| district | String | âœ… | Max 100 chars |
| city | String | âœ… | Max 100 chars |
| isDefault | Boolean | âœ… | Default: false |
| createdAt | DateTime | âœ… | Auto |

### Category
Source: model `Category`

| Field | Type | Required | Notes |
|---|---|---|---|
| categoryId | String (UUID) | âœ… | PK |
| name | String | âœ… | Max 100 chars |
| slug | String | âœ… | Unique |
| description | String? | âŒ | |
| imageUrl | String? | âŒ | |
| isActive | Boolean | âœ… | Default: true |
| createdAt | DateTime | âœ… | Auto |

### Product
Source: model `Product`

| Field | Type | Required | Notes |
|---|---|---|---|
| productId | String (UUID) | âœ… | PK |
| categoryId | String (UUID) | âœ… | FK â†’ categories |
| name | String | âœ… | Max 255 chars |
| slug | String | âœ… | Unique |
| description | String? | âŒ | |
| basePrice | Decimal | âœ… | `Decimal(10,2)` â€” Vietnamese VNÄ |
| thumbnailUrl | String? | âŒ | |
| isCustomizable | Boolean | âœ… | Default: false |
| avgRating | Decimal | âœ… | Default: 0, `Decimal(3,2)` |
| isActive | Boolean | âœ… | Default: true |
| createdAt | DateTime | âœ… | Auto |
| updatedAt | DateTime | âœ… | Auto |

### ProductImage
Source: model `ProductImage`

| Field | Type | Required | Notes |
|---|---|---|---|
| imageId | String (UUID) | âœ… | PK |
| productId | String (UUID) | âœ… | FK â†’ products |
| imageUrl | String | âœ… | |
| sortOrder | Int | âœ… | Default: 0 |

### OptionGroup
Source: model `OptionGroup`

| Field | Type | Required | Notes |
|---|---|---|---|
| groupId | String (UUID) | âœ… | PK |
| productId | String (UUID) | âœ… | FK â†’ products |
| name | String | âœ… | E.g. "KÃ­ch cá»¡", "Kem phá»§", "Topping" |
| isRequired | Boolean | âœ… | Default: false |
| isMultiple | Boolean | âœ… | Default: false (true = can pick multiple items) |
| sortOrder | Int | âœ… | Default: 0 |

### OptionItem
Source: model `OptionItem`

| Field | Type | Required | Notes |
|---|---|---|---|
| itemId | String (UUID) | âœ… | PK |
| groupId | String (UUID) | âœ… | FK â†’ option_groups |
| name | String | âœ… | E.g. "16cm", "Kem tÆ°Æ¡i", "DÃ¢u tÃ¢y" |
| extraPrice | Decimal | âœ… | Default: 0 â€” added to base_price |
| imageUrl | String? | âŒ | |
| isActive | Boolean | âœ… | Default: true |
| sortOrder | Int | âœ… | Default: 0 |

### Coupon
Source: model `Coupon`

| Field | Type | Required | Notes |
|---|---|---|---|
| couponId | String (UUID) | âœ… | PK |
| code | String | âœ… | Unique, max 50 chars |
| discountType | Enum: `percent` \| `fixed` | âœ… | |
| discountValue | Decimal | âœ… | Percentage (0-100) or fixed VNÄ amount |
| minOrderValue | Decimal | âœ… | Default: 0 |
| maxDiscountAmount | Decimal? | âŒ | Cap for percent discounts |
| usageLimit | Int? | âŒ | Null = unlimited |
| usedCount | Int | âœ… | Default: 0 |
| startDate | DateTime | âœ… | |
| endDate | DateTime | âœ… | |
| isActive | Boolean | âœ… | Default: true |

### Order
Source: model `Order`

| Field | Type | Required | Notes |
|---|---|---|---|
| orderId | String (UUID) | âœ… | PK |
| userId | String? (UUID) | âŒ | FK â†’ users (null for guest orders) |
| couponId | String? (UUID) | âŒ | FK â†’ coupons |
| recipientName | String | âœ… | |
| phone | String | âœ… | |
| fulfillmentType | Enum: `delivery` \| `pickup` | âœ… | |
| deliveryAddress | String? | âŒ | Required if fulfillmentType=delivery |
| deliveryDate | DateTime (Date) | âœ… | |
| deliveryTimeSlot | String | âœ… | E.g. "09:00-11:00" |
| subtotal | Decimal | âœ… | Before discount |
| discountAmount | Decimal | âœ… | Default: 0 |
| shippingFee | Decimal | âœ… | Default: 0 (currently hardcoded to 0) |
| totalAmount | Decimal | âœ… | subtotal - discount + shipping |
| paymentMethod | Enum: `cash` \| `transfer` \| `card` | âœ… | |
| paymentStatus | Enum: `pending` \| `paid` \| `failed` | âœ… | Default: `pending` |
| orderStatus | Enum: `pending` \| `confirmed` \| `processing` \| `ready` \| `delivered` \| `cancelled` | âœ… | Default: `pending` |
| note | String? | âŒ | |
| loyaltyPointsEarned | Int | âœ… | Default: 0 |
| loyaltyPointsUsed | Int | âœ… | Default: 0 |
| createdAt | DateTime | âœ… | Auto |
| updatedAt | DateTime | âœ… | Auto |

### OrderItem
Source: model `OrderItem`

| Field | Type | Required | Notes |
|---|---|---|---|
| orderItemId | String (UUID) | âœ… | PK |
| orderId | String (UUID) | âœ… | FK â†’ orders |
| productId | String (UUID) | âœ… | FK â†’ products (reference only, price is snapshot) |
| productNameSnapshot | String | âœ… | Name at time of order |
| unitPriceSnapshot | Decimal | âœ… | Price at time of order |
| quantity | Int | âœ… | |
| isCustom | Boolean | âœ… | Default: false |
| customNote | String? | âŒ | |
| itemTotal | Decimal | âœ… | (base_price + sum of option prices) Ã— quantity |

### OrderItemOption (snapshot)
Source: model `OrderItemOption`

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | âœ… | PK |
| orderItemId | String (UUID) | âœ… | FK â†’ order_items |
| itemId | String (UUID) | âœ… | FK â†’ option_items |
| optionNameSnapshot | String | âœ… | Option name at time of order |
| optionPriceSnapshot | Decimal | âœ… | Option extra_price at time of order |

### Review
Source: model `Review`

| Field | Type | Required | Notes |
|---|---|---|---|
| reviewId | String (UUID) | âœ… | PK |
| orderItemId | String (UUID) | âœ… | FK â†’ order_items (unique â€” 1 review per item) |
| userId | String (UUID) | âœ… | FK â†’ users |
| rating | Int | âœ… | 1â€“5 |
| comment | String? | âŒ | |
| imageUrl | String? | âŒ | |
| isVisible | Boolean | âœ… | Default: true |
| createdAt | DateTime | âœ… | Auto |

### LoyaltyLog
Source: model `LoyaltyLog`

| Field | Type | Required | Notes |
|---|---|---|---|
| logId | String (UUID) | âœ… | PK |
| userId | String (UUID) | âœ… | FK â†’ users |
| orderId | String (UUID) | âœ… | FK â†’ orders |
| pointsDelta | Int | âœ… | Positive = earned, Negative = spent/revoked |
| reason | String | âœ… | E.g. "order_delivered", "order_cancelled" |
| createdAt | DateTime | âœ… | Auto |

### AnalyticsEvent
Source: model `AnalyticsEvent`

| Field | Type | Required | Notes |
|---|---|---|---|
| eventId | String (UUID) | âœ… | PK |
| sessionId | String | âœ… | Browser session ID (generated by frontend) |
| userId | String? (UUID) | âŒ | FK â†’ users (null for guests) |
| eventType | Enum: `page_view` \| `click` \| `add_to_cart` \| `checkout_start` \| `purchase` | âœ… | |
| pageUrl | String | âœ… | |
| referrer | String? | âŒ | |
| deviceType | String | âœ… | E.g. "desktop", "mobile" |
| os | String | âœ… | E.g. "Windows", "iOS" |
| browser | String | âœ… | E.g. "Chrome" |
| utmSource | String? | âŒ | |
| utmMedium | String? | âŒ | |
| utmCampaign | String? | âŒ | |
| meta | Json? | âŒ | Extra context (e.g. `{ product_id }`) |
| createdAt | DateTime | âœ… | Auto |

---

## Frontend TypeScript model recommendation

```typescript
// src/app/core/models/user.model.ts
export interface User {
  userId: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  authProvider: 'local' | 'google';
  googleId: string | null;
  role: 'member' | 'admin';
  loyaltyPoints: number;
  membershipTier: 'member' | 'bronze' | 'silver' | 'gold' | 'diamond';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

// src/app/core/models/address.model.ts
export interface Address {
  addressId: string;
  userId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

// src/app/core/models/category.model.ts
export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

// src/app/core/models/product.model.ts
export interface Product {
  productId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  thumbnailUrl: string | null;
  isCustomizable: boolean;
  avgRating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  optionGroups?: OptionGroup[];
  category?: Category;
}

export interface ProductImage {
  imageId: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface OptionGroup {
  groupId: string;
  productId: string;
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  sortOrder: number;
  items: OptionItem[];
}

export interface OptionItem {
  itemId: string;
  groupId: string;
  name: string;
  extraPrice: number;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// src/app/core/models/cart.model.ts
export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  thumbnailUrl: string | null;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  optionItemIds: string[];
  options: CartItemOption[];
}

export interface CartItemOption {
  itemId: string;
  name: string;
  extraPrice: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
}

export interface AddCartItemRequest {
  product_id: string;
  quantity: number;
  option_item_ids: string[];
}

// src/app/core/models/order.model.ts
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash' | 'transfer' | 'card';
export type FulfillmentType = 'delivery' | 'pickup';

export interface Order {
  orderId: string;
  userId: string | null;
  couponId: string | null;
  recipientName: string;
  phone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string | null;
  deliveryDate: string;
  deliveryTimeSlot: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  note: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  paymentQrUrl?: string;
  transferContent?: string;
}

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  isCustom: boolean;
  customNote: string | null;
  itemTotal: number;
  options: OrderItemOption[];
}

export interface OrderItemOption {
  id: string;
  itemId: string;
  optionNameSnapshot: string;
  optionPriceSnapshot: number;
}

export interface CreateOrderRequest {
  recipient_name: string;
  email?: string;
  phone: string;
  fulfillment_type: FulfillmentType;
  delivery_address?: string;
  delivery_date: string;
  delivery_time_slot: string;
  coupon_code?: string;
  payment_method: PaymentMethod;
  note?: string;
}

// src/app/core/models/coupon.model.ts
export interface Coupon {
  couponId: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discountAmount: number;
  coupon?: Coupon;
  message?: string;
}

// src/app/core/models/review.model.ts
export interface Review {
  reviewId: string;
  orderItemId: string;
  userId: string;
  rating: number;
  comment: string | null;
  imageUrl: string | null;
  isVisible: boolean;
  createdAt: string;
  user?: { fullName: string; avatarUrl: string | null };
}

// src/app/core/models/loyalty.model.ts
export interface LoyaltySummary {
  loyaltyPoints: number;
  membershipTier: 'member' | 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface LoyaltyLog {
  logId: string;
  userId: string;
  orderId: string;
  pointsDelta: number;
  reason: string;
  createdAt: string;
}

// src/app/core/models/analytics.model.ts
export interface AnalyticsEvent {
  session_id: string;
  event_type: 'page_view' | 'click' | 'add_to_cart' | 'checkout_start' | 'purchase';
  page_url: string;
  referrer?: string;
  device_type: string;
  os: string;
  browser: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  meta?: Record<string, unknown>;
}

// src/app/core/models/pagination.model.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

---

## Unclear fields

| Model | Field | Issue |
|---|---|---|
| Order | `shippingFee` | Currently always 0 in backend (`const DELIVERY_SHIPPING_FEE = 0`). May change in future. Frontend should display it but not calculate. |
| User | `email` or `phone` | At least one must be present, but both can be null individually. Frontend validation must enforce this. |
| Order | guest `email` field in POST body | Not confirmed as required vs optional from Zod schema inspection. ASSUMPTION: optional, used to create inactive guest account. |
| AnalyticsEvent | `session_id` | Frontend is responsible for generating and persisting session ID in `localStorage`. |
