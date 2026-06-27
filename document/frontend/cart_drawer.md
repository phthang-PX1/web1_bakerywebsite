# cart_drawer.md

# Mô tả chức năng Cart Drawer — WeBee Bakery

## 1. Vai trò của Cart Drawer

Cart Drawer là giỏ hàng dạng thanh bên, xuất hiện trực tiếp trên trang hiện tại khi người dùng click icon giỏ hàng ở header.

Cơ chế này giúp người dùng:

- Xem nhanh sản phẩm vừa thêm vào giỏ.
- Tăng/giảm số lượng sản phẩm.
- Xóa sản phẩm khỏi giỏ.
- Thêm lời nhắn cho đơn hàng.
- Xem gợi ý sản phẩm mua kèm.
- Kiểm tra tạm tính.
- Tiếp tục sang bước checkout mà không rời khỏi trang hiện tại ngay lập tức.

Lưu ý: hệ thống vẫn có thể có **trang giỏ hàng riêng**. Cart Drawer là quick cart/mini cart xuất hiện trên mọi trang có header.

---

## 2. Cơ chế mở Cart Drawer

## Trigger

Cart Drawer được mở khi người dùng:

- Click icon giỏ hàng trên header.
- Thêm sản phẩm vào giỏ thành công, nếu UX muốn tự động mở drawer.
- Click `Xem giỏ hàng` từ toast hoặc popup sau khi thêm sản phẩm.

## Không thay đổi route

Khi mở Cart Drawer:

- Người dùng vẫn ở trang hiện tại.
- Không điều hướng sang `/cart`.
- URL có thể giữ nguyên.

Có thể hỗ trợ query optional nếu muốn deep link:

```txt
/products?cart=open
```

Nhưng không bắt buộc.

## Overlay

Khi drawer mở:

- Toàn bộ page hiện tại phía sau bị phủ overlay mờ.
- Nội dung phía sau không tương tác được.
- Drawer trượt vào từ bên phải.
- Có thể đóng bằng:
  - Icon `X`.
  - Click overlay bên ngoài.
  - Phím `Esc`.

---

# 3. Bố cục giao diện

Cart Drawer gồm 4 khu vực chính:

1. Header drawer
2. Cart item list
3. Product recommendation section
4. Sticky footer summary + CTA

---

# 4. Header drawer

## Giao diện

Title:

```txt
Giỏ hàng (1)
```

Số trong ngoặc là tổng số lượng item hoặc số dòng sản phẩm trong giỏ tùy business rule. Đề xuất:

```txt
Giỏ hàng ({totalItems})
```

Trong đó `totalItems` là tổng số lượng sản phẩm trong giỏ.

Ví dụ:

- 1 sản phẩm x số lượng 2 → `Giỏ hàng (2)`
- 2 sản phẩm khác nhau, mỗi sản phẩm số lượng 1 → `Giỏ hàng (2)`

## Thành phần

- Title bên trái.
- Icon đóng `X` bên phải.

## Chức năng

- Click `X` đóng drawer.
- Khi drawer đóng, giữ nguyên trang hiện tại.
- Nếu giỏ hàng vừa được cập nhật, header cart badge ngoài trang cũng phải cập nhật.

---

# 5. Cart item card

## Giao diện trong ảnh

Mỗi sản phẩm trong giỏ gồm:

- Ảnh sản phẩm.
- Tên sản phẩm.
- Giá.
- Bộ điều chỉnh số lượng `- 1 +`.
- Icon xóa.
- Khu vực thêm lời nhắn cho đơn hàng.

Ví dụ item:

```txt
Bánh Mousse Thanh Nhãn 16cm
565.000 đ
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
  maxQuantity?: number;
  note?: string;
  variantName?: string;
  options?: CartItemOption[];
}
```

Nếu sản phẩm có biến thể như size, vị bánh, topping, cần hiển thị thêm dưới tên sản phẩm.

Ví dụ:

```txt
Size: 16cm
Vị: Thanh nhãn
```

## Chức năng tăng/giảm số lượng

### Click `+`

- Tăng quantity thêm 1.
- Gọi API update cart item.
- Cập nhật:
  - line total
  - subtotal
  - cart badge
  - drawer title count

Nếu vượt tồn kho:

```txt
Số lượng sản phẩm trong kho không đủ.
```

### Click `-`

- Giảm quantity đi 1.
- Nếu quantity > 1: cập nhật số lượng.
- Nếu quantity = 1 và user click `-`, có 2 lựa chọn:
  - Không cho giảm nữa, disable nút `-`.
  - Hoặc hỏi xác nhận xóa sản phẩm.

Đề xuất UX:

```txt
Disable nút `-` khi quantity = 1, dùng icon thùng rác để xóa.
```

## Chức năng xóa sản phẩm

Click icon xóa:

- Xóa item khỏi giỏ.
- Cập nhật subtotal và cart badge.
- Nếu giỏ trống, hiển thị empty cart state.

Có thể không cần confirm vì cart drawer là thao tác nhẹ, nhưng nên có undo toast nếu khả thi:

```txt
Đã xóa sản phẩm khỏi giỏ hàng. Hoàn tác
```

## API liên quan

```txt
PATCH /cart/items/:itemId
DELETE /cart/items/:itemId
```

Hoặc nếu backend dùng productId:

```txt
PATCH /cart/items/:productId
DELETE /cart/items/:productId
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need cart item update/delete endpoints.
```

---

# 6. Lời nhắn cho đơn hàng

## Giao diện

Label:

```txt
Thêm lời nhắn cho đơn hàng
```

Input placeholder:

```txt
Ví dụ: Viết chữ "Chúc mừng sinh nhật", cắm 5 cây nến...
```

## Chức năng

Người dùng có thể nhập ghi chú cho đơn hàng.

Ghi chú này có thể là:

- Ghi chú cho toàn bộ đơn hàng.
- Hoặc ghi chú cho riêng sản phẩm.

Dựa trên thiết kế, input nằm trong card sản phẩm nhưng label ghi “cho đơn hàng”, nên cần quyết định rõ.

## Đề xuất

Nếu đây là lời nhắn chung cho đơn hàng:

- Nên đặt input ở gần subtotal/footer, không nằm trong từng item.

Nếu đây là lời nhắn riêng cho bánh:

- Đổi label thành:

```txt
Thêm lời nhắn cho bánh này
```

Vì thiết kế hiện đặt input trong item card, đề xuất chức năng:

```txt
Ghi chú riêng cho sản phẩm trong giỏ.
```

## Behavior

- User nhập note.
- Debounce 500–800ms rồi lưu.
- Hoặc lưu khi user blur khỏi input.
- Nếu API lỗi, hiển thị lỗi nhỏ dưới input.

## API liên quan

```txt
PATCH /cart/items/:itemId
```

Payload ví dụ:

```json
{
  "note": "Viết chữ Chúc mừng sinh nhật, cắm 5 cây nến"
}
```

Nếu backend chỉ có note cấp order, cần đánh dấu:

```txt
TODO_BACKEND: Need to clarify whether cart note is item-level or order-level.
```

---

# 7. Product recommendation section

## Giao diện

Title:

```txt
Gợi ý thêm cho bạn
```

Action:

```txt
Xem tất cả
```

Hiển thị product cards nhỏ dạng ngang.

Trong ảnh có 3 sản phẩm gợi ý.

## Mục đích

Tăng cross-sell/upsell bằng cách gợi ý sản phẩm liên quan với sản phẩm trong giỏ.

## Logic gợi ý

Recommendation không nên là danh sách tĩnh nếu backend có dữ liệu sản phẩm.

Thứ tự ưu tiên logic:

1. Sản phẩm thường được mua kèm với item trong giỏ.
2. Sản phẩm cùng danh mục.
3. Sản phẩm bán chạy.
4. Sản phẩm mới.
5. Fallback static/config nếu chưa có API.

## Không hiển thị

Không nên hiển thị lại sản phẩm đã có trong giỏ.

## Dữ liệu cần có

```ts
export interface CartRecommendationItem {
  id: string;
  name: string;
  slug?: string;
  imageUrl: string;
  price: number;
  ratingAverage?: number;
  reviewCount?: number;
  reason?: string;
}
```

## Chức năng

### Click product recommendation

Điều hướng đến chi tiết sản phẩm hoặc mở quick view nếu có.

```txt
/products/:slug
```

### Click `Xem tất cả`

Điều hướng đến trang sản phẩm với filter phù hợp:

```txt
/products?sort=best-selling
```

hoặc:

```txt
/products?recommendedForCart=true
```

### Có nên có nút add to cart trong recommendation?

Trong ảnh chưa thấy nút add rõ ràng. Có thể giữ card nhỏ chỉ để xem sản phẩm.

Nếu thêm chức năng add nhanh:

- Card cần nút nhỏ `+`.
- Click thêm vào cart và refresh drawer.

## API liên quan

```txt
GET /cart/recommendations
```

Hoặc:

```txt
GET /products/recommendations?context=cart
```

Nếu backend chưa có recommendation:

```txt
TODO_BACKEND: Need cart recommendation endpoint or fallback rule.
```

---

# 8. Sticky footer summary

## Giao diện

Footer nằm cố định ở đáy drawer.

Hiển thị:

```txt
Tổng cộng tạm tính:
565.000 đ
```

CTA:

```txt
Tiếp tục →
```

## Chức năng subtotal

Subtotal phải được tính từ dữ liệu giỏ hàng thật.

```txt
subtotal = sum(unitPrice * quantity)
```

Nếu có discount, shipping, voucher, tax:

- Không nên tính ở drawer nếu chưa rõ.
- Drawer chỉ nên hiển thị `Tổng cộng tạm tính`.
- Các khoản phí chi tiết xử lý ở checkout/cart page.

## CTA `Tiếp tục`

Click `Tiếp tục` có thể điều hướng đến:

```txt
/checkout
```

Hoặc nếu hệ thống có trang giỏ hàng riêng:

```txt
/cart
```

## Đề xuất UX

Nếu có trang Cart riêng:

- Button chính trong drawer nên là:

```txt
Tiến hành thanh toán
```

hoặc:

```txt
Thanh toán
```

- Có link phụ:

```txt
Xem giỏ hàng
```

Nếu muốn bám theo thiết kế hiện tại, CTA `Tiếp tục` nên chuyển đến checkout hoặc bước tiếp theo trong mua hàng.

## Empty cart behavior

Nếu giỏ hàng trống:

- Disable CTA.
- Hiển thị empty state.

---

# 9. Empty cart state

Khi giỏ hàng không có sản phẩm, drawer không nên trống.

## Nội dung đề xuất

Title:

```txt
Giỏ hàng của bạn đang trống
```

Description:

```txt
Khám phá những chiếc bánh ngọt ngào và thêm vào giỏ hàng nhé.
```

CTA:

```txt
Tiếp tục mua sắm
```

Click CTA:

- Đóng drawer nếu user đang ở trang sản phẩm.
- Hoặc điều hướng đến `/products`.

## Recommendation khi cart rỗng

Có thể hiển thị:

- Sản phẩm bán chạy
- Sản phẩm mới
- Danh mục nổi bật

Nhưng cần lấy từ API hoặc config rõ ràng.

---

# 10. Cart Drawer state management

Cart Drawer là component dùng toàn app, nên không nên nằm riêng trong một feature page.

## Vị trí gợi ý

```txt
src/app/shared/components/cart-drawer/
```

hoặc nếu dùng layout-level component:

```txt
src/app/layouts/main-layout/components/cart-drawer/
```

## Cart state/service

Nên có service quản lý trạng thái giỏ hàng:

```txt
src/app/core/services/cart-state.service.ts
```

Hoặc nếu dùng signal/store:

```txt
src/app/core/state/cart.store.ts
```

## Trạng thái cần quản lý

```ts
export interface CartDrawerState {
  isOpen: boolean;
  isLoading: boolean;
  isUpdatingItem: boolean;
  error?: string;
}
```

Cart data:

```ts
export interface Cart {
  id?: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  currency: 'VND';
}
```

## Behavior toàn app

- Header click cart icon → mở drawer.
- Add to cart từ Product/Home → cập nhật cart state.
- Cart drawer đọc cùng cart state.
- Cart badge đọc từ `cart.totalItems`.
- Sau login, local cart nên được merge với server cart nếu backend hỗ trợ.

---

# 11. API checklist cho Cart Drawer

## Required endpoints

```txt
GET /cart
POST /cart/items
PATCH /cart/items/:itemId
DELETE /cart/items/:itemId
```

## Recommended endpoints

```txt
GET /cart/recommendations
POST /cart/merge
```

## Optional endpoints

```txt
PATCH /cart
```

Dùng để cập nhật note cấp cart/order nếu note không nằm ở item.

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
productName
productSlug
imageUrl
unitPrice
quantity
lineTotal
note
variantName
options
maxQuantity
stockQuantity
```

Recommendation product:

```txt
id
name
slug
imageUrl
price
ratingAverage
reviewCount
```

---

# 12. Interaction flow

## Flow 1 — Mở drawer từ header

1. User click icon giỏ hàng.
2. Overlay xuất hiện.
3. Drawer trượt từ bên phải.
4. Gọi `GET /cart` nếu cart chưa có hoặc cần refresh.
5. Hiển thị cart items.

## Flow 2 — Thêm sản phẩm vào giỏ từ Product page

1. User click `Thêm vào giỏ`.
2. Gọi `POST /cart/items`.
3. Update cart state.
4. Update header badge.
5. Mở Cart Drawer hoặc hiển thị toast.

Đề xuất:

```txt
Sau khi thêm sản phẩm thành công, tự động mở Cart Drawer.
```

Vì thiết kế drawer giúp xác nhận sản phẩm đã vào giỏ và gợi ý mua thêm.

## Flow 3 — Cập nhật số lượng

1. User click `+` hoặc `-`.
2. Disable tạm control đang update.
3. Gọi update API.
4. Update cart state.
5. Update subtotal.
6. Nếu lỗi, rollback quantity hoặc refetch cart.

## Flow 4 — Xóa item

1. User click icon xóa.
2. Gọi delete API.
3. Remove item khỏi cart state.
4. Update subtotal/badge.
5. Nếu cart empty, hiển thị empty state.

## Flow 5 — Tiếp tục checkout

1. User click `Tiếp tục`.
2. Nếu cart không rỗng, chuyển đến `/checkout` hoặc `/cart`.
3. Nếu user chưa đăng nhập, có thể:
   - Cho checkout guest nếu hệ thống hỗ trợ.
   - Hoặc chuyển đến `/login?redirect=/checkout`.

---

# 13. Overlay và accessibility

## Overlay

- Overlay màu đen/nâu với opacity khoảng 40–60%.
- Page phía sau bị blur hoặc tối.
- Không scroll body phía sau khi drawer mở.

## Accessibility

Cart Drawer nên hoạt động như dialog:

```txt
role="dialog"
aria-modal="true"
aria-label="Giỏ hàng"
```

Keyboard:

- `Esc` đóng drawer.
- Focus nằm trong drawer khi mở.
- Sau khi đóng, focus quay lại icon cart.
- Button close có aria-label:

```txt
Đóng giỏ hàng
```

---

# 14. Responsive behavior

## Desktop

- Drawer nằm bên phải.
- Width khoảng 420–480px.
- Overlay phủ toàn màn hình.
- Footer sticky ở đáy drawer.

## Tablet

- Drawer width khoảng 420px hoặc 70vw.
- Product recommendations có thể scroll ngang.

## Mobile

- Drawer có thể full width.
- Hoặc bottom sheet nếu muốn mobile-friendly hơn.
- Footer CTA sticky.
- Recommendation scroll ngang.
- Quantity controls đủ lớn để chạm.

---

# 15. Design tokens suy ra từ ảnh

> Các giá trị dưới đây là suy luận từ ảnh, cần đối chiếu lại với Figma nếu có file gốc.

## Kích thước

```txt
Drawer width desktop: 430–480px
Drawer padding: 24px
Header height: 64–72px
Cart item image: 72–88px
Recommendation card width: 110–140px
Footer height: 120–140px
```

## Màu sắc

```txt
Drawer background: #FFFFFF
Overlay: rgba(50, 43, 35, 0.45)
Primary Yellow: #F4C542
Dark Brown: #3B2A1E
Text Primary: #3A2A22
Text Secondary: #6F625A
Border Light: #E8E0D2
Muted Background: #F7F3EA
Danger/Delete: #C94A4A
```

## Radius

```txt
Drawer: 0px hoặc 16px bên trái nếu muốn mềm hơn
Cart item card: 12–16px
Input: 10–12px
Button: 12–16px hoặc pill
Recommendation card: 10–12px
```

---

# 16. Angular implementation proposal

## Component location

```txt
src/app/shared/components/cart-drawer/
  cart-drawer.component.ts
  cart-drawer.component.html
  cart-drawer.component.scss
```

## Supporting components

```txt
src/app/shared/components/cart-item-card/
src/app/shared/components/recommendation-card/
src/app/shared/components/quantity-stepper/
```

## Core API

```txt
src/app/core/api/cart.api.ts
```

Methods:

```ts
getCart(): Observable<Cart>
addItem(payload: AddCartItemRequest): Observable<Cart>
updateItem(itemId: string, payload: UpdateCartItemRequest): Observable<Cart>
removeItem(itemId: string): Observable<Cart>
getRecommendations(): Observable<CartRecommendationItem[]>
```

## Core state/service

```txt
src/app/core/services/cart-state.service.ts
```

Responsibilities:

- Store current cart.
- Store drawer open/close state.
- Expose totalItems for header badge.
- Handle add/update/remove item.
- Sync with backend/localStorage.

## Layout integration

Cart Drawer should be mounted once in main layout:

```txt
src/app/layouts/main-layout/
```

Example structure:

```html
<app-site-header />
<router-outlet />
<app-site-footer />
<app-cart-drawer />
```

Nếu footer không nằm trong main layout mà theo từng page, Cart Drawer vẫn nên mount ở layout/root để dùng được toàn app.

---

# 17. Relationship with full Cart page

Cart Drawer và Cart Page là 2 trải nghiệm khác nhau nhưng dùng chung cart state/API.

## Cart Drawer

Dùng để:

- Xem nhanh.
- Cập nhật số lượng nhanh.
- Xóa item.
- Gợi ý mua thêm.
- Đi tiếp checkout.

## Cart Page

Dùng để:

- Xem giỏ hàng đầy đủ.
- Chỉnh nhiều thông tin hơn.
- Áp voucher/coupon nếu có.
- Chọn phương thức giao hàng nếu flow yêu cầu.
- Xem tổng tiền chi tiết hơn.

## Rule

Không duplicate logic cart.

Dùng chung:

```txt
CartApi
CartStateService
Cart models
Cart item components nếu phù hợp
```

---

# 18. Acceptance criteria

Cart Drawer đạt yêu cầu khi:

## Open/close

- Click icon cart mở drawer trên trang hiện tại.
- Không chuyển route khi mở drawer.
- Overlay làm mờ page phía sau.
- Click `X`, overlay hoặc Esc đóng drawer.
- Body phía sau không scroll khi drawer mở.

## Data

- Drawer hiển thị dữ liệu giỏ hàng thật.
- Header title hiển thị đúng số lượng item.
- Header cart badge đồng bộ với drawer.
- Subtotal tính đúng từ cart items.

## Cart item

- Hiển thị ảnh, tên, giá, số lượng.
- Tăng/giảm số lượng hoạt động.
- Không cho quantity vượt tồn kho nếu có.
- Xóa item hoạt động.
- Ghi chú sản phẩm/đơn hàng được lưu hoặc đánh dấu TODO_BACKEND nếu backend chưa hỗ trợ.

## Recommendations

- Gợi ý sản phẩm không hardcode nếu backend có dữ liệu.
- Không hiển thị sản phẩm đã có trong giỏ.
- `Xem tất cả` điều hướng đúng.

## CTA

- `Tiếp tục` chuyển đến `/checkout` hoặc `/cart` theo flow đã chọn.
- Nếu giỏ trống, CTA disabled hoặc chuyển thành `Tiếp tục mua sắm`.

## States

- Có loading state khi tải giỏ hàng.
- Có updating state khi tăng/giảm/xóa item.
- Có empty cart state.
- Có error state khi API lỗi.
- Có feedback khi thêm/cập nhật/xóa thành công hoặc thất bại.

## Technical

- Cart Drawer là component dùng toàn app.
- Không duplicate cart logic giữa drawer và cart page.
- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Responsive tốt trên desktop/tablet/mobile.
- Có accessibility cơ bản cho drawer/dialog.
