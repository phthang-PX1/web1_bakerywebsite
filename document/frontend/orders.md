# orders.md

# Mô tả chức năng màn hình Loading, Đặt hàng thành công và Đơn hàng của tôi — WeBee Bakery

> **⚠️ BACKEND ALIGNMENT & UI/UX CONTRACT (UPDATED 2026-06-27)**
> Nguyên tắc tối thượng: **Yêu cầu nghiệp vụ UI/UX là bắt buộc. Nếu Backend chưa có thì bắt buộc Backend phải cập nhật (`TODO_BACKEND`), tuyệt đối không được cắt bỏ UI của người dùng.**
> 1. **Thanh toán COD**: **BẮT BUỘC hỗ trợ luồng COD**. Nếu khách chọn COD → hiển thị màn hình Đặt hàng thành công (`/orders/:orderId/success`) với trạng thái thanh toán `unpaid`/`cod_pending` và nút xem chi tiết đơn hàng. Yêu cầu Backend bổ sung `cod` vào schema.
> 2. **Thanh toán Chuyển khoản**: Nếu khách chọn chuyển khoản (`transfer`) → chuyển đến `/orders/:orderId/track` (hiển thị QR chuyển khoản + polling API mỗi 3 giây). Khi `paymentStatus === 'paid'` → chuyển đến `/account/orders/:orderId`.
> 3. **Viết đánh giá (Review)**: Nút/form đánh giá chỉ được kích hoạt hiển thị khi đơn hàng có trạng thái `delivered`.

## 1. Vai trò của flow sau khi đặt hàng

Flow sau khi đặt hàng là bước xác nhận cuối cùng sau khi người dùng bấm `Đặt hàng` tại trang Checkout.

Flow này cần xử lý 3 trạng thái chính:

1. **Loading / đang xác nhận đơn hàng**
2. **Đặt hàng thành công**
3. **Tự động chuyển sang trang Đơn hàng của tôi / Chi tiết đơn hàng**

Mục tiêu:

- Cho người dùng biết hệ thống đang xử lý đơn hàng.
- Tránh việc người dùng bấm đặt hàng nhiều lần.
- Hiển thị mã đơn hàng sau khi xác nhận thành công.
- Hiển thị thời gian giao/nhận dự kiến.
- Tự động điều hướng sang khu vực tài khoản để xem trạng thái đơn hàng.
- Cho phép người dùng theo dõi tiến trình xử lý đơn hàng.
- Cho phép đánh giá/phản hồi khi đơn hàng đã đủ điều kiện.

---

# 2. Tổng quan flow

## Flow tổng thể

```txt
Checkout
→ User click Đặt hàng
→ Hiển thị loading xác nhận
→ Backend tạo order / xác nhận thanh toán
→ Hiển thị màn hình Đặt hàng thành công
→ Sau vài giây tự động chuyển sang Đơn hàng của tôi
→ Hiển thị chi tiết đơn hàng và trạng thái xử lý
```

## Route đề xuất

```txt
/checkout
/order-processing
/order-success/:orderId
/account/orders/:orderId
```

Hoặc có thể rút gọn:

```txt
/checkout/success/:orderId
/account/orders/:orderId
```

## Lưu ý quan trọng

Màn hình thành công không nên chỉ là trang tĩnh. Nó phải nhận dữ liệu từ order thật đã được tạo thành công.

Các thông tin như:

- Mã đơn hàng
- Thời gian giao dự kiến
- Trạng thái đơn hàng
- Số lượng sản phẩm
- Tổng tiền

phải lấy từ backend/order response hoặc order detail API.

---

# 3. Màn hình Loading / Đang xác nhận đơn hàng

## 3.1. Mục đích

Màn hình loading xuất hiện trong lúc:

- Frontend đang gửi request tạo order.
- Backend đang xác nhận giỏ hàng.
- Backend đang kiểm tra tồn kho/giá/voucher.
- Backend đang tạo order.
- Nếu thanh toán chuyển khoản/QR, hệ thống đang xác nhận thanh toán hoặc tạo payment record.
- Frontend đang chờ kết quả thành công/thất bại.

## 3.2. Giao diện đề xuất

Giao diện nên dùng cùng phong cách WeBee:

- Logo hoặc icon ong WeBee ở giữa.
- Loading spinner hoặc animation nhẹ.
- Headline:

```txt
Đang xác nhận đơn hàng...
```

- Description:

```txt
WeBee đang kiểm tra thông tin đơn hàng và thanh toán của bạn. Vui lòng không đóng trang.
```

Nếu là thanh toán COD:

```txt
WeBee đang tạo đơn hàng của bạn.
```

Nếu là chuyển khoản:

```txt
WeBee đang xác nhận thanh toán của bạn.
```

## 3.3. Behavior

Trong lúc loading:

- Disable toàn bộ action đặt hàng.
- Không cho submit lại.
- Không xóa cart cho đến khi order được xác nhận thành công.
- Nếu user refresh, frontend cần có cách kiểm tra lại order/payment status nếu đã có orderId.
- Nếu request quá lâu, hiển thị message hỗ trợ.

## 3.4. Timeout handling

Nếu quá thời gian chờ, ví dụ 30–60 giây:

```txt
Quá trình xác nhận đang mất nhiều thời gian hơn dự kiến.
```

CTA:

```txt
Kiểm tra trạng thái đơn hàng
```

hoặc:

```txt
Thử lại
```

Không tự tạo order lần 2 nếu không rõ trạng thái request trước đó.

## 3.5. API/state liên quan

```txt
POST /orders
GET /orders/:orderId
GET /payments/:paymentId/status        optional
```

Nếu dùng chuyển khoản và cần polling:

```txt
GET /orders/:orderId/payment-status
```

Nếu backend chưa có kiểm tra trạng thái thanh toán:

```txt
TODO_BACKEND: Need payment/order status endpoint for post-checkout confirmation.
```

---

# 4. Màn hình Đặt hàng thành công

## 4.1. Mục đích

Hiển thị xác nhận rõ ràng rằng đơn hàng đã được tạo/thanh toán thành công.

Đây là trạng thái sau loading, trước khi tự động chuyển sang trang Đơn hàng của tôi.

## 4.2. Giao diện trong ảnh

Màn hình gồm:

- Header chung.
- Logo/icon ong ở giữa.
- Headline:

```txt
Đặt hàng thành công!
```

- Card thông tin đơn hàng:
  - Mã đơn hàng
  - Thời gian giao dự kiến
- Button:

```txt
Quay lại Trang chủ
```

- Footer chung.

Ví dụ:

```txt
Mã đơn hàng: #WEB7890
Thời gian giao dự kiến: 30-45 phút
```

## 4.3. Dữ liệu bắt buộc

Thông tin thành công phải lấy từ order thật.

```ts
export interface OrderSuccessData {
  orderId: string;
  orderCode: string;
  estimatedDeliveryTime?: string;
  fulfillmentMethod: 'delivery' | 'pickup';
  paymentMethod: 'cod' | 'bank_transfer';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed';
  orderStatus: string;
}
```

## 4.4. Logic hiển thị thời gian dự kiến

Nếu là giao hàng:

```txt
Thời gian giao dự kiến: 30-45 phút
```

Nếu là ghé lấy tại cửa hàng:

```txt
Thời gian nhận dự kiến: 30-45 phút
```

Nếu người dùng đã chọn ngày/khung giờ cụ thể ở checkout:

```txt
Thời gian nhận hàng: Hôm nay, 14:00–16:00
```

Không nên hardcode `30-45 phút` nếu backend đã có fulfillmentTime/estimatedTime.

## 4.5. Button Quay lại Trang chủ

Click:

```txt
/
```

## 4.6. Auto redirect sang Đơn hàng của tôi

Sau khi hiển thị success, hệ thống tự động chuyển sang trang chi tiết đơn hàng.

Đề xuất delay:

```txt
3–5 giây
```

Hiển thị text nhỏ:

```txt
Bạn sẽ được chuyển đến chi tiết đơn hàng trong vài giây...
```

Hoặc có link:

```txt
Xem đơn hàng ngay
```

Click link chuyển ngay đến:

```txt
/account/orders/:orderId
```

## 4.7. Khi nào clear cart?

Chỉ clear cart khi:

- Order tạo thành công.
- Backend xác nhận cart đã được chuyển thành order.
- Hoặc frontend refetch cart và thấy cart empty.

Không clear cart trong lúc loading.

---

# 5. Trạng thái lỗi sau đặt hàng

## 5.1. Order tạo thất bại

Nếu `POST /orders` lỗi:

```txt
Không thể tạo đơn hàng. Vui lòng kiểm tra thông tin và thử lại.
```

Action:

- Quay lại checkout.
- Giữ lại form data nếu có thể.
- Không xóa cart.

## 5.2. Thanh toán thất bại

Nếu payment failed:

```txt
Thanh toán chưa thành công.
```

Action:

- Thử thanh toán lại.
- Đổi phương thức thanh toán.
- Quay lại checkout.

## 5.3. Cart thay đổi

Nếu sản phẩm hết hàng/giá đổi:

```txt
Một số sản phẩm trong giỏ đã thay đổi. Vui lòng kiểm tra lại giỏ hàng.
```

Action:

- Quay lại giỏ hàng.
- Refetch cart.

## 5.4. Không tìm thấy order

Nếu user mở `/order-success/:orderId` nhưng backend không tìm thấy order:

```txt
Không tìm thấy đơn hàng.
```

Action:

```txt
Về trang Đơn hàng của tôi
```

---

# 6. Trang Tài khoản của tôi / Đơn hàng của tôi

## 6.1. Vai trò

Trang `Đơn hàng của tôi` giúp user theo dõi đơn hàng đã đặt, xem trạng thái xử lý, chi tiết sản phẩm, thanh toán, tổng tiền và gửi đánh giá khi phù hợp.

Trong ảnh, user đang ở tab:

```txt
Đơn hàng của tôi
```

trong trang:

```txt
Tài khoản của tôi
```

## 6.2. Giao diện chính

Trang gồm:

- Header chung.
- Title:

```txt
Tài khoản của tôi
```

- Tên user:

```txt
Nguyen Minh Anh
```

- Badge hạng thành viên:

```txt
WEBEE GOLD MEMBER
```

- Button `Đăng xuất`.
- Tabs:
  - Hồ sơ cá nhân
  - Đơn hàng của tôi
- Card chi tiết đơn hàng.
- Footer chung.

## 6.3. Auth requirement

Trang tài khoản yêu cầu đăng nhập.

Nếu user chưa đăng nhập:

- Redirect đến `/login?redirect=/account/orders`.
- Hoặc hiển thị yêu cầu đăng nhập.

```txt
Vui lòng đăng nhập để xem đơn hàng của bạn.
```

## 6.4. Route đề xuất

Danh sách đơn hàng:

```txt
/account/orders
```

Chi tiết đơn hàng:

```txt
/account/orders/:orderId
```

Hồ sơ cá nhân:

```txt
/account/profile
```

---

# 7. Order detail card

## 7.1. Giao diện trong ảnh

Card có title:

```txt
Chi tiết đơn hàng
```

Bên trong gồm:

1. Timeline trạng thái đơn hàng.
2. Thông tin mã đơn, ngày đặt, trạng thái hiện tại.
3. Chi tiết sản phẩm.
4. Tổng cộng.
5. Phương thức thanh toán.
6. Đánh giá & phản hồi.

## 7.2. Dữ liệu cần lấy từ backend

```ts
export interface OrderDetail {
  id: string;
  orderCode: string;
  createdAt: string;
  currentStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: FulfillmentMethod;
  estimatedFulfillmentTime?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  total: number;
  currency: 'VND';
  statusHistory?: OrderStatusHistoryItem[];
  canReview?: boolean;
  review?: OrderReview;
}
```

---

# 8. Order status timeline

## 8.1. Giao diện trong ảnh

Timeline gồm 4 trạng thái:

1. Chờ xác nhận
2. Đang làm bánh
3. Đang giao hàng
4. Hoàn thành

Trạng thái hiện tại trong ảnh:

```txt
Đang giao hàng
```

## 8.2. Chức năng

Timeline phải phản ánh trạng thái thật từ backend.

## 8.3. Order status đề xuất

```ts
type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'delivering'
  | 'completed'
  | 'cancelled';
```

## 8.4. Mapping UI label

| Backend status | UI label |
|---|---|
| `pending_confirmation` | Chờ xác nhận |
| `confirmed` | Đã xác nhận |
| `preparing` | Đang làm bánh |
| `ready_for_pickup` | Sẵn sàng nhận bánh |
| `delivering` | Đang giao hàng |
| `completed` | Hoàn thành |
| `cancelled` | Đã hủy |

## 8.5. Timeline theo fulfillment method

Nếu `delivery`:

```txt
Chờ xác nhận → Đang làm bánh → Đang giao hàng → Hoàn thành
```

Nếu `pickup`:

```txt
Chờ xác nhận → Đang làm bánh → Sẵn sàng nhận bánh → Hoàn thành
```

## 8.6. Cancelled status

Nếu đơn đã hủy:

- Timeline không nên tiếp tục theo flow thường.
- Hiển thị trạng thái `Đã hủy`.
- Có thể hiển thị lý do hủy nếu backend có.

---

# 9. Thông tin mã đơn, ngày đặt, trạng thái

## 9.1. Giao diện

Trong ảnh:

```txt
Mã đơn hàng: #WB-2024-001
Ngày đặt: 15/05/2024
Trạng thái hiện tại: Đang giao hàng
```

## 9.2. Chức năng

Thông tin phải lấy từ order detail API.

## 9.3. Format

- Mã đơn hàng dùng `orderCode`.
- Ngày đặt format theo tiếng Việt:

```txt
dd/MM/yyyy
```

- Trạng thái hiện tại dùng mapping UI label từ backend status.

---

# 10. Chi tiết sản phẩm trong đơn

## 10.1. Giao diện

Section:

```txt
CHI TIẾT SẢN PHẨM
```

Mỗi item gồm:

- Ảnh sản phẩm.
- Tên sản phẩm.
- Số lượng.
- Giá.

Ví dụ:

```txt
Bánh Mặt Ong Rừng
Số lượng: 1
450.000đ
```

## 10.2. Dữ liệu

```ts
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  imageUrl?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}
```

## 10.3. Behavior

- Click sản phẩm có thể chuyển đến trang chi tiết sản phẩm nếu sản phẩm còn active.
- Nếu sản phẩm đã bị ẩn/xóa, vẫn hiển thị thông tin snapshot trong order.

## 10.4. Snapshot rule

Order item nên lưu snapshot tại thời điểm đặt hàng:

- productName
- unitPrice
- imageUrl
- variantName

Không nên phụ thuộc hoàn toàn vào product hiện tại vì giá/tên có thể thay đổi sau khi đặt.

---

# 11. Tổng cộng và phương thức thanh toán

## 11.1. Giao diện

```txt
Tổng cộng: 450.000đ
Phương thức thanh toán: Chuyển khoản ngân hàng
```

## 11.2. Chức năng

Tổng cộng lấy từ order total backend, không tự tính lại từ product hiện tại.

## 11.3. Payment method mapping

| Backend value | UI label |
|---|---|
| `cod` | COD |
| `bank_transfer` | Chuyển khoản ngân hàng |

## 11.4. Payment status

Có thể hiển thị thêm nếu cần:

| Backend value | UI label |
|---|---|
| `unpaid` | Chưa thanh toán |
| `pending` | Đang chờ thanh toán |
| `paid` | Đã thanh toán |
| `failed` | Thanh toán thất bại |
| `refunded` | Đã hoàn tiền |

Nếu thiết kế chưa có, có thể chưa hiển thị payment status trên UI chính, nhưng nên có trong model.

---

# 12. Đánh giá & phản hồi

## 12.1. Giao diện trong ảnh

Section:

```txt
Đánh giá & phản hồi
```

Gồm:

- Rating stars.
- Textarea:

```txt
Chia sẻ cảm nhận của bạn về đơn hàng này...
```

- Button:

```txt
Gửi đánh giá
```

## 12.2. Khi nào cho phép đánh giá?

Chỉ cho phép đánh giá khi:

- Đơn hàng đã `completed`.
- User chưa gửi đánh giá cho đơn này.
- User là chủ đơn hàng.

Nếu đơn chưa hoàn thành:

- Có thể ẩn section đánh giá.
- Hoặc disable với message:

```txt
Bạn có thể đánh giá sau khi đơn hàng hoàn thành.
```

Trong ảnh trạng thái là `Đang giao hàng` nhưng vẫn hiển thị đánh giá. Khi implement thực tế, nên kiểm tra nghiệp vụ. Đề xuất:

```txt
Chỉ enable đánh giá khi đơn hoàn thành.
```

## 12.3. Rating behavior

- User chọn 1–5 sao.
- Hover/click star cập nhật selected rating.
- Rating required nếu gửi đánh giá.

## 12.4. Comment behavior

- Textarea optional hoặc required tùy business.
- Giới hạn ký tự: 500–1000.

## 12.5. API liên quan

```txt
POST /orders/:orderId/review
```

Payload:

```json
{
  "rating": 5,
  "comment": "Bánh ngon, giao đúng giờ."
}
```

Nếu backend chưa có review order endpoint:

```txt
TODO_BACKEND: Need order review endpoint.
```

---

# 13. Auto redirect sau success sang Order Detail

## 13.1. Behavior

Sau khi hiển thị `Đặt hàng thành công`, frontend tự động chuyển sang trang chi tiết đơn hàng.

Đề xuất:

```txt
/order-success/:orderId
→ auto redirect after 3–5 seconds
→ /account/orders/:orderId
```

## 13.2. UI countdown

Có thể hiển thị:

```txt
Tự động chuyển đến chi tiết đơn hàng sau 5 giây...
```

Hoặc:

```txt
Xem đơn hàng ngay
```

## 13.3. Nếu user không đăng nhập

Nếu checkout cho phép guest order, nhưng `/account/orders/:orderId` yêu cầu đăng nhập, cần xử lý.

Phương án:

1. Nếu user đã đăng nhập: redirect sang `/account/orders/:orderId`.
2. Nếu guest:
   - Redirect sang `/orders/track?code=...&phone=...`
   - Hoặc hiển thị success page lâu hơn với mã đơn hàng.
   - Hoặc yêu cầu tạo tài khoản/đăng nhập để theo dõi.

Nếu project hiện yêu cầu tài khoản để order, có thể bỏ guest case.

---

# 14. Order status refresh

## 14.1. Khi vào Order Detail

Frontend gọi:

```txt
GET /orders/:orderId
```

để lấy trạng thái mới nhất.

## 14.2. Realtime/polling

Có thể dùng polling nhẹ nếu đơn đang xử lý:

```txt
GET /orders/:orderId mỗi 30–60 giây
```

Chỉ polling khi status chưa final:

- pending_confirmation
- confirmed
- preparing
- ready_for_pickup
- delivering

Dừng polling khi:

- completed
- cancelled

Nếu backend có websocket/realtime thì dùng realtime, nhưng không bắt buộc.

---

# 15. API checklist

## Required endpoints

```txt
POST /orders
GET /orders/:orderId
GET /account/orders hoặc GET /orders/my
```

## Recommended endpoints

```txt
GET /orders/:orderId/status
POST /orders/:orderId/review
```

## Optional endpoints

```txt
GET /payments/:paymentId/status
GET /orders/track?code=...&phone=...
```

## Backend fields cần có

Order success response:

```txt
orderId
orderCode
status
paymentStatus
estimatedFulfillmentTime
createdAt
```

Order detail response:

```txt
id
orderCode
createdAt
currentStatus
statusHistory
items
subtotal
shippingFee
discountAmount
total
paymentMethod
paymentStatus
fulfillmentMethod
recipient
deliveryAddress
estimatedFulfillmentTime
canReview
review
```

---

# 16. Angular implementation proposal

## Feature folders

```txt
src/app/features/orders/
  orders.routes.ts
  pages/
    order-processing/
      order-processing.page.ts
      order-processing.page.html
      order-processing.page.scss
    order-success/
      order-success.page.ts
      order-success.page.html
      order-success.page.scss
    my-orders/
      my-orders.page.ts
      my-orders.page.html
      my-orders.page.scss
    order-detail/
      order-detail.page.ts
      order-detail.page.html
      order-detail.page.scss
  components/
    order-status-timeline/
    order-summary-info/
    order-item-list/
    order-review-form/
```

## Core API

```txt
src/app/core/api/orders.api.ts
src/app/core/api/payments.api.ts
```

## Core models

```txt
src/app/core/models/order.model.ts
src/app/core/models/payment.model.ts
```

## Shared components

```txt
src/app/shared/components/
  site-header/
  site-footer/
  loading-state/
  empty-state/
  error-state/
  rating-input/
```

---

# 17. Route proposal

```ts
export const ORDER_ROUTES: Routes = [
  {
    path: 'order-processing',
    component: OrderProcessingPage
  },
  {
    path: 'order-success/:orderId',
    component: OrderSuccessPage
  },
  {
    path: 'account/orders',
    component: MyOrdersPage
  },
  {
    path: 'account/orders/:orderId',
    component: OrderDetailPage
  }
];
```

Nếu account module riêng:

```txt
src/app/features/account/
  pages/
    account-layout/
    profile/
    my-orders/
    order-detail/
```

---

# 18. Relationship với Checkout

Checkout là nơi tạo order.

Order Success và Order Detail là nơi xác nhận và theo dõi order.

## Rule

- Checkout không tự dựng mã đơn hàng.
- Mã đơn hàng lấy từ response `POST /orders`.
- Sau khi order tạo thành công, Checkout chuyển sang `order-success`.
- `order-success` fetch lại order nếu cần.
- Sau success delay, tự redirect sang `account/orders/:orderId`.
- Cart chỉ clear sau khi backend xác nhận order thành công.

---

# 19. Loading và success states

## Order processing state

Hiển thị khi:

- Đang tạo order.
- Đang xác nhận payment.
- Đang fetch order success data.

## Success state

Hiển thị khi:

- Order đã được tạo.
- Nếu payment method là COD: order created successfully.
- Nếu payment method là bank_transfer: payment confirmed hoặc order accepted pending payment tùy business.

## Failed state

Hiển thị khi:

- Order creation failed.
- Payment failed.
- Order status cannot be confirmed.

---

# 20. Design tokens suy ra từ ảnh

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
Success Accent: #8B7A27
Danger/Logout: #C94A4A
```

## Typography

```txt
Success title: 36–44px, bold
Account page title: 36–44px, bold
Order card title: 18–22px, semi-bold
Status label: 13–14px, bold
Order code: 18–20px, bold
Total price: 24–28px, bold
Body: 14–16px
```

## Layout

```txt
Page max width: 1200–1280px
Success content width: 360–420px
Success card radius: 14–18px
Order detail card radius: 20–24px
Footer full width
Timeline spacing: wide desktop horizontal
```

---

# 21. Responsive behavior

## Success page desktop

- Center content.
- Footer full width.
- Success card compact.

## Success page mobile

- Content full width with padding.
- Success card full width.
- Button full width if needed.

## Order detail desktop

- Account title and tabs at top.
- Order detail card full width.
- Timeline horizontal.
- Footer full width.

## Order detail mobile

- Timeline chuyển thành vertical.
- Order meta info stack dọc.
- Product item stack dọc.
- Review textarea full width.
- Footer 1 column.

---

# 22. Acceptance criteria

## Order processing/loading

- Hiển thị loading trong lúc tạo/xác nhận order.
- Không cho submit lại.
- Không clear cart khi chưa có order success.
- Có timeout/error state nếu xác nhận quá lâu.

## Order success

- Hiển thị đúng `Đặt hàng thành công!`.
- Hiển thị mã đơn hàng thật từ backend.
- Hiển thị thời gian giao/nhận dự kiến từ order.
- Có button `Quay lại Trang chủ`.
- Có text hoặc link `Xem đơn hàng ngay`.
- Tự động redirect sang chi tiết đơn hàng sau 3–5 giây.
- Không hardcode mã đơn hàng/thời gian.

## My Orders / Order Detail

- Yêu cầu đăng nhập nếu là trang tài khoản.
- Hiển thị đúng thông tin user và membership nếu có.
- Tab `Đơn hàng của tôi` active.
- Gọi API lấy chi tiết order.
- Timeline phản ánh đúng trạng thái order.
- Hiển thị mã đơn, ngày đặt, trạng thái hiện tại.
- Hiển thị chi tiết sản phẩm theo snapshot order.
- Hiển thị tổng cộng và phương thức thanh toán.
- Đánh giá chỉ enable khi order đủ điều kiện.
- Footer dùng component chung.

## Technical

- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Không tự bịa mã đơn hàng.
- Không tự tính lại total từ product hiện tại nếu backend đã có order total.
- Có loading, success, failed, not found states.
- Text tiếng Việt hiển thị đúng encoding.
- Responsive desktop/tablet/mobile cơ bản.
