# checkout.md

# Mô tả chức năng trang Đặt hàng / Checkout — WeBee Bakery

> **⚠️ BACKEND ALIGNMENT & UI/UX CONTRACT (UPDATED 2026-06-27)**
> Nguyên tắc tối thượng: **Yêu cầu nghiệp vụ UI/UX là bắt buộc. Nếu Backend chưa có thì bắt buộc Backend phải cập nhật (`TODO_BACKEND`), tuyệt đối không được cắt bỏ UI của người dùng.**
> 1. **Phương thức thanh toán**: **BẮT BUỘC có 2 phương thức: COD (Thanh toán khi nhận hàng) và Chuyển khoản ngân hàng (`transfer`)**. Backend hiện tại chỉ có `transfer`, yêu cầu Backend bổ sung `cod` vào schema (`z.enum(["transfer", "cod"])`).
> 2. **Hóa đơn doanh nghiệp & Phí vận chuyển**: UI phải giữ nguyên form yêu cầu hóa đơn và hiển thị phí vận chuyển. Yêu cầu Backend bổ sung các trường hóa đơn vào `orders` và API tính phí giao hàng (`TODO_BACKEND`).
> 3. **Thời gian nhận hàng**: `delivery_date` và `delivery_time_slot` là 2 trường **BẮT BUỘC (REQUIRED)** cho đặc thù bánh tươi. Form checkout validate required cho 2 trường này.
> 4. **Cấu trúc địa chỉ**: Frontend hiển thị 3 dropdown (Tỉnh/Quận/Phường) cho trải nghiệm người dùng, gộp (concatenate) thành 1 chuỗi string `delivery_address` khi gửi lên API `POST /orders`.
> 5. **Quay lại giỏ hàng**: Bắt buộc có link/nút "Chỉnh sửa giỏ hàng" trong khu vực Tóm tắt đơn hàng dẫn về `/cart`.
> 6. **API Auth**: Sử dụng `GET /users/me` thay vì `GET /auth/me`.

## 1. Vai trò của trang Đặt hàng

Trang Đặt hàng là bước người dùng xác nhận thông tin nhận hàng, thời gian nhận hàng, phương thức thanh toán, voucher, ghi chú và hoàn tất đơn hàng.

Trang này là bước quan trọng nhất trong luồng mua hàng, vì nó chuyển dữ liệu từ **giỏ hàng** thành **đơn hàng thật**.

Mục tiêu chính:

- Cho phép người dùng chọn phương thức nhận hàng.
- Nhập thông tin người nhận.
- Chọn thời gian nhận hàng.
- Chọn phương thức thanh toán.
- Áp dụng voucher.
- Ghi chú cho cửa hàng.
- Yêu cầu xuất hóa đơn doanh nghiệp nếu cần.
- Kiểm tra tóm tắt đơn hàng.
- Đặt hàng và tạo order trong backend.

---

## 2. Tổng quan bố cục

Trang Đặt hàng gồm 2 cột chính trên desktop:

### Cột trái — Form đặt hàng

Bao gồm:

1. Phương thức nhận hàng
2. Tùy chọn người nhận khác người mua
3. Thông tin người nhận
4. Thời gian nhận hàng
5. Phương thức thanh toán
6. Voucher
7. Ghi chú đơn hàng
8. Yêu cầu xuất hóa đơn doanh nghiệp

### Cột phải — Tóm tắt đơn hàng

Bao gồm:

1. Danh sách sản phẩm trong đơn
2. Tạm tính
3. Phí vận chuyển
4. Tổng cộng
5. Button đặt hàng

### Footer

Dùng chung footer của website.

---

# 3. Header / Navigation

## Giao diện

Header giống các trang còn lại:

- Logo WeBee.
- Menu:
  - Trang chủ
  - Sản phẩm
  - Tùy chỉnh bánh
  - Blog
  - Chính sách
- Search icon.
- Cart icon có badge.
- Button `Đăng nhập / Đăng ký` hoặc user menu.

## Chức năng

- Logo click về `/`.
- Cart icon vẫn mở Cart Drawer.
- Cart badge phản ánh số lượng sản phẩm thật trong giỏ.
- Nếu người dùng đã đăng nhập, button login đổi thành user menu.

## Lưu ý checkout

Trong checkout, không nên làm header quá phức tạp hoặc gây xao nhãng. Tuy nhiên vẫn giữ điều hướng cơ bản theo thiết kế.

---

# 4. Page title

## Giao diện

Title:

```txt
Đặt hàng
```

## Chức năng

Title xác nhận người dùng đang ở bước checkout.

Route đề xuất:

```txt
/checkout
```

Nếu user truy cập checkout khi giỏ hàng trống:

- Hiển thị empty checkout state.
- CTA quay lại trang sản phẩm.

```txt
Giỏ hàng của bạn đang trống.
Quay lại mua bánh
```

---

# 5. Phương thức nhận hàng

## Giao diện

Section title:

```txt
PHƯƠNG THỨC NHẬN HÀNG
```

Có 2 option dạng segmented card:

1. `Giao hàng`
2. `Ghé lấy tại Cửa hàng`

Trong ảnh, `Giao hàng` đang được chọn.

## Chức năng

Người dùng chọn một trong hai phương thức:

### Giao hàng

Khi chọn `Giao hàng`:

- Hiển thị form địa chỉ giao hàng.
- Tính phí vận chuyển.
- Yêu cầu nhập đầy đủ địa chỉ.
- Cho phép chọn thời gian giao hàng.

### Ghé lấy tại Cửa hàng

Khi chọn `Ghé lấy tại Cửa hàng`:

- Có thể ẩn form địa chỉ giao hàng.
- Hiển thị thông tin cửa hàng nhận bánh.
- Phí vận chuyển = 0.
- Thời gian nhận hàng hiểu là thời gian đến lấy.

## State

```ts
type FulfillmentMethod = 'delivery' | 'pickup';
```

## API/data liên quan

```txt
GET /stores                         optional
POST /shipping/estimate             TODO_BACKEND nếu chưa có
```

Nếu backend chưa có phí vận chuyển động, có thể dùng tạm phí cố định trong config, nhưng phải ghi rõ.

---

# 6. Người nhận khác người mua

## Giao diện

Card nhỏ với checkbox bên phải:

```txt
Người nhận khác người mua
Gửi tặng món quà ngọt ngào này cho người thân
```

## Chức năng

Checkbox này dùng cho trường hợp người mua đặt bánh tặng người khác.

Nếu unchecked:

- Thông tin người nhận có thể tự động lấy từ thông tin tài khoản người mua nếu đã đăng nhập.
- Người dùng vẫn có thể chỉnh nếu cần.

Nếu checked:

- Form người nhận bắt buộc nhập riêng.
- Có thể hiển thị thêm các field:
  - Tên người nhận
  - Số điện thoại người nhận
  - Lời nhắn tặng kèm nếu chưa có ở cart/order note

## Field đề xuất

```ts
isGiftRecipient: boolean;
```

## Lưu ý UX

Label trong ảnh đang có lỗi encoding:

```txt
Người nhận khác ngưỜi mua
```

Khi implement cần sửa thành:

```txt
Người nhận khác người mua
```

---

# 7. Thông tin người nhận

## Giao diện

Section title:

```txt
THÔNG TIN NGƯỜI NHẬN
```

Các field:

- Họ tên
- SĐT
- Địa chỉ giao hàng
- Tỉnh/Thành phố
- Quận/Huyện
- Phường/Xã

## Chức năng

Form này dùng để xác định người nhận và địa chỉ giao hàng.

## Field validation

### Họ tên

- Required.
- Không chỉ chứa khoảng trắng.
- Độ dài đề xuất: 2–100 ký tự.

Thông báo lỗi:

```txt
Vui lòng nhập họ tên người nhận.
```

### Số điện thoại

- Required.
- Định dạng số điện thoại Việt Nam.
- 10 chữ số hoặc theo rule backend.

Thông báo lỗi:

```txt
Vui lòng nhập số điện thoại hợp lệ.
```

### Địa chỉ giao hàng

- Required nếu fulfillment method là `delivery`.
- Có thể optional nếu fulfillment method là `pickup`.

Thông báo lỗi:

```txt
Vui lòng nhập địa chỉ giao hàng.
```

### Tỉnh/Thành phố, Quận/Huyện, Phường/Xã

- Required nếu giao hàng.
- Dropdown phụ thuộc nhau:
  - Chọn tỉnh → load quận/huyện
  - Chọn quận/huyện → load phường/xã

## API/data liên quan

Có 2 hướng:

### Dùng dữ liệu địa giới local

```txt
src/app/shared/data/vietnam-addresses.json
```

### Hoặc dùng API

```txt
GET /locations/provinces
GET /locations/districts?provinceCode=...
GET /locations/wards?districtCode=...
```

Nếu backend chưa có, dùng local static data là hợp lý.

## Model đề xuất

```ts
export interface RecipientInfo {
  fullName: string;
  phone: string;
  addressLine: string;
  provinceCode?: string;
  provinceName?: string;
  districtCode?: string;
  districtName?: string;
  wardCode?: string;
  wardName?: string;
}
```

---

# 8. Thời gian nhận hàng

## Giao diện

Section title:

```txt
THỜI GIAN NHẬN HÀNG
```

Các option trong ảnh:

- Hôm nay (12/6)
- Ngày mai (13/6)
- T2 (14/6)
- Ngày khác

## Chức năng

Người dùng chọn ngày nhận/giao bánh.

## Logic ngày

Các option ngày không nên hardcode cố định. Phải generate động theo ngày hiện tại.

Ví dụ:

- Hôm nay
- Ngày mai
- Ngày kế tiếp
- Ngày khác

Nếu cửa hàng cần thời gian chuẩn bị bánh, cần áp dụng rule lead time.

Ví dụ:

```txt
Bánh thường: có thể giao hôm nay.
Bánh tùy chỉnh: cần đặt trước 24–48h.
```

## Ngày khác

Khi chọn `Ngày khác`:

- Mở date picker.
- Chỉ cho chọn ngày hợp lệ.
- Không cho chọn ngày quá khứ.
- Không cho chọn ngày cửa hàng nghỉ nếu có business rule.

## Time slot

Thiết kế hiện chỉ chọn ngày, chưa chọn khung giờ. Nhưng thực tế checkout nên có khung giờ nhận/giao.

Đề xuất thêm sau nếu backend/business cần:

```txt
08:00–10:00
10:00–12:00
14:00–16:00
16:00–18:00
```

Nếu chưa có thiết kế, đánh dấu:

```txt
TODO_DESIGN: Checkout currently does not show delivery/pickup time slots.
```

## Model đề xuất

```ts
export interface FulfillmentTime {
  date: string;       // YYYY-MM-DD
  label?: string;     // Hôm nay, Ngày mai
  timeSlot?: string;
}
```

---

# 9. Phương thức thanh toán

## Giao diện

Section title:

```txt
PHƯƠNG THỨC THANH TOÁN
```

Có 2 option:

1. `COD`
2. `Chuyển khoản`

Trong ảnh, `COD` đang được chọn.

## Chức năng

Người dùng chọn phương thức thanh toán cho đơn hàng.

## COD

Khi chọn COD:

- Đơn hàng được tạo với trạng thái thanh toán `unpaid` hoặc `cod_pending`.
- Người dùng thanh toán khi nhận hàng.

## Chuyển khoản

Khi chọn chuyển khoản:

- Có thể tạo đơn hàng trước rồi hiển thị thông tin chuyển khoản/QR.
- Hoặc tạo payment intent trước khi xác nhận đơn.

Đề xuất UX:

1. User chọn `Chuyển khoản`.
2. User click `Đặt hàng`.
3. Backend tạo order.
4. Frontend điều hướng đến trang thanh toán chuyển khoản hoặc hiển thị modal QR.

Route gợi ý:

```txt
/orders/:orderId/payment
```

hoặc:

```txt
/checkout/payment/:orderId
```

## Model

```ts
type PaymentMethod = 'cod' | 'bank_transfer';
```

## API liên quan

```txt
POST /orders
POST /payments/bank-transfer        optional
```

Nếu chưa có payment API:

```txt
TODO_BACKEND: Need bank transfer payment flow or QR generation endpoint.
```

---

# 10. Voucher

## Giao diện

Section title:

```txt
VOUCHER
```

Input:

```txt
Chọn hoặc nhập mã voucher
```

Button:

```txt
Áp dụng
```

## Chức năng

Người dùng có thể nhập mã voucher hoặc chọn voucher có sẵn.

## Behavior

Khi user nhập mã và click `Áp dụng`:

1. Validate input không rỗng.
2. Gọi API kiểm tra voucher.
3. Nếu hợp lệ:
   - Hiển thị discount.
   - Cập nhật order summary.
   - Lưu applied voucher vào checkout state.
4. Nếu không hợp lệ:
   - Hiển thị lỗi.

Thông báo lỗi đề xuất:

```txt
Mã voucher không hợp lệ hoặc đã hết hạn.
```

## Có thể có voucher selector

Nếu user đăng nhập và có voucher riêng:

- Click input mở danh sách voucher khả dụng.
- User chọn voucher rồi apply.

## API liên quan

```txt
POST /vouchers/validate
GET /vouchers/available             optional
```

Nếu backend chưa có voucher:

```txt
TODO_BACKEND: Voucher validation endpoint is required before enabling voucher discounts.
```

## Model

```ts
export interface AppliedVoucher {
  code: string;
  discountAmount: number;
  discountType?: 'fixed' | 'percent';
}
```

---

# 11. Ghi chú đơn hàng

## Giao diện

Section title:

```txt
GHI CHÚ ĐƠN HÀNG
```

Textarea placeholder:

```txt
Lời nhắn cho cửa hàng...
```

## Chức năng

Cho phép người dùng gửi ghi chú chung cho cửa hàng.

Ví dụ:

- Giao trước 5 giờ chiều.
- Gọi trước khi giao.
- Viết chữ lên bánh.
- Không cần nến.
- Giao cho bảo vệ.

## Validation

- Optional.
- Giới hạn ký tự đề xuất: 500–1000 ký tự.

## Model

```ts
orderNote?: string;
```

## Lưu ý

Nếu Cart Drawer đã có note cho từng sản phẩm, checkout note là note cấp đơn hàng. Không nên trộn 2 loại note.

---

# 12. Yêu cầu xuất hóa đơn doanh nghiệp

## Giao diện

Checkbox:

```txt
Yêu cầu xuất hóa đơn Doanh nghiệp
```

## Chức năng

Nếu user tick checkbox:

- Hiển thị thêm form thông tin hóa đơn doanh nghiệp.

Các field đề xuất:

- Tên công ty
- Mã số thuế
- Địa chỉ công ty
- Email nhận hóa đơn

## Validation

Nếu checkbox được chọn:

- Tên công ty: required
- Mã số thuế: required
- Địa chỉ công ty: required
- Email nhận hóa đơn: required, email format

## Model

```ts
export interface InvoiceInfo {
  required: boolean;
  companyName?: string;
  taxCode?: string;
  companyAddress?: string;
  invoiceEmail?: string;
}
```

## API/backend

Order payload cần chứa thông tin invoice nếu user yêu cầu.

Nếu backend chưa hỗ trợ:

```txt
TODO_BACKEND: Order API needs invoice information fields.
```

## Lưu ý wording

Nên sửa lỗi encoding trong ảnh:

```txt
Yêu cầu xuất hóa đơn Doanh nghiệp
```

---

# 13. Tóm tắt đơn hàng

## Giao diện

Card bên phải, sticky theo viewport nếu page dài.

Title:

```txt
Tóm tắt đơn hàng
```

Có số sản phẩm:

```txt
(2 sản phẩm)
```

Danh sách item:

- Ảnh nhỏ.
- Tên sản phẩm.
- Số lượng.
- Giá.

Ví dụ:

```txt
Bánh Mousse Nhãn
SL: 1
360.000đ

Bánh Mousse Việt Quất
SL: 1
450.000đ
```

Summary:

```txt
Tạm tính: 810.000đ
Phí vận chuyển: 30.000đ
Tổng cộng: 840.000đ
```

CTA:

```txt
Đặt hàng
```

## Chức năng

Summary phải lấy từ cart/checkout state, không hardcode.

## Công thức

```txt
subtotal = sum(item.unitPrice * item.quantity)
shippingFee = calculated based on fulfillment method/address
discountAmount = voucher discount if applied
total = subtotal + shippingFee - discountAmount
```

Nếu pickup:

```txt
shippingFee = 0
```

Nếu chưa nhập đủ địa chỉ giao hàng:

- Có thể hiển thị phí dự kiến.
- Hoặc hiển thị `Chưa xác định`.

## Product item behavior

Có thể click item để quay lại chi tiết sản phẩm.

Không nên cho chỉnh quantity trực tiếp ở order summary nếu Cart Drawer/Cart Page đã xử lý. Nhưng có thể có link:

```txt
Chỉnh sửa giỏ hàng
```

---

# 14. Đặt hàng CTA

## Giao diện

Button vàng:

```txt
Đặt hàng
```

## Chức năng

Khi user click `Đặt hàng`:

1. Validate toàn bộ form.
2. Validate cart không rỗng.
3. Validate delivery/pickup information.
4. Validate payment method.
5. Validate voucher nếu có.
6. Gọi API tạo order.
7. Xử lý theo payment method.

## Nếu COD

Sau khi tạo order thành công:

- Điều hướng đến trang thành công.

```txt
/order-success/:orderId
```

hoặc:

```txt
/orders/:orderId/success
```

## Nếu chuyển khoản

Sau khi tạo order thành công:

- Điều hướng đến trang thanh toán chuyển khoản/QR.
- Hoặc mở modal QR.

```txt
/checkout/payment/:orderId
```

## Loading state

Khi đang đặt hàng:

```txt
Đang đặt hàng...
```

Button disabled để tránh double submit.

## Error state

Nếu lỗi:

```txt
Không thể tạo đơn hàng. Vui lòng kiểm tra thông tin và thử lại.
```

Nếu cart đã thay đổi/hết hàng:

```txt
Một số sản phẩm trong giỏ đã thay đổi. Vui lòng kiểm tra lại giỏ hàng.
```

---

# 15. Checkout data model đề xuất

## Checkout form value

```ts
export interface CheckoutFormValue {
  fulfillmentMethod: 'delivery' | 'pickup';
  isGiftRecipient: boolean;
  recipient: RecipientInfo;
  fulfillmentTime: FulfillmentTime;
  paymentMethod: 'cod' | 'bank_transfer';
  voucherCode?: string;
  orderNote?: string;
  invoiceInfo?: InvoiceInfo;
}
```

## Create order request

```ts
export interface CreateOrderRequest {
  fulfillmentMethod: 'delivery' | 'pickup';
  recipient: RecipientInfo;
  fulfillmentTime: FulfillmentTime;
  paymentMethod: 'cod' | 'bank_transfer';
  voucherCode?: string;
  orderNote?: string;
  invoiceInfo?: InvoiceInfo;
}
```

Nếu backend yêu cầu gửi cart items trực tiếp, thêm:

```ts
items: OrderItemRequest[];
```

Tuy nhiên đề xuất tốt hơn:

```txt
Backend tạo order từ cart hiện tại của user/session.
```

để tránh frontend tự tính sai giá.

---

# 16. API checklist cho Checkout

## Required endpoints

```txt
GET /cart
POST /orders
```

## Recommended endpoints

```txt
POST /shipping/estimate             (Lưu ý: phí luôn là 0)
POST /vouchers/validate
GET /users/me
```

## Optional endpoints

```txt
GET /vouchers/available
GET /stores
GET /locations/provinces
GET /locations/districts?provinceCode=...
GET /locations/wards?districtCode=...
POST /payments/bank-transfer
```

## Backend fields/order payload cần hỗ trợ

Order:

```txt
fulfillmentMethod
recipient
deliveryAddress
pickupStoreId
fulfillmentDate
fulfillmentTimeSlot
paymentMethod
voucherCode
orderNote
invoiceInfo
```

Cart/order summary:

```txt
items
subtotal
shippingFee
discountAmount
total
currency
```

---

# 17. State management

Checkout page cần quản lý các state:

```ts
export interface CheckoutState {
  cartLoading: boolean;
  orderSubmitting: boolean;
  voucherApplying: boolean;
  shippingEstimating: boolean;
  error?: string;
}
```

## Nguồn dữ liệu

- Cart lấy từ CartStateService hoặc CartApi.
- Auth lấy từ AuthStateService/AuthApi.
- Voucher validate qua API.
- Shipping fee tính qua API hoặc config.
- Form dùng Reactive Forms.

## Không nên

- Không tự tạo order từ dữ liệu hardcode.
- Không tự tính tổng tiền cuối cùng nếu backend có order pricing.
- Không bỏ qua validation trước khi gọi API.

---

# 18. Form behavior

## Reactive Forms

Checkout nên dùng Reactive Forms vì nhiều field và validation.

## Auto-fill

Nếu user đã đăng nhập:

- Tự fill họ tên, số điện thoại nếu backend có user profile.
- User vẫn có thể chỉnh.

## Dependent dropdown

Tỉnh/Thành phố → Quận/Huyện → Phường/Xã.

Khi đổi tỉnh:

- Clear quận/huyện.
- Clear phường/xã.
- Recalculate shipping nếu cần.

Khi đổi quận/huyện:

- Clear phường/xã.
- Recalculate shipping nếu cần.

## Persist draft

Có thể lưu checkout draft vào localStorage để tránh mất form khi refresh.

Chỉ lưu thông tin không quá nhạy cảm và phù hợp privacy.

---

# 19. Empty/invalid cart behavior

Nếu cart rỗng:

- Không hiển thị form checkout đầy đủ.
- Hiển thị empty state:

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

Nếu cart có sản phẩm hết hàng:

- Hiển thị warning.
- Disable đặt hàng cho đến khi user cập nhật giỏ.

---

# 20. Relationship với Cart Drawer và Cart Page

Checkout không thay thế Cart Drawer/Cart Page.

## Cart Drawer

Dùng để xem nhanh, chỉnh quantity nhanh, tiếp tục checkout.

## Cart Page

Dùng để quản lý giỏ đầy đủ nếu project có.

## Checkout Page

Dùng để xác nhận thông tin nhận hàng, thanh toán và tạo order.

## Rule

Checkout dùng chung:

```txt
CartApi
CartStateService
Cart models
Order models
```

Không duplicate cart logic trong checkout.

---

# 21. Footer

Footer dùng chung với Home/Product/Detail.

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

---

# 22. Responsive behavior

## Desktop

- Layout 2 cột:
  - Form bên trái.
  - Order summary bên phải.
- Order summary sticky ở top khi scroll.
- Footer full width.

## Tablet

- Có thể vẫn 2 cột nếu đủ rộng.
- Hoặc order summary chuyển lên trên/dưới form.

## Mobile

- Layout 1 cột.
- Order summary có thể nằm trước CTA hoặc collapsible.
- Button `Đặt hàng` có thể sticky bottom.
- Các segmented controls chuyển thành 1 hoặc 2 cột.
- Form fields full width.
- Footer 1 cột.

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
Error: #C94A4A
```

## Typography

```txt
Page title: 36–44px, bold
Section title: 13–14px, uppercase, bold
Input text: 14–16px
Summary product name: 14–15px, bold
Total price: 24–28px, bold
Button: 15–16px, semi-bold
```

## Layout

```txt
Page max width: 1200–1280px
Left form width: khoảng 760px
Right summary width: khoảng 360–400px
Card radius: 16–20px
Input radius: 10–12px
Button radius: 12–16px
Section gap: 24–32px
```

---

# 24. Angular implementation proposal

## Route

```txt
/checkout
```

## Feature folder

```txt
src/app/features/checkout/
  checkout.routes.ts
  pages/
    checkout/
      checkout.page.ts
      checkout.page.html
      checkout.page.scss
  components/
    fulfillment-method-selector/
    recipient-form/
    fulfillment-time-selector/
    payment-method-selector/
    voucher-box/
    invoice-info-form/
    order-summary-card/
```

## Shared components nên dùng

```txt
src/app/shared/components/
  site-header/
  site-footer/
  form-field/
  select-field/
  textarea-field/
  loading-state/
  empty-state/
  error-state/
```

## Core API services

```txt
src/app/core/api/cart.api.ts
src/app/core/api/orders.api.ts
src/app/core/api/vouchers.api.ts
src/app/core/api/shipping.api.ts
src/app/core/api/locations.api.ts
```

## Core models

```txt
src/app/core/models/cart.model.ts
src/app/core/models/order.model.ts
src/app/core/models/checkout.model.ts
src/app/core/models/location.model.ts
```

---

# 25. Order creation flow

## Flow COD

1. User vào `/checkout`.
2. Frontend load cart.
3. User nhập thông tin.
4. User chọn COD.
5. User click `Đặt hàng`.
6. Frontend validate form.
7. Gọi `POST /orders`.
8. Backend tạo order từ cart.
9. Backend trả orderId.
10. Frontend clear cart state hoặc refetch cart.
11. Điều hướng đến order success page.

## Flow chuyển khoản

1. User vào `/checkout`.
2. Frontend load cart.
3. User nhập thông tin.
4. User chọn chuyển khoản.
5. User click `Đặt hàng`.
6. Gọi `POST /orders`.
7. Backend tạo order trạng thái chờ thanh toán.
8. Backend tạo thông tin thanh toán/QR hoặc frontend gọi payment API.
9. Điều hướng sang trang thanh toán QR.
10. Sau khi thanh toán thành công, cập nhật order payment status.

---

# 26. Acceptance criteria

Trang Đặt hàng đạt yêu cầu khi:

## Header

- Header giống các trang khác.
- Cart badge đồng bộ với cart thật.
- Cart icon mở Cart Drawer.

## Form

- Chọn được phương thức nhận hàng.
- Nếu chọn giao hàng, bắt buộc nhập địa chỉ.
- Nếu chọn lấy tại cửa hàng, xử lý phí vận chuyển = 0 và không bắt địa chỉ giao hàng.
- Checkbox người nhận khác người mua hoạt động.
- Thông tin người nhận có validation.
- Chọn được ngày nhận hàng.
- Chọn được phương thức thanh toán.
- Nhập và áp dụng voucher nếu backend hỗ trợ.
- Nhập được ghi chú đơn hàng.
- Checkbox xuất hóa đơn doanh nghiệp hiển thị form invoice khi được chọn.

## Order summary

- Hiển thị đúng sản phẩm từ cart.
- Tạm tính, phí vận chuyển, giảm giá, tổng cộng tính đúng.
- Không hardcode giá/số lượng.
- Cập nhật khi voucher/shipping thay đổi.

## Đặt hàng

- Button `Đặt hàng` validate toàn bộ form.
- Có loading state khi submit.
- Không cho submit nhiều lần.
- Tạo order qua backend.
- COD điều hướng đến trang thành công.
- Chuyển khoản điều hướng đến trang thanh toán/QR hoặc flow tương ứng.

## States

- Có loading state khi load cart.
- Có empty cart state.
- Có error state khi API lỗi.
- Có warning nếu cart có sản phẩm hết hàng hoặc thay đổi giá.

## Technical

- Checkout dùng Reactive Forms.
- Dùng chung CartApi/CartStateService với Cart Drawer.
- Không duplicate cart logic.
- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Responsive desktop/tablet/mobile cơ bản.
- Text tiếng Việt hiển thị đúng encoding.
