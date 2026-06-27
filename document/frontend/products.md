# products.md

# Mô tả chức năng trang Product/Menu Bánh — WeBee Bakery

## 1. Vai trò của trang Product

Trang Product/Menu Bánh là trang danh sách sản phẩm chính của WeBee Bakery. Trang này không chỉ hiển thị sản phẩm dạng grid, mà còn phải hỗ trợ người dùng:

- Xem danh sách bánh đang được bán.
- Lọc sản phẩm theo giá trị/giá tiền.
- Lọc sản phẩm theo danh mục.
- Sắp xếp sản phẩm.
- Xem rating và giá sản phẩm.
- Thêm sản phẩm vào giỏ hàng.
- Phân trang hoặc tải thêm sản phẩm.
- Điều hướng đến chi tiết sản phẩm.
- Xem footer, thông tin liên hệ và bản đồ cửa hàng.

Lưu ý: thanh đỏ/ngang bên dưới header trong ảnh **không đưa vào thiết kế chính thức**.

---

## 2. Tổng quan bố cục

Trang Product gồm các khu vực chính:

1. Header / Navigation
2. Page title + sort control
3. Member notice bar
4. Product listing layout
   - Sidebar filter bên trái
   - Product grid bên phải
5. Pagination / Load more
6. Footer
7. Store map

---

# 3. Header / Navigation

## Mục đích

Header giúp người dùng điều hướng toàn website và theo dõi trạng thái đăng nhập/giỏ hàng.

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

Menu `Sản phẩm` đang active.

Active state:

- Text màu nâu đậm hoặc vàng thương hiệu.
- Underline mảnh màu vàng bên dưới `Sản phẩm`.

## Chức năng cần có

### Logo

Click về trang Home:

```txt
/
```

### Menu Sản phẩm

Có thể là dropdown nếu hệ thống có nhiều nhóm sản phẩm.

Ví dụ:

```txt
/products
/products?category=banh-gato
/products?category=banh-mousse
```

### Search

Click icon search mở search modal hoặc điều hướng đến:

```txt
/search
```

Search nên hỗ trợ tìm sản phẩm theo:

- Tên bánh
- Danh mục
- Mô tả
- Tag/hương vị nếu backend có

### Cart badge

Badge giỏ hàng phải lấy từ cart state/API, không hardcode.

Nguồn dữ liệu:

```txt
GET /cart
```

hoặc global cart state/localStorage nếu user chưa đăng nhập.

### Login button

Nếu chưa đăng nhập:

```txt
Đăng nhập
```

Nếu đã đăng nhập:

- Hiển thị tài khoản/user menu.
- Có thể có link:
  - Tài khoản của tôi
  - Đơn hàng của tôi
  - Điểm thành viên
  - Đăng xuất

---

# 4. Page title và sort control

## Giao diện

Title:

```txt
Menu Bánh
```

Sort dropdown nằm bên phải.

Label:

```txt
Sắp xếp theo:
```

Giá trị mặc định trong thiết kế:

```txt
Mặc định
```

## Chức năng sort

Sort dropdown phải thay đổi thứ tự sản phẩm dựa trên dữ liệu thật.

Các option đề xuất:

| Label hiển thị | Query value | Ý nghĩa |
|---|---|---|
| Mặc định | `default` | Thứ tự mặc định từ backend hoặc displayOrder |
| Mới nhất | `newest` | Sắp xếp theo createdAt giảm dần |
| Bán chạy | `best-selling` | Sắp xếp theo soldCount/order data |
| Giá thấp đến cao | `price-asc` | Giá tăng dần |
| Giá cao đến thấp | `price-desc` | Giá giảm dần |
| Đánh giá cao | `rating-desc` | Rating trung bình giảm dần |

Khi user đổi sort:

- Cập nhật query params trên URL.
- Gọi lại API product list.
- Reset pagination về page 1.

Ví dụ URL:

```txt
/products?sort=price-asc&page=1
```

## API liên quan

```txt
GET /products?sort=default&page=1&limit=9
```

Nếu backend chưa hỗ trợ sort:

```txt
TODO_BACKEND: Product API needs sorting support for Product page.
```

---

# 5. Member notice bar

## Giao diện

Trong ảnh có thanh thông báo dưới title:

```txt
Đăng nhập thành viên để nhận ưu đãi và tích điểm mỗi đơn hàng
```

## Chức năng

Thanh này chỉ nên hiển thị cho user chưa đăng nhập.

Nếu user chưa đăng nhập:

- Hiển thị notice.
- Có thể click để chuyển đến `/login` hoặc `/register`.

Nếu user đã đăng nhập:

- Ẩn notice, hoặc
- Hiển thị thông tin điểm/hạng thành viên nếu backend có membership.

Ví dụ:

```txt
Bạn đang là thành viên Gold. Điểm hiện có: 1.250
```

## API/state liên quan

```txt
GET /auth/me
GET /membership/me       optional
```

Nếu chưa có membership API, chỉ dùng auth state để ẩn/hiện notice.

---

# 6. Sidebar filter

Sidebar bên trái dùng để lọc danh sách sản phẩm.

## 6.1. Filter theo giá trị/giá tiền

### Giao diện

Title:

```txt
LỌC THEO GIÁ TRỊ
```

Có range slider từ giá thấp nhất đến cao nhất.

Trong ảnh:

```txt
0đ — 999.999đ
```

## Chức năng

Người dùng có thể kéo range để lọc sản phẩm theo giá.

Filter giá cần:

- Có giá min.
- Có giá max.
- Hiển thị giá trị đang chọn.
- Gọi lại API khi user apply filter hoặc sau khi debounce.

Khuyến nghị UX:

- Nếu dùng slider, nên có debounce 300–500ms.
- Hoặc có nút `Áp dụng` để tránh gọi API quá nhiều.
- Khi đổi filter giá, reset page về 1.
- Cập nhật query params.

Ví dụ URL:

```txt
/products?minPrice=0&maxPrice=500000&page=1
```

## API liên quan

```txt
GET /products?minPrice=0&maxPrice=500000
```

Nếu backend chưa hỗ trợ lọc giá:

```txt
TODO_BACKEND: Product API needs minPrice/maxPrice filtering.
```

---

## 6.2. Filter theo danh mục sản phẩm

### Giao diện

Title:

```txt
DANH MỤC SẢN PHẨM
```

Checkbox list:

- Bánh Gato
- Bánh Entremet
- Bánh Mousse
- Tiramisu
- Mini Cakes
- Bánh Nướng

## Chức năng

Danh mục phải lấy từ backend nếu hệ thống có quản lý danh mục.

Không nên hardcode danh mục nếu backend đã có bảng/category collection.

Mỗi checkbox:

- Đại diện cho một category id/slug.
- Có thể chọn một hoặc nhiều danh mục.
- Khi thay đổi, cập nhật query params và gọi lại product API.

Ví dụ URL:

```txt
/products?categories=banh-gato,banh-mousse
```

hoặc:

```txt
/products?categoryIds=cat_1,cat_2
```

## Logic hiển thị

- Chỉ hiển thị category active.
- Sắp xếp theo displayOrder nếu backend có.
- Nếu backend không có icon/category detail, chỉ hiển thị tên.

## API liên quan

```txt
GET /categories?isActive=true
GET /products?categoryIds=...
```

Nếu backend chưa có category API:

```txt
TODO_BACKEND: Need category API for Product page filter.
```

---

# 7. Product grid

## Mục đích

Hiển thị danh sách sản phẩm phù hợp với filter/sort hiện tại.

## Giao diện

Product grid nằm bên phải sidebar.

Desktop hiện tại:

- 3 cột sản phẩm.
- Khoảng cách giữa các card rộng, thoáng.
- Card nền trắng, bo góc, shadow nhẹ.
- Ảnh sản phẩm phía trên.
- Thông tin sản phẩm phía dưới.
- Button thêm vào giỏ full width.

## Sản phẩm trong ảnh

Ví dụ sản phẩm đang hiển thị:

- Bánh Mousse Việt Quất
- Tiramisu Chocolate
- Bánh Mousse Nhãn
- Bánh Kem Dâu Tây
- Bánh Kem Biển Ngọc
- Bánh Kem Mây Xanh
- Bộ Sưu Tập Minicake

Các sản phẩm này chỉ là dữ liệu minh họa/design. Khi implement thật, danh sách phải lấy từ API sản phẩm.

## Product card cần hiển thị

Mỗi product card gồm:

- Ảnh sản phẩm.
- Tên sản phẩm.
- Rating icon sao.
- Rating trung bình.
- Số đánh giá.
- Giá bán.
- Button `Thêm vào giỏ`.

Có thể bổ sung nếu backend có:

- Badge `Mới`
- Badge `Bán chạy`
- Badge `Hết hàng`
- Giá gốc/giá khuyến mãi
- Số lượng đã bán

## Click behavior

### Click ảnh hoặc tên sản phẩm

Điều hướng đến trang chi tiết sản phẩm:

```txt
/products/:slug
```

hoặc:

```txt
/products/:id
```

Ưu tiên dùng slug nếu backend có.

### Click `Thêm vào giỏ`

Khi click:

1. Kiểm tra sản phẩm còn hàng.
2. Gọi API thêm vào giỏ.
3. Cập nhật cart badge ở header.
4. Hiển thị toast/snackbar thành công.
5. Không reload trang.

Thông báo đề xuất:

```txt
Đã thêm vào giỏ hàng.
```

Nếu lỗi:

```txt
Không thể thêm sản phẩm vào giỏ. Vui lòng thử lại.
```

Nếu hết hàng:

```txt
Hết hàng
```

Button nên disabled.

## API liên quan

```txt
GET /products
GET /products/:id hoặc GET /products/:slug
POST /cart/items
GET /cart
```

---

# 8. Product list data behavior

## Dữ liệu sản phẩm phải là dữ liệu động

Trang Product không nên dùng danh sách sản phẩm tĩnh nếu backend đã có products.

Product list phải phản ánh:

- Sản phẩm đang active/available.
- Giá hiện tại.
- Tồn kho hiện tại nếu có.
- Rating/review count nếu có.
- Kết quả lọc danh mục.
- Kết quả lọc giá.
- Thứ tự sort.
- Page hiện tại.

## Query params đề xuất

```txt
/products?page=1&limit=9&sort=default&minPrice=0&maxPrice=999999&categoryIds=...
```

## Model đề xuất

```ts
export interface ProductListItem {
  id: string;
  slug?: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  ratingAverage?: number;
  reviewCount?: number;
  soldCount?: number;
  stockQuantity?: number;
  isActive: boolean;
  categoryId?: string;
  categoryName?: string;
  badges?: string[];
}
```

## List response đề xuất

```ts
export interface ProductListResponse {
  data: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

Nếu backend response khác, frontend model phải bám theo backend thật và document lại trong `schema.md`.

---

# 9. Pagination / Load more

## Giao diện trong ảnh

Bên dưới product grid có:

- Pagination dạng số: `1 2 3 4 ...`
- Button:

```txt
Xem thêm sản phẩm
```

## Khuyến nghị chọn một logic chính

Không nên dùng đồng thời cả pagination số và load more nếu gây mơ hồ.

Có 2 phương án:

### Phương án A — Pagination số

User click page 1, 2, 3, 4 để chuyển trang.

Phù hợp khi:

- Backend hỗ trợ page/limit.
- Người dùng cần đi đến trang cụ thể.

URL:

```txt
/products?page=2
```

### Phương án B — Load more

User click `Xem thêm sản phẩm` để tải thêm sản phẩm vào grid hiện tại.

Phù hợp khi:

- Trải nghiệm mua sắm liên tục.
- Mobile-friendly.

URL có thể giữ page hoặc dùng cursor.

## Đề xuất cho thiết kế hiện tại

Vì ảnh đang có cả pagination số và button `Xem thêm sản phẩm`, nên có thể hiểu:

- Pagination số là điều hướng page chính.
- Button `Xem thêm sản phẩm` là CTA để load page tiếp theo.

Tuy nhiên để UX rõ hơn, nên chọn một:

```txt
Đề xuất: dùng pagination số trên desktop, dùng load more trên mobile.
```

## API liên quan

```txt
GET /products?page=1&limit=9
```

Nếu dùng load more:

```txt
GET /products?page=2&limit=9
```

hoặc:

```txt
GET /products?cursor=...
```

---

# 10. Empty, loading, error states

Trang Product phụ thuộc nhiều vào dữ liệu động, nên bắt buộc có state rõ ràng.

## Loading state

Hiển thị skeleton card hoặc loading spinner trong grid.

Không nên để trang trắng.

## Empty state

Khi không có sản phẩm phù hợp filter:

```txt
Không tìm thấy sản phẩm phù hợp.
```

Nên có action:

```txt
Xóa bộ lọc
```

## Error state

Khi API lỗi:

```txt
Không thể tải danh sách sản phẩm. Vui lòng thử lại.
```

Có button:

```txt
Thử lại
```

## Filter loading

Khi filter/sort thay đổi:

- Có thể giữ layout cũ và show loading nhẹ.
- Tránh layout shift mạnh.

---

# 11. Filter state và URL state

Filter/sort/page nên được lưu trên URL query params.

Mục đích:

- User có thể copy/share URL.
- Refresh page không mất filter.
- Back/forward browser hoạt động đúng.

Ví dụ:

```txt
/products?categoryIds=banh-mousse&minPrice=200000&maxPrice=600000&sort=price-asc&page=1
```

Khi user thay đổi:

- Sort
- Category checkbox
- Price range

thì cần:

1. Update query params.
2. Reset page về 1, trừ khi chỉ đổi page.
3. Gọi lại product API.

---

# 12. Footer

Footer giống trang Home và nên dùng component chung.

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

Không nên duplicate footer riêng cho Home và Product.

---

# 13. Design tokens suy ra từ ảnh

> Các giá trị dưới đây là suy luận từ ảnh, cần đối chiếu với Figma nếu có file gốc.

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
```

## Typography

```txt
Page title: 28–32px, bold
Product name: 15–17px, semi-bold
Price: 16–18px, bold
Filter title: 12–13px, bold, uppercase
Nav: 13–15px
Body: 14–16px
```

## Layout

```txt
Page max width: 1200–1280px
Sidebar width: khoảng 240–280px
Product grid: 3 columns desktop
Card radius: 14–18px
Card shadow: nhẹ
Button radius: pill hoặc 12–999px
Section spacing: 32–56px
```

---

# 14. Responsive behavior

## Desktop

- Header ngang.
- Sidebar filter bên trái.
- Product grid 3 cột.
- Footer 4 cột.

## Tablet

- Sidebar có thể nằm trên grid hoặc thu gọn thành filter panel.
- Product grid 2 cột.
- Sort control vẫn ở đầu danh sách.

## Mobile

- Header chuyển sang mobile menu.
- Filter sidebar chuyển thành bottom sheet/drawer.
- Product grid 1 cột hoặc 2 cột tùy kích thước card.
- Sort dropdown nằm trên grid.
- Pagination có thể đổi thành `Xem thêm sản phẩm`.
- Footer 1 cột.
- Map full width.

---

# 15. Angular implementation proposal

## Route

```txt
/products
```

## Feature folder

```txt
src/app/features/products/
  products.routes.ts
  pages/
    product-list/
      product-list.page.ts
      product-list.page.html
      product-list.page.scss
  components/
    product-filter-sidebar/
    product-sort-bar/
    product-grid/
```

## Shared components nên dùng lại

```txt
src/app/shared/components/
  product-card/
  site-header/
  site-footer/
  loading-state/
  empty-state/
  error-state/
  pagination/
```

## Core API services

```txt
src/app/core/api/products.api.ts
src/app/core/api/categories.api.ts
src/app/core/api/cart.api.ts
```

## Product API service methods đề xuất

```ts
getProducts(params: ProductListQuery): Observable<ProductListResponse>
getProductById(id: string): Observable<ProductDetail>
getProductBySlug(slug: string): Observable<ProductDetail>
```

## Category API service methods

```ts
getCategories(params?: CategoryQuery): Observable<Category[]>
```

## Cart API service methods

```ts
addItem(payload: AddCartItemRequest): Observable<Cart>
getCart(): Observable<Cart>
```

---

# 16. Backend/API checklist cho Product page

Agent/frontend developer cần kiểm tra backend có các endpoint hoặc khả năng tương đương không.

## Required endpoints

```txt
GET /products
GET /categories
POST /cart/items
GET /cart
```

## Recommended product query support

```txt
page
limit
sort
minPrice
maxPrice
categoryIds/category
search
isActive
```

## Optional endpoints

```txt
GET /products/:id
GET /products/:slug
GET /auth/me
GET /membership/me
```

## Product fields cần có

```txt
id
slug
name
imageUrl
price
originalPrice
ratingAverage
reviewCount
soldCount
stockQuantity
isActive
categoryId
categoryName
createdAt
```

## Category fields cần có

```txt
id
name
slug
isActive
displayOrder
```

---

# 17. Acceptance criteria

Trang Product đạt yêu cầu khi:

## Header

- Menu `Sản phẩm` active.
- Cart badge phản ánh số lượng thật.
- Login/user state hoạt động.

## Product listing

- Danh sách sản phẩm lấy từ backend hoặc source dữ liệu được quy định.
- Không hardcode sản phẩm nếu backend đã có product data.
- Card hiển thị đúng ảnh, tên, rating, giá, button.
- Click sản phẩm mở chi tiết sản phẩm.
- Add to cart hoạt động và cập nhật cart badge.

## Filter

- Category filter lấy từ backend.
- Price filter cập nhật danh sách sản phẩm.
- Filter state được lưu trên URL query params.
- Có thể clear filter khi cần.

## Sort

- Sort dropdown thay đổi thứ tự sản phẩm.
- Sort state được lưu trên URL.
- Đổi sort reset page về 1.

## Pagination/load more

- Có thể chuyển trang hoặc tải thêm sản phẩm.
- Page state được phản ánh trên URL nếu dùng pagination.

## States

- Có loading state.
- Có empty state khi không có sản phẩm.
- Có error state khi API lỗi.
- Có disabled/loading state khi thêm giỏ hàng.

## Footer

- Footer dùng component chung với Home.
- Link, contact, map hoạt động đúng.

## Technical

- Không đưa thanh đỏ/ngang dưới header vào thiết kế.
- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Không hardcode rating, review count, sold count, giá nếu backend có dữ liệu thật.
- Responsive desktop/tablet/mobile cơ bản.
- Text tiếng Việt hiển thị đúng encoding.
