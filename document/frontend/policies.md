# policies.md

# Mô tả chức năng trang Chính sách — WeBee Bakery

## 1. Vai trò của trang Chính sách

Trang Chính sách là khu vực cung cấp các quy định, hướng dẫn và cam kết dịch vụ của WeBee đối với khách hàng.

Trang này giúp người dùng:

- Đọc chính sách hỗ trợ khách hàng.
- Hiểu quyền lợi khách hàng thân thiết.
- Xem chính sách bảo mật.
- Xem hướng dẫn về sản phẩm.
- Xem hướng dẫn đặt hàng và thanh toán.
- Xem hướng dẫn giao hàng.
- Truy cập nhanh các chính sách từ header dropdown hoặc footer.

Trang Chính sách không chỉ là một trang text tĩnh. Nó nên được tổ chức như một nhóm nội dung có nhiều bài/chuyên mục chính sách, có thể điều hướng theo slug.

---

## 2. Danh mục chính sách

Danh mục chính sách cần bao gồm đúng các mục sau, tương tự các đường dẫn trong footer:

1. Chính sách Hỗ trợ Khách hàng
2. Chính sách Khách hàng thân thiết
3. Chính sách Bảo mật
4. Hướng dẫn về Sản phẩm
5. Hướng dẫn Đặt hàng & Thanh toán
6. Hướng dẫn Giao hàng

## Route đề xuất

```txt
/policies/customer-support
/policies/loyalty
/policies/privacy
/policies/product-guide
/policies/order-payment-guide
/policies/shipping-guide
```

Có thể có route tổng:

```txt
/policies
```

Route `/policies` có thể redirect đến chính sách mặc định, ví dụ:

```txt
/policies/customer-support
```

hoặc hiển thị danh sách tất cả chính sách.

---

# 3. Header / Navigation

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
- Button đăng nhập hoặc icon tài khoản nếu đã đăng nhập.

## Trạng thái active

Khi đang ở bất kỳ route chính sách nào, menu `Chính sách` phải active.

Active state:

- Text màu nâu đậm/vàng thương hiệu.
- Underline màu vàng dưới `Chính sách`.

---

# 4. Dropdown Chính sách trên header

## Mục đích

Menu `Chính sách` trên header có dropdown, tương tự cơ chế dropdown chọn danh mục sản phẩm ở menu `Sản phẩm`.

## Trigger

Dropdown có thể mở khi:

- Hover vào `Chính sách` trên desktop.
- Click vào `Chính sách` trên desktop/mobile.
- Tap trên mobile.

## Danh sách dropdown

Dropdown hiển thị các mục:

```txt
Chính sách Hỗ trợ Khách hàng
Chính sách Khách hàng thân thiết
Chính sách Bảo mật
Hướng dẫn về Sản phẩm
Hướng dẫn Đặt hàng & Thanh toán
Hướng dẫn Giao hàng
```

## Chức năng

Khi click một item:

- Điều hướng đến route tương ứng.
- Đóng dropdown.
- Cập nhật active policy.
- Page load nội dung chính sách tương ứng.

Ví dụ:

```txt
Click "Hướng dẫn Giao hàng"
→ /policies/shipping-guide
```

## Keyboard/accessibility

Dropdown nên hỗ trợ:

- Mở bằng Enter/Space khi focus vào menu.
- Di chuyển item bằng Tab.
- Đóng bằng Esc.
- Có aria attributes nếu implement custom dropdown.

## Mobile behavior

Trên mobile:

- Dropdown có thể nằm trong mobile menu.
- Các policy item hiển thị dạng list bên dưới `Chính sách`.
- Không nên dùng hover-only interaction trên mobile.

---

# 5. Breadcrumb

## Giao diện trong ảnh

Breadcrumb nằm dưới header:

```txt
Trang chủ > Chính sách
```

## Chức năng

Breadcrumb nên thay đổi theo chính sách hiện tại.

Ví dụ:

```txt
Trang chủ > Chính sách > Chính sách Hỗ trợ Khách hàng
```

## Route

| Breadcrumb item | Route |
|---|---|
| Trang chủ | `/` |
| Chính sách | `/policies` |
| Tên chính sách hiện tại | current page |

## Model đề xuất

```ts
export interface BreadcrumbItem {
  label: string;
  url?: string;
  isCurrent?: boolean;
}
```

---

# 6. Hero/banner chính sách

## Giao diện

Trong ảnh có banner lớn nền xám, bo góc, text trắng lớn:

```txt
Chính sách
Hỗ trợ Khách hàng
```

## Chức năng

Hero nên phản ánh chính sách đang xem.

Ví dụ:

| Policy | Hero title |
|---|---|
| Chính sách Hỗ trợ Khách hàng | `Chính sách Hỗ trợ Khách hàng` |
| Chính sách Khách hàng thân thiết | `Chính sách Khách hàng thân thiết` |
| Chính sách Bảo mật | `Chính sách Bảo mật` |
| Hướng dẫn về Sản phẩm | `Hướng dẫn về Sản phẩm` |
| Hướng dẫn Đặt hàng & Thanh toán | `Hướng dẫn Đặt hàng & Thanh toán` |
| Hướng dẫn Giao hàng | `Hướng dẫn Giao hàng` |

## Dữ liệu

Hero title lấy từ policy detail data hoặc static config.

Không hardcode cố định `Chính sách Hỗ trợ Khách hàng` cho mọi trang.

## Style

- Banner rộng full content width.
- Nền xám/ảnh nền nhẹ tùy Figma.
- Text căn giữa.
- Bo góc lớn.
- Padding dọc rộng.
- Typography lớn, bold.

---

# 7. Nội dung chính sách

## Giao diện trong ảnh

Sau hero là section nội dung:

Title:

```txt
Thông báo cập nhật chính sách WeBee
```

Intro paragraph.

Các mục đánh số:

1. Định danh Hội viên
2. Hạn mức Ưu đãi & Quy định Voucher
3. Chính sách Giao hàng ngoại tỉnh
4. Đối tượng áp dụng Chính sách Ưu đãi
5. Kênh bán hàng chính thức

## Chức năng

Nội dung chính sách phải thay đổi theo policy slug hiện tại.

Mỗi policy detail nên có:

- Title.
- Last updated date.
- Intro/summary.
- Content sections.
- Optional rich text/html.
- Optional table nếu policy cần.
- Optional FAQ nếu policy cần.

## Model đề xuất

```ts
export interface PolicyPage {
  id: string;
  slug: string;
  title: string;
  heroTitle?: string;
  summary?: string;
  lastUpdatedAt?: string;
  contentHtml?: string;
  sections?: PolicySection[];
  isActive: boolean;
}
```

```ts
export interface PolicySection {
  id: string;
  title: string;
  content: string;
  order: number;
}
```

## Nếu chưa có CMS/backend

Có thể dùng static config:

```txt
src/app/features/policies/config/policies-content.config.ts
```

Nhưng vẫn phải tổ chức theo slug, không viết trực tiếp toàn bộ text trong HTML template.

---

# 8. Danh sách nội dung cho từng chính sách

## 8.1. Chính sách Hỗ trợ Khách hàng

Mục đích:

- Giải thích quy định hỗ trợ.
- Kênh liên hệ.
- Điều kiện xử lý yêu cầu.
- Cập nhật về hội viên/voucher/giao hàng/kênh bán.

Nội dung trong ảnh thuộc nhóm này.

Route:

```txt
/policies/customer-support
```

## 8.2. Chính sách Khách hàng thân thiết

Mục đích:

- Quy định tích điểm.
- Hạng thành viên.
- Điều kiện lên hạng.
- Cách dùng điểm.
- Hạn sử dụng điểm.
- Ưu đãi theo hạng.

Route:

```txt
/policies/loyalty
```

Liên quan trực tiếp đến:

- Account page membership card.
- Checkout điểm/voucher nếu có.
- Header/member CTA.

## 8.3. Chính sách Bảo mật

Mục đích:

- Mô tả dữ liệu cá nhân WeBee thu thập.
- Cách sử dụng dữ liệu.
- Bảo mật tài khoản.
- Cookie/tracking nếu có.
- Quyền của người dùng.
- Liên hệ khi cần xóa/cập nhật dữ liệu.

Route:

```txt
/policies/privacy
```

## 8.4. Hướng dẫn về Sản phẩm

Mục đích:

- Hướng dẫn chọn bánh.
- Kích thước bánh.
- Cách bảo quản.
- Thành phần, dị ứng, hạn sử dụng.
- Tùy chỉnh bánh.
- Lưu ý khi vận chuyển/nhận bánh.

Route:

```txt
/policies/product-guide
```

Liên quan đến:

- Product Detail page.
- Custom cake flow.
- FAQ sản phẩm.

## 8.5. Hướng dẫn Đặt hàng & Thanh toán

Mục đích:

- Cách đặt hàng.
- Cách thêm vào giỏ.
- Cách checkout.
- COD.
- Chuyển khoản/QR.
- Voucher.
- Xuất hóa đơn doanh nghiệp.
- Quy định xác nhận đơn hàng.

Route:

```txt
/policies/order-payment-guide
```

Liên quan đến:

- Cart Drawer.
- Checkout page.
- Order success/payment flow.

## 8.6. Hướng dẫn Giao hàng

Mục đích:

- Khu vực giao hàng.
- Phí giao hàng.
- Thời gian giao dự kiến.
- Giao hỏa tốc.
- Nhận tại cửa hàng.
- Quy định khi giao không thành công.
- Quy định kiểm tra bánh khi nhận.

Route:

```txt
/policies/shipping-guide
```

Liên quan đến:

- Checkout fulfillment method.
- Product Detail policy card.
- Order status timeline.

---

# 9. Chính sách content source

## Phương án A — Static config trong frontend

Phù hợp khi:

- Nội dung chính sách ít thay đổi.
- Không có admin/CMS quản lý nội dung.
- Dự án MVP hoặc đồ án.

Ví dụ:

```txt
src/app/features/policies/config/policies.config.ts
```

Cấu trúc:

```ts
export const POLICIES: PolicyPage[] = [
  {
    id: 'customer-support',
    slug: 'customer-support',
    title: 'Chính sách Hỗ trợ Khách hàng',
    heroTitle: 'Chính sách Hỗ trợ Khách hàng',
    lastUpdatedAt: '2026-02-01',
    isActive: true,
    sections: []
  }
];
```

## Phương án B — Lấy từ backend/CMS

Phù hợp khi:

- Admin cần cập nhật chính sách.
- Nội dung thay đổi thường xuyên.
- Có blog/CMS module.

API đề xuất:

```txt
GET /policies
GET /policies/:slug
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need policies API or confirm static content approach.
```

## Đề xuất cho WeBee

Nếu project chưa có CMS, nên dùng static config trước, nhưng thiết kế interface theo hướng dễ chuyển sang API sau.

---

# 10. Policy page data behavior

## Khi vào route policy

Ví dụ:

```txt
/policies/privacy
```

Frontend cần:

1. Đọc `slug` từ route.
2. Tìm policy tương ứng từ API/config.
3. Nếu có, render hero + content.
4. Nếu không có, hiển thị not found state.

## Not found state

```txt
Không tìm thấy chính sách.
```

CTA:

```txt
Xem tất cả chính sách
```

Route:

```txt
/policies
```

## Loading/error

Nếu lấy từ API:

- Loading: skeleton content.
- Error:

```txt
Không thể tải nội dung chính sách. Vui lòng thử lại.
```

Nếu dùng static config, không cần loading API.

---

# 11. Footer links

Footer phải liên kết đến đúng các route policy.

## Mapping footer

| Footer label | Route |
|---|---|
| Chính sách Hỗ trợ Khách hàng | `/policies/customer-support` |
| Chính sách Khách hàng thân thiết | `/policies/loyalty` |
| Chính sách Bảo mật | `/policies/privacy` |
| Hướng dẫn về Sản phẩm | `/policies/product-guide` |
| Hướng dẫn Đặt hàng & Thanh toán | `/policies/order-payment-guide` |
| Hướng dẫn Giao hàng | `/policies/shipping-guide` |

## Rule

Không để footer link là `#` nếu route đã có.

Footer và header dropdown phải dùng chung một source policy navigation config để tránh lệch.

Ví dụ:

```txt
src/app/shared/config/policy-navigation.config.ts
```

---

# 12. Header policy dropdown config

Header dropdown và footer policy links nên dùng chung config:

```ts
export interface PolicyNavItem {
  label: string;
  slug: string;
  route: string;
  order: number;
}
```

```ts
export const POLICY_NAV_ITEMS: PolicyNavItem[] = [
  {
    label: 'Chính sách Hỗ trợ Khách hàng',
    slug: 'customer-support',
    route: '/policies/customer-support',
    order: 1
  },
  {
    label: 'Chính sách Khách hàng thân thiết',
    slug: 'loyalty',
    route: '/policies/loyalty',
    order: 2
  },
  {
    label: 'Chính sách Bảo mật',
    slug: 'privacy',
    route: '/policies/privacy',
    order: 3
  },
  {
    label: 'Hướng dẫn về Sản phẩm',
    slug: 'product-guide',
    route: '/policies/product-guide',
    order: 4
  },
  {
    label: 'Hướng dẫn Đặt hàng & Thanh toán',
    slug: 'order-payment-guide',
    route: '/policies/order-payment-guide',
    order: 5
  },
  {
    label: 'Hướng dẫn Giao hàng',
    slug: 'shipping-guide',
    route: '/policies/shipping-guide',
    order: 6
  }
];
```

---

# 13. Relationship với các trang khác

## Product Detail

Policy card trong product detail:

- `Vận chuyển` → `/policies/shipping-guide`
- `Đổi trả` hoặc hỗ trợ → `/policies/customer-support`

## Checkout

Các chính sách liên quan:

- Hướng dẫn Đặt hàng & Thanh toán
- Hướng dẫn Giao hàng
- Chính sách Bảo mật
- Chính sách Khách hàng thân thiết nếu có điểm/voucher

## Account

Membership card/points liên quan đến:

```txt
/policies/loyalty
```

## Footer

Toàn bộ chính sách phải link đúng route.

---

# 14. Angular implementation proposal

## Route

```txt
/policies
/policies/:slug
```

## Feature folder

```txt
src/app/features/policies/
  policies.routes.ts
  pages/
    policy-list/
      policy-list.page.ts
      policy-list.page.html
      policy-list.page.scss
    policy-detail/
      policy-detail.page.ts
      policy-detail.page.html
      policy-detail.page.scss
  components/
    policy-hero/
    policy-content/
    policy-sidebar/
```

## Shared config

```txt
src/app/shared/config/policy-navigation.config.ts
```

## Static content config nếu chưa có API

```txt
src/app/features/policies/config/policies-content.config.ts
```

## Core API nếu dùng backend

```txt
src/app/core/api/policies.api.ts
```

Methods:

```ts
getPolicies(): Observable<PolicyPage[]>
getPolicyBySlug(slug: string): Observable<PolicyPage>
```

## Shared components

```txt
src/app/shared/components/site-header/
src/app/shared/components/site-footer/
src/app/shared/components/breadcrumb/
src/app/shared/components/loading-state/
src/app/shared/components/error-state/
```

---

# 15. Optional: Policy sidebar

Thiết kế hiện tại không có sidebar policy, nhưng nếu nội dung dài có thể cân nhắc.

## Sidebar có thể gồm

- Danh sách các chính sách.
- Active current policy.
- Sticky khi scroll.

## Mobile

- Sidebar chuyển thành dropdown `Chọn chính sách`.

## Rule

Không bắt buộc nếu Figma không có. Chỉ thêm khi cần UX cho nội dung dài.

---

# 16. SEO và metadata

Mỗi policy page nên có metadata riêng:

```txt
title
description
canonicalUrl
```

Ví dụ:

```txt
Chính sách Hỗ trợ Khách hàng | WeBee Bakery
```

Nếu Angular app có SSR/SEO support thì cập nhật metadata theo slug.

---

# 17. Loading, empty, error states

## Nếu dùng API

### Loading

```txt
Đang tải chính sách...
```

### Error

```txt
Không thể tải nội dung chính sách. Vui lòng thử lại.
```

CTA:

```txt
Thử lại
```

### Not found

```txt
Không tìm thấy chính sách.
```

CTA:

```txt
Xem danh sách chính sách
```

## Nếu dùng static config

- Không cần loading API.
- Vẫn cần not found state khi slug sai.

---

# 18. Design tokens suy ra từ ảnh

> Các giá trị dưới đây là suy luận từ ảnh, cần đối chiếu lại với Figma nếu có file gốc.

## Màu sắc

```txt
Primary Yellow: #F4C542 hoặc tương đương
Dark Brown: #3B2A1E
Medium Brown: #6B4A20
Cream Background: #F7F3EA
Light Cream: #FBF8F1
White: #FFFFFF
Hero Gray: #B9B9B9
Border Light: #E8E0D2
Text Primary: #3A2A22
Text Secondary: #6F625A
```

## Typography

```txt
Hero title: 44–56px, bold
Page content title: 26–32px, bold
Policy section title: 16–18px, bold
Body text: 14–16px
Breadcrumb: 13–14px
Dropdown item: 14–15px
```

## Layout

```txt
Page max width: 1200–1280px
Hero height: 260–320px
Hero radius: 16–20px
Content width: full container
Content spacing: 24–32px
Footer full width
```

---

# 19. Responsive behavior

## Desktop

- Header horizontal.
- Policy dropdown mở dưới menu Chính sách.
- Hero full width container.
- Content text rộng vừa phải, dễ đọc.
- Footer 4 cột.

## Tablet

- Header có thể vẫn ngang hoặc chuyển dần.
- Dropdown vẫn dùng click.
- Hero thấp hơn.
- Content padding tăng để dễ đọc.

## Mobile

- Header chuyển mobile menu.
- Policy dropdown nằm trong mobile nav.
- Hero title nhỏ hơn.
- Content 1 cột.
- Footer 1 cột.
- Map full width.

---

# 20. Acceptance criteria

Trang Chính sách đạt yêu cầu khi:

## Header/dropdown

- Menu `Chính sách` active khi ở `/policies` hoặc `/policies/:slug`.
- `Chính sách` có dropdown danh sách 6 chính sách.
- Click item dropdown điều hướng đúng route.
- Dropdown hoạt động trên desktop và mobile.
- Dropdown dùng cùng danh sách với footer policy links.

## Policy page

- Breadcrumb hiển thị đúng.
- Hero title thay đổi theo chính sách hiện tại.
- Nội dung chính sách thay đổi theo slug.
- Không hardcode một nội dung cho toàn bộ chính sách.
- Route `/policies/:slug` hoạt động.
- Nếu slug sai, hiển thị not found state.

## Footer

- Footer chứa đủ 6 link chính sách/hướng dẫn.
- Mỗi link điều hướng đúng route.
- Footer dùng component chung.

## Data/content

- Nếu có backend/CMS, policy content lấy từ API.
- Nếu chưa có backend/CMS, content nằm trong static config có cấu trúc rõ.
- Không viết rải rác policy text trực tiếp trong template.
- Có `TODO_BACKEND` nếu cần API policies sau này.

## Technical

- Có policy navigation config dùng chung cho header và footer.
- Có loading/error state nếu dùng API.
- Text tiếng Việt hiển thị đúng encoding.
- Responsive desktop/tablet/mobile cơ bản.
