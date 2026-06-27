# home.md

# Mô tả chức năng trang Home — WeBee Bakery

> **⚠️ BACKEND ALIGNMENT & UI/UX CONTRACT (UPDATED 2026-06-27)**
> Nguyên tắc tối thượng: **Yêu cầu nghiệp vụ UI/UX là bắt buộc. Nếu Backend chưa có thì bắt buộc Backend phải cập nhật (`TODO_BACKEND`), tuyệt đối không được cắt bỏ UI của người dùng.**
> 1. **Bánh bán chạy nhất**: UI giữ nguyên tiêu đề section là **"Bánh bán chạy nhất"**. Yêu cầu Backend bổ sung trường `sold_count` (`TODO_BACKEND`). Trong giai đoạn MVP khi chưa có API mới, frontend tạm thời dùng `sort=rating_desc` để hiển thị danh sách bánh.
> 2. **API Auth**: Sử dụng `GET /users/me` để lấy trạng thái user thay cho `GET /auth/me`.
> 3. **Thêm nhanh vào giỏ**: Chỉ áp dụng với sản phẩm thường (`isCustomizable === false`). Sản phẩm tùy chỉnh khi bấm "Thêm vào giỏ" sẽ chuyển hướng đến trang Chi tiết sản phẩm.

## 1. Vai trò của trang Home

Trang Home không chỉ là trang giới thiệu tĩnh, mà là trang tổng hợp dữ liệu kinh doanh và điều hướng mua hàng chính của website WeBee Bakery.

Trang cần kết hợp 2 lớp:

1. **Lớp giao diện**: hiển thị đúng thiết kế Figma/homepage đã có.
2. **Lớp chức năng**: dữ liệu sản phẩm, danh mục, giỏ hàng, thành viên, sản phẩm bán chạy phải phản ánh trạng thái thực tế từ hệ thống/backend.

Mục tiêu chính:

- Giới thiệu thương hiệu WeBee.
- Dẫn người dùng đến danh mục sản phẩm.
- Hiển thị sản phẩm mới dựa trên dữ liệu thật.
- Hiển thị sản phẩm bán chạy dựa trên lượt bán thật.
- Cho phép thêm sản phẩm vào giỏ hàng ngay trên Home.
- Dẫn người dùng đến luồng tùy chỉnh bánh.
- Khuyến khích đăng nhập/đăng ký thành viên.
- Cung cấp thông tin liên hệ, chính sách và bản đồ cửa hàng.

---

## 2. Nguyên tắc dữ liệu cho trang Home

Các section trên Home được chia thành 2 nhóm dữ liệu:

### 2.1. Section có thể cấu hình tĩnh

Các nội dung này có thể hardcode tạm thời trong frontend hoặc lấy từ CMS/config nếu hệ thống có:

- Hero banner
- Custom cake CTA banner
- Membership introduction
- FAQ thành viên
- Footer information
- Policy links
- Store map

Nếu backend/CMS chưa có, có thể dùng static config nhưng phải tổ chức thành file riêng, không viết rải rác trong template.

Ví dụ:

```txt
src/app/features/home/config/home-static-content.ts
```

### 2.2. Section bắt buộc lấy dữ liệu động

Các section này không nên hiển thị tĩnh:

- Danh mục sản phẩm
- Bánh mới ra mắt
- Bánh bán chạy nhất
- Số lượng sản phẩm trong giỏ hàng
- Trạng thái đăng nhập/thành viên
- Giá sản phẩm
- Rating/số đánh giá
- Badge sản phẩm như `Phổ biến`, `Mới`, `Hết hàng`

Nếu backend chưa có endpoint tương ứng, đánh dấu `TODO_BACKEND`, không tự bịa dữ liệu như thể đã tích hợp thật.

---

# 3. Header / Navigation

## Mục đích

Header là vùng điều hướng chính, cho phép người dùng truy cập nhanh các phần quan trọng và theo dõi trạng thái giỏ hàng/đăng nhập.

## Thành phần giao diện

- Logo WeBee.
- Navigation menu:
  - Trang chủ
  - Sản phẩm
  - Tùy chỉnh bánh
  - Blog
  - Chính sách
  - Thành viên
- Icon tìm kiếm.
- Icon giỏ hàng có badge số lượng.
- Button đăng nhập hoặc menu tài khoản.

## Chức năng cần có

### Logo

Click logo chuyển về trang Home:

```txt
/
```

### Menu navigation

Mỗi menu item điều hướng đến route tương ứng:

| Menu | Route gợi ý | Chức năng |
|---|---|---|
| Trang chủ | `/` | Quay về Home |
| Sản phẩm | `/products` | Xem danh sách sản phẩm |
| Tùy chỉnh bánh | `/custom-cake` | Thiết kế/đặt bánh tùy chỉnh |
| Blog | `/blog` | Xem bài viết |
| Chính sách | `/policies` | Xem chính sách |
| Thành viên | `/membership` | Xem quyền lợi thành viên |

### Search icon

Khi click search:

- Mở search overlay/modal, hoặc
- Điều hướng đến trang tìm kiếm `/search`.

Search nên hỗ trợ tìm sản phẩm theo tên, danh mục hoặc từ khóa.

### Cart icon

Giỏ hàng phải hiển thị số lượng sản phẩm thực tế đang có trong cart.

Nguồn dữ liệu:

- Nếu user chưa đăng nhập: local cart state/localStorage.
- Nếu user đã đăng nhập: cart API hoặc cart state đồng bộ backend.

Badge không nên hardcode.

### Login button

Nếu user chưa đăng nhập:

```txt
Đăng nhập
```

Click chuyển đến:

```txt
/login
```

Nếu user đã đăng nhập:

- Hiển thị tên/avatar/menu tài khoản.
- Có thể có các action:
  - Tài khoản của tôi
  - Đơn hàng của tôi
  - Điểm thành viên
  - Đăng xuất

## API/state liên quan

```txt
GET /auth/me              TODO_BACKEND nếu chưa có
GET /cart                 TODO_BACKEND nếu chưa có
```

---

# 4. Hero banner

## Mục đích

Hero banner dùng để quảng bá ưu đãi thành viên và tạo ấn tượng thương hiệu.

## Nội dung giao diện

Headline:

```txt
Ưu Đãi Thành Viên WeBee
```

Description:

```txt
Giảm ngay 10% cho tất cả đơn hàng khi bạn đăng ký tài khoản thành viên.
```

CTA:

```txt
Đăng ký ngay
```

## Chức năng cần có

### CTA đăng ký

Nếu user chưa đăng nhập:

- Click `Đăng ký ngay` chuyển đến `/register` hoặc `/login?mode=register`.

Nếu user đã đăng nhập:

- Có thể chuyển đến `/membership` để xem quyền lợi thành viên.
- Không nên vẫn bắt user đăng ký lại.

### Banner slider

Trong thiết kế có pagination dots, nên hiểu hero có thể là carousel.

Nếu có nhiều banner:

- Hiển thị từng banner theo thứ tự ưu tiên.
- Dots phản ánh số lượng banner.
- Có thể auto-slide sau vài giây.
- Click dot để chuyển banner.

Nếu chỉ có 1 banner:

- Có thể ẩn dots hoặc hiển thị inactive tùy theo design.

## Dữ liệu

Hero có thể là static config hoặc lấy từ CMS/banner API.

Gợi ý model:

```ts
export interface HomeBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
  displayOrder: number;
}
```

## API gợi ý

```txt
GET /home/banners         TODO_BACKEND nếu chưa có CMS/banner
```

Nếu backend chưa có, dùng static config:

```txt
src/app/features/home/config/home-banners.config.ts
```

---

# 5. Category shortcuts

## Mục đích

Hiển thị các danh mục sản phẩm hiện có để người dùng truy cập nhanh.

## Danh mục trong thiết kế

- Bánh Gato
- Bánh Entremet
- Bánh Mousse
- Tiramisu
- Mini Cakes
- Bánh Nướng

## Chức năng cần có

Danh mục không nên chỉ là text/icon tĩnh nếu backend đã có quản lý danh mục.

Mỗi item danh mục phải:

- Lấy từ danh sách category đang active.
- Có tên danh mục.
- Có icon hoặc ảnh đại diện.
- Có slug/id để điều hướng.
- Click vào danh mục sẽ chuyển đến trang danh sách sản phẩm đã filter theo danh mục.

Ví dụ route:

```txt
/products?category=bánh-gato
```

hoặc:

```txt
/categories/banh-gato
```

## Logic hiển thị

- Chỉ hiển thị danh mục đang active.
- Ưu tiên các danh mục được đánh dấu nổi bật nếu backend có `isFeatured`.
- Nếu có nhiều hơn 6 danh mục, chỉ hiển thị 6 danh mục nổi bật nhất.
- Nếu không có category từ API, hiển thị empty/fallback hợp lý hoặc dùng config tạm và đánh dấu TODO_BACKEND.

## Model đề xuất

```ts
export interface HomeCategoryItem {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}
```

## API liên quan

```txt
GET /categories?isActive=true&isFeatured=true&limit=6
```

Nếu backend không hỗ trợ query như trên, frontend có thể gọi endpoint category hiện có rồi filter/sort tạm thời, nhưng phải ghi rõ trong code hoặc docs.

---

# 6. Section “Bánh mới ra mắt”

## Mục đích

Hiển thị các sản phẩm mới được thêm vào hệ thống hoặc vừa được mở bán.

Đây không phải section tĩnh. Danh sách sản phẩm phải dựa trên dữ liệu sản phẩm thật.

## Nội dung giao diện

Title:

```txt
Bánh mới ra mắt
```

Subtitle:

```txt
Lựa chọn tinh tế từ bếp trưởng cho mùa này
```

Action:

```txt
Xem tất cả →
```

## Chức năng cần có

### Hiển thị sản phẩm mới

Danh sách sản phẩm nên được xác định bằng một trong các logic sau:

Ưu tiên 1:

- Sản phẩm có field `isNew = true`.

Ưu tiên 2:

- Sắp xếp theo `createdAt` mới nhất.

Ưu tiên 3:

- Sản phẩm thuộc collection/tag `new-arrival`.

Mỗi sản phẩm hiển thị:

- Ảnh chính.
- Tên sản phẩm.
- Rating trung bình.
- Số lượt đánh giá.
- Giá bán hiện tại.
- Trạng thái tồn/hết hàng nếu có.
- Button thêm vào giỏ.

### Nút “Xem tất cả”

Click chuyển đến danh sách sản phẩm với filter sản phẩm mới:

```txt
/products?sort=newest
```

hoặc:

```txt
/products?collection=new-arrivals
```

### Button “Thêm vào giỏ”

Khi click:

- Nếu sản phẩm còn hàng: thêm 1 sản phẩm vào giỏ.
- Nếu sản phẩm hết hàng: disable button hoặc hiển thị `Hết hàng`.
- Sau khi thêm thành công: cập nhật cart badge trên header.
- Hiển thị toast/snackbar: `Đã thêm vào giỏ hàng`.

### Trạng thái cần xử lý

- Loading: đang tải sản phẩm mới.
- Empty: chưa có sản phẩm mới.
- Error: không tải được sản phẩm.
- Out of stock: sản phẩm hết hàng.
- Add to cart loading: đang thêm sản phẩm vào giỏ.

## Model đề xuất

```ts
export interface HomeProductCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  ratingAverage?: number;
  reviewCount?: number;
  soldCount?: number;
  stockQuantity?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  badge?: string;
}
```

## API liên quan

```txt
GET /products?sort=newest&limit=4
POST /cart/items
```

Nếu backend chưa có `sort=newest`, cần đánh dấu:

```txt
TODO_BACKEND: Backend needs a way to fetch newest products for Home page.
```

---

# 7. Section “Bánh bán chạy nhất”

## Mục đích

Hiển thị các sản phẩm đang có hiệu suất bán tốt nhất, nhằm tăng độ tin cậy và thúc đẩy mua hàng.

Section này bắt buộc nên là dữ liệu động, không nên hardcode.

## Nội dung giao diện

Title:

```txt
Bánh Bán chạy nhất
```

Subtitle:

```txt
Những chiếc bánh đang được mọi người yêu thích nhất.
```

Action:

```txt
Xem tất cả →
```

## Chức năng cần có

### Xác định sản phẩm bán chạy

Danh sách sản phẩm bán chạy nên được lấy từ backend dựa trên số lượng bán thực tế.

Logic ưu tiên:

1. Sắp xếp sản phẩm theo `soldCount` giảm dần.
2. Nếu có bảng/order items, backend tính tổng số lượng đã bán trong một khoảng thời gian.
3. Nếu có analytics, dùng endpoint best-seller riêng.
4. Nếu chưa có dữ liệu bán, tạm dùng field `isBestSeller = true`, nhưng phải đánh dấu là giả định.

Không nên chọn sản phẩm bán chạy thủ công trong frontend nếu hệ thống đã có đơn hàng.

### Khoảng thời gian bán chạy

Nên xác định rõ khoảng thời gian:

- Bán chạy tuần này
- Bán chạy tháng này
- Bán chạy toàn thời gian

Với Home page, đề xuất mặc định:

```txt
Bán chạy trong 30 ngày gần nhất
```

Nếu backend chưa hỗ trợ date range, ghi:

```txt
TODO_BACKEND: Best-selling products currently do not support time range filtering.
```

### Badge `Phổ biến`

Badge `Phổ biến` nên hiển thị khi:

- Sản phẩm nằm trong danh sách bán chạy, hoặc
- `soldCount` vượt ngưỡng nhất định, hoặc
- Backend trả về field `badge`.

Không nên hardcode badge cho sản phẩm cụ thể.

### Nút “Xem tất cả”

Click chuyển đến:

```txt
/products?sort=best-selling
```

hoặc:

```txt
/products?collection=best-sellers
```

### Button “Thêm vào giỏ”

Tương tự sản phẩm mới:

- Thêm sản phẩm vào giỏ.
- Cập nhật cart badge.
- Hiển thị toast thành công.
- Disable nếu hết hàng.

## Dữ liệu cần có

Mỗi sản phẩm bán chạy nên có:

- `id`
- `name`
- `slug`
- `imageUrl`
- `price`
- `ratingAverage`
- `reviewCount`
- `soldCount`
- `stockQuantity`
- `badge`

## API liên quan

Khuyến nghị backend có một endpoint rõ ràng:

```txt
GET /products/best-sellers?limit=4&period=30d
```

Hoặc nếu dùng query chung:

```txt
GET /products?sort=best-selling&limit=4&period=30d
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need endpoint or query support for best-selling products based on real order/sales data.
```

## Lưu ý quan trọng

Section “Bánh bán chạy nhất” không nên được hiểu là một block marketing tĩnh. Nó phải phản ánh dữ liệu bán hàng thật, hoặc ít nhất là một cờ dữ liệu được quản trị từ backend.

---

# 8. Custom cake CTA banner

## Mục đích

Dẫn người dùng đến luồng thiết kế/đặt bánh tùy chỉnh.

## Nội dung giao diện

Headline:

```txt
Tạo nên Khoảnh khắc Ngọt ngào
```

Description:

```txt
Thiết kế chiếc bánh trong mơ của riêng bạn. Chọn hương vị, màu sắc và phong cách trang trí để tạo nên nét riêng biệt.
```

CTA:

```txt
Bắt đầu thiết kế
```

## Chức năng cần có

Click CTA chuyển đến:

```txt
/custom-cake
```

hoặc flow tạo bánh tùy chỉnh tương ứng trong project.

Nếu user chưa đăng nhập, có 2 phương án:

- Cho phép thiết kế trước, yêu cầu đăng nhập khi checkout.
- Yêu cầu đăng nhập trước khi bắt đầu.

Đề xuất UX:

```txt
Cho phép người dùng bắt đầu thiết kế trước, chỉ yêu cầu đăng nhập khi lưu thiết kế hoặc đặt hàng.
```

## Dữ liệu

Có thể static config nếu nội dung ít thay đổi.

Nếu backend/CMS có quản lý banner, có thể lấy từ:

```txt
GET /home/custom-cake-banner
```

---

# 9. Membership / FAQ block

## Mục đích

Khuyến khích người dùng đăng nhập/tham gia thành viên và hiểu quyền lợi tích điểm.

## Nội dung giao diện

Title:

```txt
Bạn là thành viên?
```

Subtitle:

```txt
Đăng nhập để xem ưu đãi và tích điểm.
```

CTA:

```txt
Đăng nhập / Đăng ký
```

FAQ:

- Làm sao để trở thành thành viên?
- Cách tích điểm như thế nào?
- Điểm thưởng có thời hạn không?
- Tôi có thể đổi điểm thành gì?
- Làm sao để lên hạng thành viên?

## Chức năng cần có

### Theo trạng thái đăng nhập

Nếu user chưa đăng nhập:

- Hiển thị CTA `Đăng nhập / Đăng ký`.

Nếu user đã đăng nhập:

- Hiển thị lời chào hoặc thông tin hạng thành viên nếu có.
- CTA có thể đổi thành:
  - `Xem quyền lợi của tôi`
  - `Xem điểm tích lũy`

### FAQ accordion

- Mỗi câu hỏi mở/đóng được.
- Mặc định có thể đóng tất cả hoặc mở câu đầu tiên.
- Chỉ một câu mở tại một thời điểm hoặc cho phép nhiều câu mở tùy implementation.

## API/data liên quan

Nếu hệ thống có membership:

```txt
GET /membership/me
GET /membership/faqs
```

Nếu chưa có backend, FAQ có thể dùng static config:

```txt
src/app/features/home/config/membership-faq.config.ts
```

Nhưng trạng thái đăng nhập nên lấy từ auth state thật.

---

# 10. Footer

## Mục đích

Cung cấp thông tin thương hiệu, liên hệ, chính sách và bản đồ cửa hàng.

## Thành phần

### Brand

- Logo WeBee.
- Mô tả ngắn.
- Social links.

### Liên kết nhanh

- Trang chủ
- Sản phẩm
- Tùy chỉnh
- Blog
- Thành viên

### Liên hệ

- Số điện thoại
- Email
- Địa chỉ cửa hàng.

### Chính sách & Hướng dẫn

- Chính sách Hỗ trợ Khách hàng
- Chính sách Khách hàng thân thiết
- Chính sách Bảo mật
- Hướng dẫn Sản phẩm
- Hướng dẫn Đặt hàng & Thanh toán
- Hướng dẫn Giao hàng

### Map

Hiển thị bản đồ cửa hàng.

## Chức năng cần có

- Link footer điều hướng đúng route.
- Social icons mở link ngoài ở tab mới.
- Click email mở mail client.
- Click số điện thoại mở gọi điện trên mobile.
- Map có thể là iframe hoặc map component.
- Nếu có nhiều chi nhánh, map nên lấy theo cửa hàng chính hoặc danh sách store.

## Dữ liệu

Footer có thể lấy từ static config:

```txt
src/app/shared/config/footer.config.ts
```

Hoặc từ backend/CMS nếu có:

```txt
GET /site-settings
GET /stores
```

---

# 11. Product card behavior

Product card là component dùng lại cho:

- Bánh mới ra mắt
- Bánh bán chạy nhất
- Có thể dùng tiếp ở trang danh sách sản phẩm

## Thành phần

- Product image
- Badge
- Product name
- Rating
- Review count
- Price
- Add to cart button

## Chức năng

### Click ảnh/tên sản phẩm

Điều hướng đến chi tiết sản phẩm:

```txt
/products/:slug
```

hoặc:

```txt
/products/:id
```

### Add to cart

- Gọi API/cart service.
- Cập nhật cart state.
- Hiển thị feedback.
- Không reload trang.
- Disable khi đang xử lý.
- Disable hoặc đổi text khi hết hàng.

### Giá

Nếu có giảm giá:

- Hiển thị giá hiện tại nổi bật.
- Có thể hiển thị giá gốc gạch ngang nếu design cho phép.

### Rating

Nếu chưa có rating:

- Có thể ẩn rating.
- Hoặc hiển thị `Chưa có đánh giá`.

Không hardcode rating nếu backend không có dữ liệu.

---

# 12. Home page loading/error strategy

Trang Home có nhiều section, không nên để một API lỗi làm hỏng toàn bộ trang.

## Chiến lược đề xuất

- Header/footer/hero static vẫn hiển thị.
- Mỗi section dữ liệu động tự quản lý trạng thái riêng.
- Nếu category API lỗi, chỉ section category hiển thị error nhỏ.
- Nếu products API lỗi, chỉ section tương ứng hiển thị error/empty state.

## Section-level states

Mỗi section lấy API cần có:

```txt
loading
success
empty
error
```

Ví dụ:

### Bánh mới ra mắt empty state

```txt
Hiện chưa có bánh mới ra mắt.
```

### Bánh bán chạy error state

```txt
Không thể tải danh sách bánh bán chạy. Vui lòng thử lại.
```

---

# 13. Data mapping tổng quan

| UI Section | Dữ liệu cần có | Loại dữ liệu | Nguồn ưu tiên | Fallback |
|---|---|---|---|---|
| Header cart badge | Số lượng item trong giỏ | Dynamic | Cart state/API | 0 |
| Header auth | Trạng thái đăng nhập | Dynamic | Auth state/API | Guest |
| Hero banner | Banner ưu đãi | Static/CMS | Home banner API/CMS | Static config |
| Category shortcuts | Danh mục active/featured | Dynamic | Categories API | TODO_BACKEND/static tạm |
| Bánh mới ra mắt | Sản phẩm mới nhất | Dynamic | Products API sort newest | TODO_BACKEND |
| Bánh bán chạy nhất | Sản phẩm bán chạy theo soldCount/order data | Dynamic | Products best-seller API | TODO_BACKEND |
| Custom cake CTA | Nội dung CTA | Static/CMS | Static config/CMS | Static config |
| Membership block | Auth state, member info, FAQ | Mixed | Auth + Membership API | FAQ static |
| Footer | Contact, policy, social, map | Static/CMS | Site settings API/CMS | Static config |

---

# 14. Backend/API checklist cho Home

Agent/frontend developer cần kiểm tra backend có các endpoint hoặc dữ liệu tương đương không.

## Required or recommended endpoints

```txt
GET /categories
GET /products?sort=newest&limit=4
GET /products?sort=best-selling&limit=4&period=30d
GET /products/:id hoặc GET /products/:slug
POST /cart/items
GET /cart
GET /auth/me
```

## Optional endpoints

```txt
GET /home/banners
GET /membership/me
GET /membership/faqs
GET /site-settings
GET /stores
```

## Backend fields cần kiểm tra

Product:

```txt
id
name
slug
imageUrl
price
ratingAverage
reviewCount
soldCount
stockQuantity
isActive
isNew
isBestSeller
createdAt
```

Category:

```txt
id
name
slug
iconUrl
imageUrl
isActive
isFeatured
displayOrder
```

Cart:

```txt
itemCount
items
productId
quantity
```

User/member:

```txt
id
name
email
membershipTier
points
```

---

# 15. Angular implementation proposal

## Route

```txt
/
```

## Feature folder

```txt
src/app/features/home/
  home.page.ts
  home.page.html
  home.page.scss
  components/
    hero-banner/
    category-shortcuts/
    product-section/
    custom-cake-cta/
    membership-faq/
```

## Shared components

```txt
src/app/shared/components/
  product-card/
  section-header/
  site-button/
  accordion/
  loading-state/
  empty-state/
  error-state/
```

## Core services/API

```txt
src/app/core/api/categories.api.ts
src/app/core/api/products.api.ts
src/app/core/api/cart.api.ts
src/app/core/api/auth.api.ts
src/app/core/api/membership.api.ts
```

## Home page orchestration

Home page nên gọi song song các dữ liệu:

- categories
- newest products
- best-selling products
- auth/cart state nếu chưa có global state

Không nên để Home page chứa quá nhiều logic xử lý. Logic API nằm ở service, UI nằm ở component.

---

# 16. Acceptance criteria

Trang Home đạt yêu cầu khi:

## Header

- Logo điều hướng về Home.
- Menu điều hướng đúng route.
- Cart badge phản ánh số lượng giỏ hàng thật.
- Button đăng nhập thay đổi theo trạng thái auth.

## Hero

- Hiển thị đúng banner ưu đãi.
- CTA xử lý khác nhau theo trạng thái đăng nhập nếu cần.
- Slider/dots hoạt động nếu có nhiều banner.

## Categories

- Danh mục lấy từ backend hoặc source dữ liệu đã quy định.
- Click danh mục chuyển đến trang sản phẩm đã lọc.
- Không hardcode danh mục nếu backend đã có category.

## New products

- Hiển thị sản phẩm mới dựa trên `createdAt`, `isNew`, hoặc collection tương ứng.
- `Xem tất cả` chuyển đến danh sách sản phẩm mới.
- Add to cart hoạt động.

## Best sellers

- Hiển thị sản phẩm bán chạy dựa trên `soldCount`, order data, hoặc endpoint best-seller.
- Không hardcode sản phẩm bán chạy.
- Badge `Phổ biến` dựa trên dữ liệu.
- `Xem tất cả` chuyển đến danh sách bán chạy.
- Add to cart hoạt động.

## Custom cake CTA

- CTA điều hướng đến flow tùy chỉnh bánh.
- Không yêu cầu đăng nhập quá sớm nếu không cần thiết.

## Membership/FAQ

- CTA thay đổi theo trạng thái đăng nhập.
- FAQ accordion mở/đóng được.
- Nếu có membership API, hiển thị dữ liệu thành viên thật.

## Footer

- Link hoạt động.
- Thông tin liên hệ rõ ràng.
- Map hiển thị đúng.

## Technical

- Có loading, empty, error state theo từng section động.
- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Không hardcode rating, sold count, giá nếu backend đã có dữ liệu.
- Text tiếng Việt hiển thị đúng encoding.
- Responsive desktop/tablet/mobile cơ bản.
