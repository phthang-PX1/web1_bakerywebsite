# account.md

# Mô tả chức năng trang Tài khoản của tôi — WeBee Bakery

## 1. Vai trò của trang Tài khoản của tôi

Trang `Tài khoản của tôi` là khu vực quản lý cá nhân của người dùng sau khi đã đăng nhập. Trang này giúp khách hàng:

- Xem và chỉnh sửa thông tin cá nhân.
- Cập nhật địa chỉ mặc định.
- Đổi mật khẩu.
- Xem hạng thành viên và điểm tích lũy.
- Truy cập voucher cá nhân.
- Truy cập đổi điểm lấy quà.
- Xem đơn hàng gần đây.
- Chuyển sang tab `Đơn hàng của tôi` để xem danh sách/chi tiết đơn hàng.
- Đăng xuất khỏi tài khoản.

Trang này chỉ xuất hiện đầy đủ khi user đã đăng nhập.

---

## 2. Điều kiện truy cập

## Auth required

Trang tài khoản yêu cầu đăng nhập.

Nếu user chưa đăng nhập và truy cập:

```txt
/account
/account/profile
/account/orders
```

thì hệ thống cần:

- Redirect về `/login?redirect=/account`, hoặc
- Hiển thị màn hình yêu cầu đăng nhập.

Thông báo đề xuất:

```txt
Vui lòng đăng nhập để xem tài khoản của bạn.
```

## Sau khi đăng nhập thành công

Nếu user login từ redirect:

```txt
/login?redirect=/account
```

thì sau login chuyển lại:

```txt
/account
```

hoặc route trước đó.

---

# 3. Header khi đã đăng nhập

## Giao diện

Header giống các trang khác, nhưng có thay đổi quan trọng:

- Button `Đăng nhập` không còn hiển thị.
- Thay bằng icon trang cá nhân / account icon ở góc phải.
- Icon giỏ hàng vẫn có badge số lượng.
- Có thể có search icon.

## Chức năng icon account

Khi user đã đăng nhập:

- Hiển thị icon tài khoản thay cho button đăng nhập.
- Click icon tài khoản có thể:
  - Điều hướng trực tiếp đến `/account`, hoặc
  - Mở dropdown account menu.

## Dropdown account menu đề xuất

Nếu có dropdown:

```txt
Tài khoản của tôi
Đơn hàng của tôi
Voucher của tôi
Đăng xuất
```

## Rule

Header phải đọc auth state thật, không hardcode.

```txt
guest user  → hiển thị Đăng nhập / Đăng ký
logged user → hiển thị account icon / user menu
```

## API/state liên quan

```txt
GET /auth/me
GET /cart
```

---

# 4. Tổng quan bố cục trang

Trang Account trong thiết kế gồm:

1. Header
2. Page title và thông tin user ngắn
3. Button đăng xuất
4. Tab navigation
   - Hồ sơ cá nhân
   - Đơn hàng của tôi
5. Main content 2 cột:
   - Cột trái: thông tin cá nhân + đơn hàng gần đây
   - Cột phải: đổi mật khẩu + thẻ thành viên + shortcut voucher/đổi thưởng
6. Footer dùng chung
7. Store map dùng chung

---

# 5. Page title và user summary

## Giao diện

Title:

```txt
Tài khoản của tôi
```

Bên dưới:

```txt
Nguyễn Minh Anh
WEBEE GOLD MEMBER
```

Bên phải có action:

```txt
Đăng xuất
```

## Chức năng

Dữ liệu phải lấy từ user profile/membership backend.

Hiển thị:

- Tên người dùng.
- Hạng thành viên.
- Action đăng xuất.

## Model đề xuất

```ts
export interface AccountProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  defaultAddress?: UserAddress;
  membership?: MembershipSummary;
}
```

```ts
export interface MembershipSummary {
  tierName: string;
  tierCode: string;
  points: number;
}
```

## Fallback

Nếu chưa có membership:

- Ẩn badge hạng thành viên, hoặc
- Hiển thị `Thành viên WeBee`.

Không hardcode `WEBEE GOLD MEMBER`.

---

# 6. Đăng xuất

## Giao diện

Action ở bên phải:

```txt
Đăng xuất
```

Có icon logout màu đỏ.

## Chức năng

Khi click:

1. Có thể hỏi confirm nhẹ hoặc logout ngay.
2. Xóa access token/local session.
3. Clear user auth state.
4. Có thể clear/merge cart tùy flow.
5. Redirect về Home hoặc Login.

Route sau logout đề xuất:

```txt
/
```

## API liên quan

Nếu backend có logout:

```txt
POST /auth/logout
```

Nếu backend chỉ dùng JWT stateless:

- Xóa token ở frontend.
- Clear auth state.

---

# 7. Tab navigation

## Giao diện

Tabs:

```txt
Hồ sơ cá nhân
Đơn hàng của tôi
```

Tab `Hồ sơ cá nhân` đang active trong ảnh.

## Chức năng

### Hồ sơ cá nhân

Route đề xuất:

```txt
/account/profile
```

hoặc:

```txt
/account?tab=profile
```

### Đơn hàng của tôi

Route đề xuất:

```txt
/account/orders
```

Click tab `Đơn hàng của tôi` phải điều hướng đến trang My Orders đã mô tả ở file trước.

## Rule

Nên ưu tiên route riêng thay vì chỉ state nội bộ, để user có thể copy/share URL và refresh không mất tab.

Đề xuất:

```txt
/account/profile
/account/orders
/account/orders/:orderId
```

---

# 8. Section Thông tin cá nhân

## Giao diện

Card bên trái, title:

```txt
Thông tin cá nhân
```

Các field trong ảnh:

- Họ và tên
- Số điện thoại
- Email
- Ngày sinh
- Địa chỉ giao hàng mặc định
- Tỉnh/Thành phố
- Quận/Huyện
- Phường/Xã

Button:

```txt
Lưu thay đổi
```

## Chức năng

Người dùng có thể cập nhật thông tin cá nhân và địa chỉ mặc định.

## Field behavior

### Họ và tên

- Required.
- 2–100 ký tự.

### Số điện thoại

- Required hoặc optional tùy backend.
- Validate phone Việt Nam.

### Email

- Nếu email là định danh đăng nhập, cân nhắc không cho sửa trực tiếp.
- Nếu cho sửa, cần verify email lại.

Đề xuất:

```txt
Email readonly nếu backend chưa có flow xác thực email mới.
```

### Ngày sinh

- Optional.
- Date picker hoặc input date.
- Không cho chọn ngày tương lai.

### Địa chỉ giao hàng mặc định

Bao gồm:

- Address line.
- Province.
- District.
- Ward.

Dropdown địa chỉ nên giống Checkout page.

## Save behavior

Khi click `Lưu thay đổi`:

1. Validate form.
2. Gọi API update profile.
3. Hiển thị loading state trên button.
4. Nếu thành công, toast:

```txt
Đã cập nhật thông tin cá nhân.
```

5. Nếu lỗi, hiển thị message rõ ràng.

## API liên quan

```txt
GET /auth/me
GET /users/me
PATCH /users/me
```

hoặc:

```txt
GET /account/profile
PATCH /account/profile
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need account profile read/update endpoints.
```

## Model địa chỉ

```ts
export interface UserAddress {
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

# 9. Section Đổi mật khẩu

## Giao diện

Card bên phải, title:

```txt
Đổi mật khẩu
```

Fields:

- Mật khẩu hiện tại
- Mật khẩu mới
- Xác nhận mật khẩu mới

Button:

```txt
Cập nhật mật khẩu
```

## Chức năng

Cho phép user đổi mật khẩu sau khi đã đăng nhập.

## Validation

### Mật khẩu hiện tại

- Required.

### Mật khẩu mới

- Required.
- Tối thiểu 8 ký tự đề xuất.
- Không trùng mật khẩu hiện tại nếu có thể kiểm tra backend.
- Có thể yêu cầu chữ hoa/số/ký tự đặc biệt tùy policy.

### Xác nhận mật khẩu mới

- Required.
- Phải trùng `Mật khẩu mới`.

## Security behavior

- Không log password.
- Input type password.
- Có thể thêm icon hiện/ẩn mật khẩu nếu design cho phép.
- Sau khi đổi mật khẩu thành công:
  - Clear form.
  - Toast success.
  - Có thể yêu cầu login lại nếu backend policy yêu cầu.

## API liên quan

```txt
PATCH /auth/change-password
```

hoặc:

```txt
POST /users/me/change-password
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need change password endpoint.
```

---

# 10. Membership card

## Giao diện

Card màu vàng/nâu ở cột phải.

Nội dung trong ảnh:

```txt
THẺ THÀNH VIÊN WEBEE
GOLD MEMBER

Chủ thẻ
NGUYEN MINH ANH

Điểm tích lũy
2,450 pts
```

## Chức năng

Hiển thị thông tin thành viên thật của user:

- Hạng thành viên.
- Tên chủ thẻ.
- Điểm tích lũy.
- Có thể có mã thành viên nếu backend hỗ trợ.

## Dữ liệu

```ts
export interface MembershipCard {
  tierName: string;
  tierCode: string;
  holderName: string;
  points: number;
  memberCode?: string;
}
```

## API liên quan

```txt
GET /membership/me
```

Nếu backend chưa có membership:

```txt
TODO_BACKEND: Need membership profile endpoint.
```

## Rule

Không hardcode:

- `GOLD MEMBER`
- `2,450 pts`
- Tên người dùng

---

# 11. Shortcut: Voucher của tôi

## Giao diện

Card nhỏ bên phải:

```txt
Voucher của tôi
Bạn đang có 5 voucher khả dụng
```

Có icon và chevron.

## Chức năng

Click card điều hướng đến:

```txt
/account/vouchers
```

hoặc mở danh sách voucher nếu chưa có route riêng.

## Dữ liệu

Số lượng voucher khả dụng phải lấy từ backend.

```ts
export interface VoucherSummary {
  availableCount: number;
}
```

## API liên quan

```txt
GET /vouchers/my
GET /vouchers/available
```

Nếu chưa có:

```txt
TODO_BACKEND: Need user voucher endpoint.
```

## Fallback

Nếu chưa có voucher API:

- Có thể hiển thị card nhưng không ghi số lượng cụ thể.
- Hoặc ghi:

```txt
Xem voucher khả dụng
```

---

# 12. Shortcut: Đổi thưởng

## Giao diện

Card nhỏ bên phải:

```txt
Đổi thưởng
Đổi điểm tích lũy quà tặng
```

Có icon và chevron.

## Chức năng

Click điều hướng đến:

```txt
/account/rewards
```

hoặc:

```txt
/membership/rewards
```

## Dữ liệu

Dựa trên điểm thành viên của user.

Nếu chưa có reward module:

```txt
TODO_BACKEND / TODO_FRONTEND: Reward redemption flow is not implemented yet.
```

---

# 13. Section Đơn hàng gần đây

## Giao diện

Card phía dưới bên trái:

```txt
Đơn hàng gần đây
```

Table columns:

- Mã đơn
- Ngày đặt
- Tổng tiền
- Trạng thái
- Chi tiết

Ví dụ:

```txt
#WB-2024-001 | 15/05/24 | 450.000đ | Đang giao | Chi tiết
#WB-2024-002 | 10/05/24 | 1.200.000đ | Hoàn thành | Chi tiết
```

## Chức năng

Hiển thị một số đơn hàng gần nhất của user.

Đề xuất:

```txt
limit = 3 hoặc 5
```

## Click Chi tiết

Click `Chi tiết` điều hướng đến:

```txt
/account/orders/:orderId
```

Đây là liên kết đến My Order/Order Detail đã mô tả trước đó.

## Click tab Đơn hàng của tôi

Chuyển đến danh sách đơn hàng đầy đủ:

```txt
/account/orders
```

## API liên quan

```txt
GET /orders/my?limit=5
```

hoặc:

```txt
GET /account/orders?limit=5
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need my orders endpoint.
```

## Order status mapping

| Backend status | UI label |
|---|---|
| `pending_confirmation` | Chờ xác nhận |
| `confirmed` | Đã xác nhận |
| `preparing` | Đang làm bánh |
| `ready_for_pickup` | Sẵn sàng nhận |
| `delivering` | Đang giao |
| `completed` | Hoàn thành |
| `cancelled` | Đã hủy |

## Empty state

Nếu user chưa có đơn hàng:

```txt
Bạn chưa có đơn hàng nào.
```

CTA:

```txt
Mua bánh ngay
```

Route:

```txt
/products
```

---

# 14. Footer

Footer giống các trang còn lại và dùng component chung.

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

## Rule

Không duplicate footer riêng trong account page.

Dùng:

```txt
src/app/shared/components/site-footer/
```

---

# 15. Account data loading strategy

Trang Account lấy nhiều dữ liệu khác nhau:

- User profile.
- Membership info.
- Recent orders.
- Voucher summary.
- Cart badge.

Không nên để một API lỗi làm hỏng toàn trang.

## Chiến lược đề xuất

- Profile là dữ liệu chính. Nếu profile lỗi, hiển thị page-level error.
- Recent orders lỗi thì chỉ section orders hiển thị lỗi.
- Voucher summary lỗi thì chỉ card voucher fallback.
- Membership lỗi thì ẩn/hiển thị fallback card.

## Required states

Mỗi vùng động nên có:

```txt
loading
success
empty
error
```

---

# 16. API checklist cho Account page

## Required endpoints

```txt
GET /auth/me
GET /users/me hoặc GET /account/profile
PATCH /users/me hoặc PATCH /account/profile
PATCH /auth/change-password
GET /orders/my?limit=5
```

## Recommended endpoints

```txt
GET /membership/me
GET /vouchers/my
```

## Optional endpoints

```txt
GET /locations/provinces
GET /locations/districts?provinceCode=...
GET /locations/wards?districtCode=...
POST /auth/logout
```

## Backend fields cần có

User:

```txt
id
fullName
email
phone
birthDate
defaultAddress
```

Membership:

```txt
tierName
tierCode
points
memberCode
```

Recent order:

```txt
id
orderCode
createdAt
total
status
```

Voucher summary:

```txt
availableCount
```

---

# 17. Angular implementation proposal

## Route proposal

```txt
/account
/account/profile
/account/orders
/account/orders/:orderId
/account/vouchers
/account/rewards
```

Nếu muốn `/account` tự redirect:

```txt
/account → /account/profile
```

## Feature folder

```txt
src/app/features/account/
  account.routes.ts
  pages/
    account-layout/
    profile/
    my-orders/
    order-detail/
    vouchers/
    rewards/
  components/
    account-tabs/
    profile-form/
    change-password-card/
    membership-card/
    recent-orders-table/
    account-shortcut-card/
```

## Shared components

```txt
src/app/shared/components/
  site-header/
  site-footer/
  form-field/
  select-field/
  loading-state/
  empty-state/
  error-state/
```

## Core API services

```txt
src/app/core/api/account.api.ts
src/app/core/api/auth.api.ts
src/app/core/api/orders.api.ts
src/app/core/api/membership.api.ts
src/app/core/api/vouchers.api.ts
```

## Core models

```txt
src/app/core/models/account.model.ts
src/app/core/models/user.model.ts
src/app/core/models/order.model.ts
src/app/core/models/membership.model.ts
src/app/core/models/voucher.model.ts
```

---

# 18. Relationship với My Orders page

Trang Account là entry point của khu vực người dùng.

## Liên kết đến My Orders

Có 2 cách:

1. Tab `Đơn hàng của tôi` ở trên cùng.
2. Link `Chi tiết` trong bảng `Đơn hàng gần đây`.

Cả hai đều cần điều hướng đến module order/account đã có:

```txt
/account/orders
/account/orders/:orderId
```

## Rule

Không tạo 2 phiên bản khác nhau của Order Detail.

Dùng chung trang/component order detail đã mô tả trong:

```txt
orders.md
```

---

# 19. Responsive behavior

## Desktop

- Header ngang.
- Layout account 2 cột:
  - Cột trái rộng: profile + recent orders.
  - Cột phải hẹp: password + membership + shortcuts.
- Footer full width.

## Tablet

- Có thể chuyển thành 1 cột hoặc 2 cột hẹp.
- Recent orders table có thể scroll ngang.

## Mobile

- Layout 1 cột.
- Tabs full width hoặc horizontal scroll.
- Form fields full width.
- Membership card full width.
- Recent orders chuyển thành card list thay vì table.
- Footer 1 cột.

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
Success Green: #3B8A4A
Danger/Logout: #C94A4A
Membership Gold: #C9A227
```

## Typography

```txt
Page title: 36–44px, bold
User name: 14–16px, bold
Membership badge: 11–12px, uppercase, bold
Card title: 16–18px, semi-bold
Form label: 13–14px
Input text: 14–15px
Table text: 13–14px
Button: 14–15px, semi-bold
```

## Layout

```txt
Page max width: 1200–1280px
Main gap: 24–32px
Left column: khoảng 65%
Right column: khoảng 35%
Card radius: 16–20px
Input radius: 8–12px
Button radius: 12–999px
Section gap: 24–32px
```

---

# 21. Validation và error messages

## Profile update

Nếu form thiếu họ tên:

```txt
Vui lòng nhập họ tên.
```

Nếu phone không hợp lệ:

```txt
Số điện thoại không hợp lệ.
```

Nếu email không hợp lệ:

```txt
Email không hợp lệ.
```

Nếu update thành công:

```txt
Đã lưu thay đổi.
```

## Password update

Nếu thiếu mật khẩu hiện tại:

```txt
Vui lòng nhập mật khẩu hiện tại.
```

Nếu mật khẩu mới quá ngắn:

```txt
Mật khẩu mới cần có ít nhất 8 ký tự.
```

Nếu xác nhận không khớp:

```txt
Mật khẩu xác nhận không khớp.
```

Nếu đổi thành công:

```txt
Đã cập nhật mật khẩu.
```

---

# 22. Security notes

- Không hiển thị mật khẩu hiện tại.
- Không lưu password vào localStorage.
- Không log payload password.
- Nếu token hết hạn, redirect login.
- Nếu API trả 401 trên account page, clear auth state và redirect login.
- Nếu update email, cần xác thực lại nếu backend hỗ trợ.

---

# 23. Acceptance criteria

Trang Tài khoản của tôi đạt yêu cầu khi:

## Auth/header

- Chỉ truy cập được khi đã đăng nhập.
- Nếu chưa đăng nhập, redirect login.
- Header thay button đăng nhập bằng icon tài khoản.
- Cart icon vẫn mở Cart Drawer.
- Đăng xuất hoạt động và clear auth state.

## Profile

- Hiển thị đúng thông tin user thật.
- Form cho phép chỉnh sửa thông tin cá nhân.
- Địa chỉ mặc định có province/district/ward.
- Button `Lưu thay đổi` gọi API update.
- Có loading/success/error state.

## Password

- Form đổi mật khẩu có validation.
- Xác nhận mật khẩu mới phải khớp.
- Gọi API đổi mật khẩu.
- Clear form sau khi thành công.

## Membership

- Hiển thị đúng hạng thành viên và điểm tích lũy từ backend.
- Không hardcode Gold/points.
- Có fallback nếu chưa có membership API.

## Shortcuts

- `Voucher của tôi` điều hướng đúng route.
- `Đổi thưởng` điều hướng đúng route hoặc đánh dấu TODO nếu chưa có module.
- Số voucher khả dụng lấy từ backend nếu có.

## Recent orders

- Hiển thị đơn hàng gần đây của user.
- `Chi tiết` điều hướng đến `/account/orders/:orderId`.
- Tab `Đơn hàng của tôi` điều hướng đến `/account/orders`.
- Không duplicate order detail page.

## Footer

- Footer dùng component chung.
- Link/contact/map hoạt động đúng.

## Technical

- Không dùng endpoint chưa xác nhận mà không đánh dấu `TODO_BACKEND`.
- Không hardcode dữ liệu user/order/membership.
- Có loading, empty, error states theo section.
- Responsive desktop/tablet/mobile cơ bản.
- Text tiếng Việt hiển thị đúng encoding.
