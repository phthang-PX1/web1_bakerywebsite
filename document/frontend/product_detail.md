# product_detail.md

# Mô tả chức năng trang Chi tiết sản phẩm — WeBee Bakery

## 1. Vai trò của trang chi tiết sản phẩm

Trang chi tiết sản phẩm là nơi người dùng xem đầy đủ thông tin của một loại bánh trước khi thêm vào giỏ hàng hoặc mua tiếp.

Trang này cần kết hợp 2 lớp:

1. **Lớp giao diện**: hiển thị đúng thiết kế chi tiết sản phẩm trong Figma.
2. **Lớp chức năng**: dữ liệu sản phẩm, ảnh, biến thể kích thước, giá, đánh giá, tồn kho, mô tả, sản phẩm tương tự và giỏ hàng phải lấy từ dữ liệu thật/backend nếu hệ thống đã có.

Mục tiêu chính:

- Giúp người dùng hiểu rõ sản phẩm.
- Cho phép chọn kích thước/biến thể.
- Cho phép tăng/giảm số lượng.
- Cho phép thêm vào giỏ hàng.
- Hiển thị thông tin giao hàng/đổi trả.
- Hiển thị mô tả món ăn và đánh giá.
- Gợi ý sản phẩm tương tự để tăng cross-sell.
- Dẫn người dùng tiếp tục mua hàng hoặc checkout thông qua Cart Drawer.

---

## 2. Tổng quan bố cục

Trang chi tiết sản phẩm gồm các khu vực chính:

1. Header / Navigation
2. Breadcrumb
3. Member notice bar
4. Product detail hero
   - Product image gallery bên trái
   - Product information bên phải
5. Product information tabs
6. Similar products section
7. Footer
8. Store map

---

# 3. Header / Navigation

## Mục đích

Header giữ vai trò điều hướng toàn website và phải đồng bộ với các trang Home/Product/Cart Drawer.

## Thành phần giao diện

- Logo WeBee.
- Menu:
  - Trang chủ
  - Sản phẩm
  - Tùy chỉnh bánh
  - Blog
  - Chính sách
  - Thành viên
- Icon tìm kiếm.
- Icon giỏ hàng có badge số lượng.
- Button đăng nhập hoặc user menu.

## Trạng thái active

Menu `Sản phẩm` đang active vì trang chi tiết thuộc module sản phẩm.

## Chức năng

- Logo click về `/`.
- Menu `Sản phẩm` click về `/products`.
- Search mở modal/tới `/search`.
- Cart icon mở Cart Drawer trên trang hiện tại.
- Login button thay đổi theo auth state.

## API/state liên quan

```txt
GET /auth/me
GET /cart
```

---

# 4. Breadcrumb

## Giao diện trong ảnh

Breadcrumb nằm dưới header:

```txt
Trang chủ > Sản phẩm > Bánh Mousse Lạnh > Bánh Mousse Nhãn
```

## Mục đích

Giúp người dùng biết vị trí hiện tại và quay lại danh mục/sản phẩm.

## Chức năng

Mỗi cấp breadcrumb nên có điều hướng:

| Label | Route gợi ý |
|---|---|
| Trang chủ | `/` |
| Sản phẩm | `/products` |
| Bánh Mousse Lạnh | `/products?category=banh-mousse-lanh` |
| Bánh Mousse Nhãn | current page |

## Dữ liệu

Breadcrumb có thể được dựng từ:

- Product category.
- Product name.
- Parent category nếu có.

Nếu backend không trả category hoặc slug, breadcrumb chỉ nên hiển thị phần đã xác nhận.

## Model liên quan

```ts
export interface BreadcrumbItem {
  label: string;
  url?: string;
  isCurrent?: boolean;
}
```

---

# 5. Member notice bar

## Giao diện

Thanh thông báo nằm dưới breadcrumb:

```txt
Đăng nhập thành viên để nhận ưu đãi và tích điểm mỗi đơn hàng
```

## Chức năng

Chỉ hiển thị khi user chưa đăng nhập.

Nếu user chưa đăng nhập:

- Hiển thị notice.
- Click vào notice có thể chuyển đến `/login` hoặc `/register`.

Nếu user đã đăng nhập:

- Ẩn notice.
- Hoặc thay bằng thông tin thành viên nếu backend có membership.

Ví dụ:

```txt
Bạn đang là thành viên Gold. Đơn hàng này có thể tích 36 điểm.
```

## API/state liên quan

```txt
GET /auth/me
GET /membership/me       optional
```

---

# 6. Product detail hero

Product detail hero là phần quan trọng nhất của trang, gồm image gallery bên trái và thông tin mua hàng bên phải.

---

## 6.1. Product image gallery

## Giao diện

Bên trái hiển thị:

- Ảnh chính lớn.
- Danh sách thumbnail bên dưới.
- Thumbnail đang chọn có border/highlight.

## Chức năng

### Ảnh chính

- Hiển thị ảnh sản phẩm đang được chọn.
- Ảnh cần lấy từ product images backend.
- Nếu không có ảnh, hiển thị placeholder.

### Thumbnail

Click thumbnail:

- Đổi ảnh chính tương ứng.
- Highlight thumbnail active.
- Không reload trang.

### Image zoom/lightbox

Không bắt buộc theo thiết kế hiện tại, nhưng có thể hỗ trợ sau:

- Click ảnh chính mở lightbox.
- Hover zoom trên desktop.

## Dữ liệu cần có

```ts
export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}
```

## Fallback

Nếu backend chỉ có `imageUrl` đơn:

- Dùng ảnh đó làm ảnh chính.
- Không hiển thị thumbnail hoặc chỉ hiển thị 1 thumbnail.

---

## 6.2. Product information panel

## Giao diện trong ảnh

Bên phải gồm:

- Tên category nhỏ phía trên.
- Tên sản phẩm.
- Rating + số đánh giá.
- Mô tả ngắn.
- Giá.
- Chọn kích thước.
- Chọn số lượng.
- Button thêm vào giỏ.
- Thông tin vận chuyển/đổi trả.

Ví dụ:

```txt
BÁNH MOUSSE LẠNH
Bánh Mousse Nhãn
4.7 (12 đánh giá)
360.000đ
Kích thước: 20cm / 24cm
Số lượng: - 1 +
Thêm vào giỏ
Vận chuyển: Giao hoả tốc 30-45'
Đổi trả: Miễn trong 24h
```

---

# 7. Product data behavior

## Dữ liệu sản phẩm phải là dữ liệu động

Trang chi tiết phải lấy thông tin sản phẩm từ backend theo `id` hoặc `slug`.

Không hardcode:

- Tên sản phẩm.
- Giá.
- Rating.
- Số đánh giá.
- Mô tả.
- Kích thước.
- Ảnh.
- Tồn kho.
- Sản phẩm tương tự.

## Route đề xuất

Ưu tiên dùng slug để SEO và dễ đọc:

```txt
/products/:slug
```

Nếu backend chưa có slug:

```txt
/products/:id
```

## API liên quan

```txt
GET /products/:slug
```

hoặc:

```txt
GET /products/:id
```

Nếu backend chưa có endpoint chi tiết sản phẩm:

```txt
TODO_BACKEND: Need product detail endpoint.
```

## Product detail model đề xuất

```ts
export interface ProductDetail {
  id: string;
  slug?: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  ratingAverage?: number;
  reviewCount?: number;
  soldCount?: number;
  stockQuantity?: number;
  images: ProductImage[];
  variants?: ProductVariant[];
  details?: ProductDetailContent;
  policies?: ProductPolicyInfo;
  isActive: boolean;
}
```

---

# 8. Rating và đánh giá

## Giao diện

Hiển thị:

```txt
★ 4.7 (12 đánh giá)
```

## Chức năng

- Rating trung bình lấy từ backend.
- Review count lấy từ backend.
- Click vào rating hoặc `đánh giá` có thể scroll xuống tab `Đánh giá`.

Nếu chưa có đánh giá:

```txt
Chưa có đánh giá
```

Không hardcode rating nếu backend có dữ liệu thật.

## API liên quan

```txt
GET /products/:id/reviews
```

hoặc product detail response trả kèm:

```txt
ratingAverage
reviewCount
```

Nếu chưa có review API:

```txt
TODO_BACKEND: Need product rating/review data or fallback display rule.
```

---

# 9. Product short description

## Giao diện

Mô tả ngắn nằm dưới rating.

Ví dụ trong ảnh:

```txt
Sự kết hợp tinh tế giữa lớp mousse kem mịn màng và hương vị thanh của nhãn lồng tươi...
```

## Chức năng

- Hiển thị `shortDescription` từ backend.
- Nếu không có shortDescription, có thể lấy đoạn đầu của `description`.
- Giới hạn số dòng nếu mô tả quá dài.

Không nên hardcode mô tả theo ảnh.

---

# 10. Giá sản phẩm

## Giao diện

```txt
360.000đ
```

## Chức năng

Giá phải lấy từ backend và format theo VND.

```ts
formatCurrency(product.price, 'VND')
```

Nếu có giá khuyến mãi:

- Hiển thị giá hiện tại nổi bật.
- Hiển thị giá gốc gạch ngang nếu design cho phép.
- Có thể hiển thị badge giảm giá.

Nếu sản phẩm có biến thể giá khác nhau:

- Giá thay đổi theo biến thể được chọn.
- Nếu chưa chọn biến thể, hiển thị giá từ thấp nhất hoặc giá mặc định.

Ví dụ:

```txt
Từ 360.000đ
```

---

# 11. Chọn kích thước / biến thể

## Giao diện trong ảnh

Label:

```txt
Kích thước:
```

Options:

```txt
20cm
24cm
```

## Chức năng

Kích thước phải là biến thể sản phẩm, không hardcode nếu backend có variants.

Khi user chọn size:

- Cập nhật selected variant.
- Cập nhật giá nếu variant có giá riêng.
- Cập nhật tồn kho nếu variant có stock riêng.
- Cập nhật trạng thái button thêm vào giỏ.
- Có thể cập nhật ảnh nếu variant có ảnh riêng.

## Model đề xuất

```ts
export interface ProductVariant {
  id: string;
  name: string;
  optionName?: string;
  size?: string;
  price?: number;
  stockQuantity?: number;
  sku?: string;
  imageUrl?: string;
  isActive: boolean;
}
```

## Rule

- Nếu sản phẩm có variants, user phải chọn variant trước khi add to cart.
- Nếu chỉ có 1 variant mặc định, có thể auto-select.
- Nếu variant hết hàng, disable option hoặc hiển thị `Hết hàng`.

## Add to cart payload

```ts
export interface AddCartItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  note?: string;
}
```

---

# 12. Quantity stepper

## Giao diện

```txt
Số lượng: - 1 +
```

## Chức năng

- Mặc định quantity = 1.
- Click `+` tăng số lượng.
- Click `-` giảm số lượng.
- Không cho quantity nhỏ hơn 1.
- Không cho quantity vượt `stockQuantity` nếu có.
- Nếu sản phẩm/variant hết hàng, disable quantity và add-to-cart.

## Validation

Nếu user chọn quá tồn kho:

```txt
Số lượng trong kho không đủ.
```

Nếu backend không có tồn kho:

- Vẫn cho tăng trong giới hạn hợp lý frontend, ví dụ max 99.
- Nhưng nên đánh dấu backend cần trả stock nếu business yêu cầu kiểm soát tồn kho.

---

# 13. Add to cart button

## Giao diện

Button vàng full width:

```txt
Thêm vào giỏ
```

## Chức năng

Khi click:

1. Validate sản phẩm đang active.
2. Validate variant/size đã chọn nếu có.
3. Validate quantity.
4. Gọi API thêm vào giỏ.
5. Cập nhật cart state.
6. Cập nhật cart badge header.
7. Mở Cart Drawer hoặc hiển thị toast.

## Đề xuất UX

Sau khi thêm thành công:

```txt
Tự động mở Cart Drawer
```

Vì hệ thống đã có cơ chế Cart Drawer để xác nhận sản phẩm và gợi ý mua thêm.

## Trạng thái button

| State | UI |
|---|---|
| Normal | `Thêm vào giỏ` |
| Loading | `Đang thêm...` |
| Out of stock | `Hết hàng` |
| Missing variant | disable hoặc thông báo chọn kích thước |
| Error | hiển thị toast lỗi |

## API liên quan

```txt
POST /cart/items
```

Payload:

```json
{
  "productId": "product_id",
  "variantId": "variant_id",
  "quantity": 1
}
```

Nếu user chưa đăng nhập:

- Có thể lưu cart local.
- Hoặc tạo guest cart.
- Hoặc yêu cầu đăng nhập.

Đề xuất UX:

```txt
Cho phép guest add to cart, yêu cầu đăng nhập ở checkout nếu cần.
```

---

# 14. Shipping / return info cards

## Giao diện

Có 2 card nhỏ dưới button:

```txt
Vận chuyển
Giao hoả tốc 30-45'

Đổi trả
Miễn trong 24h
```

## Chức năng

Đây là thông tin chính sách ngắn gọn.

Có thể là:

- Static policy config.
- Hoặc lấy từ backend/site settings.

Click vào mỗi card có thể:

- Mở policy modal.
- Điều hướng đến trang chính sách tương ứng.

Route gợi ý:

```txt
/policies/shipping
/policies/return
```

## Data model

```ts
export interface ProductPolicyInfo {
  shippingText?: string;
  returnText?: string;
}
```

Nếu tất cả sản phẩm dùng chung chính sách, nên đặt trong config:

```txt
src/app/shared/config/policy-summary.config.ts
```

---

# 15. Product information tabs

## Giao diện

Có 2 tab:

```txt
Mô tả món ăn
Đánh giá
```

Tab `Mô tả món ăn` đang active.

## Chức năng

### Tab Mô tả món ăn

Hiển thị chi tiết sản phẩm gồm các nhóm nội dung:

- Hương vị
- Cấu trúc bánh
- Cách bảo quản
- Phụ kiện tặng kèm

Nội dung ví dụ trong ảnh:

```txt
Hương vị
Thanh mát - Ngọt dịu - Béo nhẹ

Cấu trúc bánh
Phần thân bánh gồm 3 lớp đan xen tinh tế:
- Đế bông lan chocolate...
- Mousse nhãn...
- Lớp nhãn...
```

## Dữ liệu

Nội dung nên lấy từ backend nếu sản phẩm có rich detail.

Gợi ý model:

```ts
export interface ProductDetailContent {
  flavor?: string;
  cakeStructure?: string[];
  storageInstruction?: string;
  includedAccessories?: string[];
  rawDescriptionHtml?: string;
}
```

Nếu backend chỉ có `description` dạng text/html:

- Hiển thị description.
- Không tự tách thành các nhóm nếu không có dữ liệu rõ.

### Tab Đánh giá

Khi click tab `Đánh giá`:

- Hiển thị danh sách đánh giá.
- Có rating summary nếu backend có.
- Có thể có form viết đánh giá nếu user đã mua hàng.

Nếu chưa có review backend:

```txt
TODO_BACKEND: Product review API is required for review tab.
```

Empty state:

```txt
Sản phẩm chưa có đánh giá nào.
```

## API liên quan

```txt
GET /products/:id/reviews?page=1&limit=10
POST /products/:id/reviews
```

---

# 16. Similar products section

## Giao diện

Title:

```txt
Sản phẩm tương tự
```

Hiển thị 4 product cards ngang.

Có nút mũi tên bên phải để xem thêm/scroll carousel.

## Mục đích

Gợi ý các sản phẩm liên quan để tăng khả năng mua thêm.

## Logic dữ liệu

Sản phẩm tương tự không nên hardcode.

Thứ tự ưu tiên logic:

1. Sản phẩm cùng category.
2. Sản phẩm cùng tag/hương vị/kích thước.
3. Sản phẩm bán chạy trong cùng category.
4. Sản phẩm mới trong cùng category.
5. Fallback sản phẩm bán chạy toàn shop.

Không hiển thị sản phẩm hiện tại trong danh sách tương tự.

## API liên quan

```txt
GET /products/:id/related?limit=4
```

Hoặc:

```txt
GET /products?categoryId=...&exclude=productId&limit=4
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need related products endpoint or query support.
```

## Chức năng product card

Mỗi sản phẩm tương tự:

- Click ảnh/tên sản phẩm → chuyển đến chi tiết sản phẩm đó.
- Click `Thêm vào giỏ` → thêm nhanh vào cart.
- Sau khi thêm thành công → mở Cart Drawer hoặc toast.

## Important behavior

Khi user click sang sản phẩm tương tự:

- Route đổi sang product detail mới.
- Page phải fetch lại dữ liệu sản phẩm mới.
- Gallery, variants, mô tả, related products phải cập nhật theo sản phẩm mới.

---

# 17. Footer

Footer giống các trang Home/Product và nên dùng component chung.

## Thành phần

- Logo WeBee.
- Mô tả thương hiệu.
- Social icons.
- Liên kết nhanh.
- Liên hệ.
- Chính sách & hướng dẫn.
- Map.
- Copyright.

## Chức năng

- Link điều hướng đúng route.
- Social link mở tab mới.
- Email click mở mail client.
- Phone click mở call trên mobile.
- Map hiển thị vị trí cửa hàng.

## Gợi ý component

```txt
src/app/shared/components/site-footer/
```

Không duplicate footer riêng cho từng trang.

---

# 18. Loading, empty, error states

## Product detail loading

Khi đang tải sản phẩm:

- Hiển thị skeleton cho image gallery.
- Hiển thị skeleton cho product info.
- Footer/header vẫn có thể hiển thị.

## Product not found

Nếu API trả 404:

```txt
Không tìm thấy sản phẩm.
```

CTA:

```txt
Quay lại danh sách sản phẩm
```

Route:

```txt
/products
```

## API error

Nếu lỗi server/network:

```txt
Không thể tải thông tin sản phẩm. Vui lòng thử lại.
```

CTA:

```txt
Thử lại
```

## Related products error

Nếu related products lỗi:

- Không làm hỏng toàn trang.
- Chỉ hiển thị empty/error nhỏ ở section tương tự.

---

# 19. URL/state behavior

## Route

```txt
/products/:slug
```

hoặc:

```txt
/products/:id
```

## Query optional

Nếu cần mở trực tiếp tab đánh giá:

```txt
/products/banh-mousse-nhan?tab=reviews
```

Nếu cần chọn variant từ URL:

```txt
/products/banh-mousse-nhan?variant=20cm
```

Không bắt buộc, nhưng có thể hỗ trợ nếu cần.

## State cần giữ

- Selected image index.
- Selected variant.
- Quantity.
- Active tab.

Các state này có thể reset khi đổi sang sản phẩm khác.

---

# 20. Backend/API checklist cho Product Detail

Agent/frontend developer cần kiểm tra backend có endpoint hoặc dữ liệu tương ứng không.

## Required endpoints

```txt
GET /products/:id hoặc GET /products/:slug
POST /cart/items
GET /cart
```

## Recommended endpoints

```txt
GET /products/:id/related?limit=4
GET /products/:id/reviews?page=1&limit=10
```

## Optional endpoints

```txt
GET /auth/me
GET /membership/me
GET /site-settings
```

## Product fields cần có

```txt
id
slug
name
categoryId
categoryName
categorySlug
shortDescription
description
price
originalPrice
ratingAverage
reviewCount
soldCount
stockQuantity
images
variants
isActive
createdAt
updatedAt
```

## Variant fields cần có

```txt
id
name
size
price
stockQuantity
sku
imageUrl
isActive
```

## Review fields cần có

```txt
id
userName
rating
comment
createdAt
images
```

---

# 21. Angular implementation proposal

## Route

```txt
/products/:slug
```

hoặc theo backend:

```txt
/products/:id
```

## Feature folder

```txt
src/app/features/products/
  products.routes.ts
  pages/
    product-detail/
      product-detail.page.ts
      product-detail.page.html
      product-detail.page.scss
  components/
    product-gallery/
    product-info-panel/
    product-detail-tabs/
    related-products/
```

## Shared components nên dùng lại

```txt
src/app/shared/components/
  product-card/
  quantity-stepper/
  site-header/
  site-footer/
  loading-state/
  empty-state/
  error-state/
  rating-display/
```

## Core API services

```txt
src/app/core/api/products.api.ts
src/app/core/api/cart.api.ts
src/app/core/api/reviews.api.ts
```

## Product API service methods đề xuất

```ts
getProductById(id: string): Observable<ProductDetail>
getProductBySlug(slug: string): Observable<ProductDetail>
getRelatedProducts(productId: string, limit?: number): Observable<ProductListItem[]>
getProductReviews(productId: string, params?: ReviewQuery): Observable<ReviewListResponse>
```

## Cart API service method

```ts
addItem(payload: AddCartItemRequest): Observable<Cart>
```

---

# 22. Relationship with Cart Drawer

Trang chi tiết sản phẩm phải kết nối trực tiếp với Cart Drawer.

## Flow thêm vào giỏ

1. User chọn size.
2. User chọn quantity.
3. User click `Thêm vào giỏ`.
4. Gọi `POST /cart/items`.
5. Cập nhật cart state.
6. Header cart badge tăng.
7. Cart Drawer mở ra trên chính trang detail.
8. User có thể checkout hoặc tiếp tục xem sản phẩm.

## Rule

Không tự chuyển user sang trang cart sau khi add nếu UX chính là Cart Drawer.

Chỉ chuyển sang `/cart` hoặc `/checkout` khi user click CTA trong Cart Drawer.

---

# 23. Responsive behavior

## Desktop

- Layout 2 cột:
  - Gallery bên trái.
  - Info panel bên phải.
- Product tabs full width bên dưới.
- Related products 4 cột.
- Footer 4 cột.

## Tablet

- Gallery và info có thể vẫn 2 cột nếu đủ rộng.
- Related products 2–3 cột.
- Tabs full width.

## Mobile

- Gallery lên trên.
- Info panel dưới gallery.
- Variant/quantity/button full width.
- Sticky add-to-cart bar có thể cân nhắc nếu cần.
- Related products horizontal scroll hoặc 1–2 cột.
- Footer 1 cột.

---

# 24. Design tokens suy ra từ ảnh

> Các giá trị dưới đây là suy luận từ ảnh, cần đối chiếu lại với Figma nếu có file gốc.

## Màu sắc

```txt
Primary Yellow: #F4C542 hoặc tương đương
Dark Brown: #3B2A1E
Medium Brown: #6B4A20
Cream Background: #F7F3EA
Light Cream: #FBF8F1
White: #FFFFFF
Border Light: #E8E0D2
Text Primary: #3A2A22
Text Secondary: #6F625A
Success/Policy Accent: #8B7A27
```

## Typography

```txt
Product name: 36–44px, bold
Category label: 12–13px, uppercase, bold
Price: 28–32px, bold
Body: 14–16px
Tab label: 14–15px, medium
Section title: 26–30px, bold
```

## Layout

```txt
Page max width: 1200–1280px
Hero gap: 32–40px
Gallery image radius: 12–16px
Thumbnail size: 72–88px
Button radius: pill hoặc 12–16px
Info card radius: 12–16px
Related product grid: 4 columns desktop
```

---

# 25. Acceptance criteria

Trang chi tiết sản phẩm đạt yêu cầu khi:

## Header/Breadcrumb

- Header giống các trang khác.
- Menu `Sản phẩm` active.
- Breadcrumb hiển thị đúng theo product/category thật.
- Cart icon mở Cart Drawer.

## Product data

- Sản phẩm được lấy từ backend theo id/slug.
- Không hardcode tên, giá, rating, mô tả, ảnh, size.
- Nếu sản phẩm không tồn tại, hiển thị not found state.

## Gallery

- Ảnh chính hiển thị đúng.
- Thumbnail đổi ảnh chính khi click.
- Có fallback nếu chỉ có một ảnh.

## Product info

- Hiển thị category, tên, rating, mô tả ngắn, giá.
- Giá format đúng VND.
- Variant size lấy từ product variants.
- Quantity không nhỏ hơn 1 và không vượt tồn kho nếu có.

## Add to cart

- Validate size/quantity.
- Add to cart gọi API/cart service.
- Cập nhật cart badge.
- Mở Cart Drawer sau khi thêm thành công.
- Có loading/error state.

## Tabs

- Tab `Mô tả món ăn` hiển thị nội dung chi tiết.
- Tab `Đánh giá` hiển thị review data hoặc empty/TODO_BACKEND nếu chưa có.
- Tab chuyển đổi không reload trang.

## Similar products

- Sản phẩm tương tự lấy từ backend hoặc query theo category.
- Không hiển thị sản phẩm hiện tại.
- Product card dùng lại component chung.
- Add to cart từ sản phẩm tương tự hoạt động.

## Footer

- Footer dùng component chung.
- Link/contact/map hoạt động đúng.

## Technical

- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Không duplicate cart logic.
- Có loading, empty, error state.
- Responsive desktop/tablet/mobile cơ bản.
- Text tiếng Việt hiển thị đúng encoding.
