# cart.md

# Mô tả chức năng trang Giỏ hàng — WeBee Bakery

## 1. Vai trò của trang Giỏ hàng

Trang Giỏ hàng là trang quản lý giỏ hàng đầy đủ trước khi người dùng tiếp tục sang bước đặt hàng/checkout.

Khác với **Cart Drawer** là giỏ hàng nhanh dạng thanh bên, trang Giỏ hàng là nơi người dùng có nhiều không gian hơn để:

- Xem toàn bộ sản phẩm trong giỏ.
- Tăng/giảm số lượng.
- Xóa sản phẩm khỏi giỏ.
- Nhập lời chúc/ghi chú cho sản phẩm hoặc đơn hàng.
- Xem tóm tắt đơn hàng.
- Kiểm tra phí giao hàng nếu chưa checkout.
- Tiếp tục đặt hàng.
- Quay lại từ trang đặt hàng khi muốn chỉnh sửa giỏ.

Theo cơ chế bạn mô tả: khi người dùng đang ở trang Đặt hàng và bấm quay lại, hệ thống sẽ trả về trang Giỏ hàng này.

---

## 2. Vị trí trong luồng mua hàng

## Flow chính

```txt
Product Detail / Product List
→ Add to cart
→ Cart Drawer
→ Tiến hành đặt hàng
→ Checkout
```

## Flow quay lại từ Checkout

```txt
Checkout
→ User bấm quay lại / chỉnh sửa giỏ hàng
→ Cart Page
→ User chỉnh giỏ
→ Tiến hành đặt hàng
→ Checkout
```

## Route đề xuất

```txt
/cart
```

Trang checkout nên có link quay lại:

```txt
/cart
```

Không nên quay về Product Detail/Product List nếu mục tiêu của user là chỉnh lại giỏ hàng.

---

# 3. Khi nào dùng Cart Drawer và khi nào dùng Cart Page?

## Cart Drawer

Dùng khi:

- User click icon giỏ hàng trên header.
- User vừa thêm sản phẩm vào giỏ.
- User muốn xem nhanh giỏ hàng trên trang hiện tại.

Cart Drawer không làm đổi route.

## Cart Page

Dùng khi:

- User muốn xem giỏ đầy đủ.
- User quay lại từ Checkout.
- User cần chỉnh số lượng/ghi chú trước khi đặt hàng.
- User mở trực tiếp `/cart`.

## Rule

Cart Drawer và Cart Page phải dùng chung:

```txt
CartApi
CartStateService
Cart models
Cart item logic
```

Không duplicate logic giỏ hàng.

---

# 4. Tổng quan bố cục trang

Trang Giỏ hàng gồm các khu vực chính:

1. Header / Navigation
2. Breadcrumb
3. Page title
4. Member notice bar
5. Cart content layout
   - Cart item list bên trái
   - Order summary card bên phải
6. Footer
7. Store map

---

# 5. Header / Navigation

## Giao diện

Header giống các trang khác:

- Logo WeBee.
- Menu:
  - Trang chủ
  - Sản phẩm
  - Tùy chỉnh bánh
  - Blog
  - Chính sách
  - Thành viên
- Search icon.
- Cart icon có badge số lượng.
- Button `Đăng nhập` hoặc account icon nếu đã đăng nhập.

## Chức năng

- Logo click về `/`.
- Menu điều hướng đúng route.
- Cart icon có thể mở Cart Drawer, nhưng nếu đang ở `/cart`, có thể không cần mở drawer.
- Cart badge lấy từ cart state thật.
- Nếu đã đăng nhập, header hiển thị account icon thay cho button đăng nhập.

## Lưu ý

Trên trang Cart Page, click icon giỏ hàng có thể:

- Giữ nguyên trang hiện tại, hoặc
- Mở Cart Drawer nếu muốn nhất quán toàn site.

Đề xuất:

```txt
Nếu đang ở /cart, click cart icon không cần mở drawer; có thể scroll về đầu trang cart.
```

---

# 6. Breadcrumb

## Giao diện

Breadcrumb trong ảnh:

```txt
Trang chủ > Đặt hàng
```

Tuy nhiên vì đây là trang giỏ hàng, breadcrumb nên điều chỉnh thành:

```txt
Trang chủ > Giỏ hàng
```

Nếu giữ tên theo flow hiện tại, có thể dùng:

```txt
Trang chủ > Giỏ hàng > Đặt hàng
```

nhưng route `/cart` nên dùng label `Giỏ hàng`.

## Route

| Label | Route |
|---|---|
| Trang chủ | `/` |
| Giỏ hàng | current page |

---

# 7. Page title

## Giao diện

Title trong ảnh:

```txt
Đặt hàng (1 sản phẩm)
```

Vì đây là trang Giỏ hàng, nên cân nhắc đổi thành:

```txt
Giỏ hàng (1 sản phẩm)
```

hoặc nếu muốn giữ đúng flow đặt hàng:

```txt
Đặt hàng (1 sản phẩm)
```

## Đề xuất

Nên dùng:

```txt
Giỏ hàng (1 sản phẩm)
```

Lý do:

- Trang này dùng để chỉnh giỏ trước khi checkout.
- Tránh nhầm với trang Checkout đã có form đặt hàng.

## Chức năng count

Số lượng trong ngoặc lấy từ cart thật.

Đề xuất rule:

```txt
Giỏ hàng ({totalItems} sản phẩm)
```

Trong đó `totalItems` là tổng quantity, không chỉ số dòng item.

Ví dụ:

- 1 sản phẩm, quantity 3 → `Giỏ hàng (3 sản phẩm)`
- 2 sản phẩm, mỗi sản phẩm quantity 1 → `Giỏ hàng (2 sản phẩm)`

---

# 8. Member notice bar

## Giao diện

Trong ảnh có notice:

```txt
Đăng nhập thành viên để nhận ưu đãi và tích điểm mỗi đơn hàng
```

## Chức năng

Chỉ hiển thị khi user chưa đăng nhập.

Nếu user chưa đăng nhập:

- Hiển thị notice.
- Click notice chuyển đến `/login?redirect=/cart`.

Nếu user đã đăng nhập:

- Ẩn notice.
- Hoặc hiển thị thông tin điểm/voucher nếu có membership.

Ví dụ:

```txt
Bạn sẽ tích được 36 điểm cho đơn hàng này.
```

## API/state

```txt
GET /auth/me
GET /membership/me       optional
```

---

# 9. Cart item list

## Giao diện

Card lớn bên trái hiển thị item trong giỏ.

Trong ảnh có:

- Ảnh sản phẩm.
- Tên sản phẩm.
- Giá.
- Quantity stepper.
- Icon xóa.
- Tổng tiền dòng item ở bên phải.
- Ô nhập lời chúc.

Ví dụ:

```txt
Bánh Mousse Nhãn 20cm
360.000đ
- 1 +
360.000đ
Nhập lời chúc của bạn...
```

## Dữ liệu cần có

```ts
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variantId?: string;
  variantName?: string;
  note?: string;
  maxQuantity?: number;
  stockQuantity?: number;
}
```

## Product snapshot

Cart item nên có dữ liệu snapshot đủ để hiển thị:

- productName
- imageUrl
- variantName
- unitPrice

Nếu product sau đó bị thay đổi/hết bán, cart cần có trạng thái cảnh báo.

---

# 10. Quantity stepper

## Giao diện

```txt
- 1 +
```

## Chức năng

### Tăng số lượng

Khi click `+`:

1. Tăng quantity thêm 1.
2. Gọi API update cart item.
3. Cập nhật lineTotal.
4. Cập nhật subtotal/order summary.
5. Cập nhật cart badge header.

### Giảm số lượng

Khi click `-`:

- Nếu quantity > 1: giảm 1.
- Nếu quantity = 1: disable nút `-` hoặc yêu cầu dùng icon xóa.

Đề xuất:

```txt
Disable nút `-` khi quantity = 1.
```

### Kiểm tra tồn kho

Nếu backend có stock:

- Không cho vượt quá `stockQuantity`.
- Hiển thị lỗi:

```txt
Số lượng trong kho không đủ.
```

## API liên quan

```txt
PATCH /cart/items/:itemId
```

Payload:

```json
{
  "quantity": 2
}
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need cart item quantity update endpoint.
```

---

# 11. Xóa sản phẩm khỏi giỏ

## Giao diện

Icon thùng rác màu đỏ bên cạnh quantity.

## Chức năng

Khi click icon xóa:

1. Gọi API remove item.
2. Xóa item khỏi cart state.
3. Cập nhật cart badge.
4. Cập nhật order summary.
5. Nếu cart rỗng, hiển thị empty state.

Có thể hiển thị toast:

```txt
Đã xóa sản phẩm khỏi giỏ hàng.
```

Có thể hỗ trợ undo:

```txt
Hoàn tác
```

## API liên quan

```txt
DELETE /cart/items/:itemId
```

Nếu backend dùng productId/variantId thay itemId, document lại trong API contract.

---

# 12. Lời chúc / ghi chú cho sản phẩm

## Giao diện

Input trong cart item:

```txt
Nhập lời chúc của bạn...
```

## Chức năng

Đây là ghi chú/lời chúc riêng cho sản phẩm trong giỏ, thường dùng cho bánh sinh nhật/quà tặng.

Ví dụ:

```txt
Chúc mừng sinh nhật An, cắm 5 cây nến.
```

## Behavior

- User nhập text.
- Lưu khi blur, hoặc debounce 500–800ms.
- Hiển thị saving indicator nhỏ nếu cần.
- Nếu lỗi, hiển thị:

```txt
Không thể lưu lời chúc. Vui lòng thử lại.
```

## Validation

- Optional.
- Giới hạn ký tự đề xuất: 200–500.
- Không cho ký tự nguy hiểm nếu backend cần sanitize.

## API liên quan

```txt
PATCH /cart/items/:itemId
```

Payload:

```json
{
  "note": "Chúc mừng sinh nhật An"
}
```

Nếu backend chỉ hỗ trợ note cấp đơn hàng, cần tách rõ:

```txt
TODO_BACKEND: Need item-level note support for cake message.
```

---

# 13. Order summary card

## Giao diện

Card bên phải gồm:

Title:

```txt
Tóm tắt đơn hàng
```

Các dòng:

```txt
Tạm tính (1 món)      360.000đ
Phí giao hàng         Tính khi checkout
Tạm tính              360.000đ
```

Button:

```txt
Tiến hành đặt hàng
```

## Chức năng

Order summary phải tính từ cart thật, không hardcode.

## Công thức

```txt
subtotal = sum(item.unitPrice * item.quantity)
shippingFee = unknown ở cart page nếu chưa có địa chỉ
estimatedTotal = subtotal + shippingFee nếu đã biết
```

Vì chưa có địa chỉ giao hàng ở Cart Page, phí giao hàng có thể hiển thị:

```txt
Tính khi checkout
```

hoặc nếu có phí mặc định:

```txt
30.000đ
```

Nhưng tốt nhất:

```txt
Tính khi checkout
```

để tránh sai.

## CTA Tiến hành đặt hàng

Click button:

- Nếu cart có sản phẩm hợp lệ → chuyển đến `/checkout`.
- Nếu cart rỗng → disabled hoặc hiển thị empty state.
- Nếu có sản phẩm hết hàng/không hợp lệ → chặn checkout và yêu cầu cập nhật giỏ.

Route:

```txt
/checkout
```

## Loading/validation

Khi click:

- Có thể validate cart với backend trước.
- Nếu backend có endpoint validate cart:

```txt
POST /cart/validate
```

Nếu không có, checkout sẽ validate lại.

---

# 14. Empty cart state

Nếu giỏ hàng trống, không hiển thị layout như có item.

## Nội dung đề xuất

```txt
Giỏ hàng của bạn đang trống
Hãy chọn những chiếc bánh yêu thích trước khi đặt hàng.
```

CTA:

```txt
Mua bánh ngay
```

Route:

```txt
/products
```

Có thể hiển thị thêm:

- Bánh bán chạy.
- Bánh mới ra mắt.
- Danh mục nổi bật.

Những section này nếu dùng phải lấy từ API/products hoặc static config rõ ràng.

---

# 15. Cart data behavior

## Nguồn dữ liệu

Trang Cart Page phải lấy dữ liệu từ cart state/API.

```txt
GET /cart
```

Không dùng dữ liệu tĩnh.

## Khi vào trang

1. Load cart từ CartStateService nếu đã có.
2. Refetch `GET /cart` để đảm bảo dữ liệu mới nhất nếu cần.
3. Render cart items và summary.
4. Nếu cart empty, hiển thị empty state.

## Khi quay lại từ Checkout

Khi user bấm back/chỉnh sửa giỏ từ Checkout:

- Điều hướng đến `/cart`.
- Cart Page refetch cart.
- Giữ lại items, notes, quantities.
- Không reset cart.

---

# 16. Cart validation

Trước khi cho sang Checkout, nên kiểm tra:

- Cart không rỗng.
- Item còn active.
- Item còn hàng.
- Quantity hợp lệ.
- Giá không bị thay đổi bất thường.

Nếu có lỗi:

```txt
Một số sản phẩm trong giỏ đã thay đổi. Vui lòng kiểm tra lại.
```

Nếu product hết hàng:

```txt
Sản phẩm này hiện đã hết hàng.
```

Nếu giá đổi:

```txt
Giá sản phẩm đã được cập nhật.
```

## API đề xuất

```txt
POST /cart/validate
```

Nếu chưa có:

```txt
TODO_BACKEND: Need cart validation before checkout for stock/price changes.
```

---

# 17. Relationship với Checkout

## Từ Cart Page sang Checkout

```txt
/cart
→ click Tiến hành đặt hàng
→ /checkout
```

Checkout dùng cart hiện tại để tạo order.

## Từ Checkout quay lại Cart Page

Checkout nên có link:

```txt
Quay lại giỏ hàng
```

Route:

```txt
/cart
```

Không nên quay lại Product page nếu user muốn chỉnh giỏ.

## Rule

Cart Page không tạo order.

Cart Page chỉ quản lý cart. Order chỉ được tạo ở Checkout khi user xác nhận đặt hàng.

---

# 18. Relationship với Cart Drawer

Cart Drawer và Cart Page cùng quản lý một cart.

## Shared logic

- Add item.
- Update quantity.
- Remove item.
- Update note.
- Cart total.
- Cart badge.

## Khác biệt

| Cart Drawer | Cart Page |
|---|---|
| Xem nhanh trên trang hiện tại | Trang đầy đủ |
| Không đổi route | Route `/cart` |
| Phù hợp xác nhận nhanh | Phù hợp chỉnh sửa trước checkout |
| Có recommendation nhỏ | Có thể tập trung vào cart summary |

## Rule

Nếu user cập nhật cart ở Cart Page, Cart Drawer/header badge cũng phải đồng bộ.

---

# 19. API checklist cho Cart Page

## Required endpoints

```txt
GET /cart
PATCH /cart/items/:itemId
DELETE /cart/items/:itemId
```

## Recommended endpoints

```txt
POST /cart/validate
```

## Optional endpoints

```txt
GET /products/recommendations?context=cart
GET /cart/recommendations
```

## Backend fields cần có

Cart:

```txt
id
items
totalItems
subtotal
currency
updatedAt
```

Cart item:

```txt
id
productId
productSlug
productName
imageUrl
variantId
variantName
unitPrice
quantity
lineTotal
note
stockQuantity
maxQuantity
isAvailable
```

---

# 20. Angular implementation proposal

## Route

```txt
/cart
```

## Feature folder

```txt
src/app/features/cart/
  cart.routes.ts
  pages/
    cart-page/
      cart-page.component.ts
      cart-page.component.html
      cart-page.component.scss
  components/
    cart-item-list/
    cart-page-item/
    cart-summary-card/
```

## Shared components

```txt
src/app/shared/components/
  site-header/
  site-footer/
  quantity-stepper/
  loading-state/
  empty-state/
  error-state/
```

## Core API

```txt
src/app/core/api/cart.api.ts
```

Methods:

```ts
getCart(): Observable<Cart>
updateItem(itemId: string, payload: UpdateCartItemRequest): Observable<Cart>
removeItem(itemId: string): Observable<Cart>
validateCart(): Observable<CartValidationResult>
```

## Core state/service

```txt
src/app/core/services/cart-state.service.ts
```

Responsibilities:

- Store current cart.
- Update totalItems.
- Sync header badge.
- Share state between Cart Drawer, Cart Page and Checkout.
- Handle optimistic update or refetch.

---

# 21. Loading, empty, error states

## Loading

Khi load cart:

```txt
Đang tải giỏ hàng...
```

Có thể dùng skeleton item.

## Error

Nếu không tải được cart:

```txt
Không thể tải giỏ hàng. Vui lòng thử lại.
```

CTA:

```txt
Thử lại
```

## Empty

```txt
Giỏ hàng của bạn đang trống.
```

CTA:

```txt
Mua bánh ngay
```

## Updating item

Khi update quantity/note/delete:

- Disable control đang update.
- Không block toàn page nếu chỉ update một item.
- Nếu lỗi, rollback hoặc refetch cart.

---

# 22. Responsive behavior

## Desktop

- Layout 2 cột:
  - Cart items bên trái.
  - Summary bên phải.
- Summary card có thể sticky.
- Footer full width.

## Tablet

- Layout có thể chuyển 1 cột nếu hẹp.
- Summary nằm dưới cart items.

## Mobile

- Layout 1 cột.
- Cart item stack dọc.
- Quantity và delete dễ bấm.
- Summary card/sticky CTA có thể nằm dưới cùng.
- Footer 1 cột.
- Map full width.

---

# 23. Design tokens suy ra từ ảnh

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
Danger/Delete: #C94A4A
```

## Typography

```txt
Page title: 36–44px, bold
Product name: 18–20px, semi-bold
Price: 18–20px, bold
Summary title: 18–20px
Summary total: 24–28px, bold
Button: 15–16px, semi-bold
Input text: 14–15px
```

## Layout

```txt
Page max width: 1200–1280px
Left cart column: khoảng 65–70%
Right summary column: khoảng 30–35%
Cart item image: 120–140px
Card radius: 16–20px
Input radius: 10–12px
Button radius: 999px hoặc 14–16px
Section gap: 24–32px
```

---

# 24. Acceptance criteria

Trang Giỏ hàng đạt yêu cầu khi:

## Navigation

- Route `/cart` hoạt động.
- Breadcrumb hiển thị đúng `Trang chủ > Giỏ hàng`.
- Header cart badge đồng bộ với cart thật.
- Header auth state hoạt động.

## Cart data

- Cart items lấy từ API/state thật.
- Không hardcode sản phẩm, giá, số lượng.
- Tổng số sản phẩm trong title lấy từ cart.
- Subtotal tính đúng từ cart items.

## Cart item actions

- Tăng/giảm quantity hoạt động.
- Không cho quantity nhỏ hơn 1.
- Không vượt tồn kho nếu backend có.
- Xóa item hoạt động.
- Lời chúc/note được lưu hoặc đánh dấu TODO_BACKEND nếu chưa hỗ trợ.

## Summary

- Tạm tính hiển thị đúng.
- Phí giao hàng hiển thị `Tính khi checkout` nếu chưa có địa chỉ.
- Button `Tiến hành đặt hàng` chuyển đến `/checkout`.
- Nếu cart rỗng, button disabled/ẩn.

## Back from Checkout

- Khi user từ Checkout quay lại, điều hướng về `/cart`.
- Cart không bị reset.
- User có thể chỉnh giỏ rồi tiếp tục checkout.

## States

- Có loading state.
- Có empty cart state.
- Có error state.
- Có updating state cho từng item.

## Technical

- Dùng chung CartApi/CartStateService với Cart Drawer và Checkout.
- Không duplicate cart logic.
- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Responsive desktop/tablet/mobile cơ bản.
- Text tiếng Việt hiển thị đúng encoding.
