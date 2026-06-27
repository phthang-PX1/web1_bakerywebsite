# blog.md

# Mô tả chức năng trang Blog & Tin tức — WeBee Bakery

## 1. Vai trò của trang Blog

Trang Blog & Tin tức là khu vực nội dung của WeBee Bakery, dùng để chia sẻ công thức, mẹo làm bánh, tin tức thương hiệu, chương trình khuyến mãi, quà tặng và nội dung theo mùa/lễ hội.

Trang này không chỉ là danh sách bài viết tĩnh. Nó cần hoạt động như một trang nội dung động, có khả năng:

- Hiển thị danh sách bài viết mới nhất.
- Lọc bài viết theo danh mục.
- Mở chi tiết bài viết.
- Hiển thị ngày đăng, tag/category và mô tả ngắn.
- Cho phép đăng ký nhận bản tin.
- Tải thêm bài viết.
- Điều hướng đến footer/policy/store map dùng chung.

---

## 2. Tổng quan bố cục

Trang Blog gồm các khu vực chính:

1. Header / Navigation
2. Page title
3. Blog category tabs
4. Blog post grid
5. Newsletter CTA banner
6. Load more button
7. Footer
8. Store map

---

# 3. Header / Navigation

## Mục đích

Header giúp người dùng điều hướng toàn website và giữ trạng thái đăng nhập/giỏ hàng.

## Thành phần giao diện

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

## Trạng thái active

Menu `Blog` đang active.

Active state:

- Text màu nâu/vàng thương hiệu.
- Underline màu vàng dưới `Blog`.

## Chức năng

- Logo click về `/`.
- `Blog` click về `/blog`.
- Search mở modal hoặc điều hướng đến `/search`.
- Cart icon mở Cart Drawer.
- Auth state quyết định hiển thị `Đăng nhập` hay icon tài khoản.

## API/state liên quan

```txt
GET /auth/me
GET /cart
```

---

# 4. Page title

## Giao diện

Title:

```txt
Blog & Tin tức
```

Subtitle:

```txt
Công thức, mẹo hay và tin tức mới nhất
```

## Chức năng

Đây là phần giới thiệu trang blog.

Không cần lấy từ API nếu nội dung ít thay đổi. Có thể để static config.

---

# 5. Blog category tabs

## Giao diện

Các tab trong ảnh:

```txt
Tất cả
Tin tức
Công thức
Khuyến mãi
Quà tặng
Mùa Lễ Hội
```

Tab `Tất cả` đang active.

## Mục đích

Cho phép người dùng lọc bài viết theo nhóm nội dung.

## Chức năng

Khi user click một tab:

1. Cập nhật active tab.
2. Cập nhật query params trên URL.
3. Gọi lại API hoặc filter danh sách bài viết.
4. Reset pagination về page 1.

Ví dụ URL:

```txt
/blog?category=recipe&page=1
/blog?category=promotion&page=1
```

## Category mapping đề xuất

| Label hiển thị | Query/slug |
|---|---|
| Tất cả | `all` |
| Tin tức | `news` |
| Công thức | `recipe` |
| Khuyến mãi | `promotion` |
| Quà tặng | `gift` |
| Mùa Lễ Hội | `seasonal` |

## Data source

Nếu backend có blog category:

```txt
GET /blog/categories
```

Nếu chưa có backend/CMS, dùng static config:

```txt
src/app/features/blog/config/blog-categories.config.ts
```

## Rule

Không hardcode category rải rác trong template. Header/footer/filter nên dùng chung config nếu cần.

---

# 6. Blog post grid

## Giao diện

Hiển thị 3 card bài viết trên desktop.

Mỗi card gồm:

- Ảnh cover.
- Badge category ở góc ảnh.
- Ngày đăng.
- Tiêu đề bài viết.
- Mô tả ngắn/excerpt.
- Link `Đọc thêm →`.

Ví dụ bài viết trong ảnh:

1. `Bí quyết nướng bánh bông lan mềm mịn như mây tại nhà`
2. `Ra mắt bộ sưu tập bánh lạnh "Tropical Breeze" cho mùa lễ hội`
3. `Đặc quyền tháng 10: Giảm giá 20% cho thành viên WeBee Gold`

Các bài này chỉ là dữ liệu thiết kế/minh họa. Khi implement thật, danh sách bài viết phải lấy từ API/CMS hoặc static config có cấu trúc.

## Chức năng card

### Click ảnh/title/card

Điều hướng đến trang chi tiết blog:

```txt
/blog/:slug
```

### Click `Đọc thêm`

Điều hướng đến cùng trang chi tiết:

```txt
/blog/:slug
```

### Badge category

Click badge có thể lọc theo category:

```txt
/blog?category=recipe
```

Không bắt buộc, nhưng nên hỗ trợ nếu UX cho phép.

## Dữ liệu bài viết

```ts
export interface BlogPostCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  categoryId?: string;
  categorySlug: string;
  categoryName: string;
  publishedAt: string;
  readingTimeMinutes?: number;
  isFeatured?: boolean;
}
```

## API liên quan

```txt
GET /blog/posts?page=1&limit=6&category=all
```

hoặc:

```txt
GET /posts?type=blog&category=...
```

Nếu backend chưa có blog API:

```txt
TODO_BACKEND: Need blog posts API or confirm static blog content approach.
```

---

# 7. Blog listing data behavior

## Dữ liệu động

Trang Blog nên phản ánh bài viết đang active/published.

Không hiển thị:

- Bài viết draft.
- Bài viết đã ẩn.
- Bài viết chưa đến ngày publish.

## Query params đề xuất

```txt
/blog?category=recipe&page=1&limit=6
```

Có thể bổ sung sau:

```txt
search
sort
tag
```

## Sorting

Mặc định:

```txt
publishedAt desc
```

Bài mới nhất lên đầu.

## Empty state

Nếu category không có bài viết:

```txt
Chưa có bài viết trong danh mục này.
```

CTA:

```txt
Xem tất cả bài viết
```

## Error state

Nếu không tải được bài viết:

```txt
Không thể tải bài viết. Vui lòng thử lại.
```

CTA:

```txt
Thử lại
```

---

# 8. Newsletter CTA banner

## Giao diện

Banner nền nâu đậm, bo góc lớn.

Bên trái:

- Headline.
- Description.
- Email input.
- Button đăng ký.

Bên phải:

- Ảnh bánh tròn với vòng outline vàng.

Nội dung trong ảnh có lỗi encoding. Khi implement nên sửa lại thành:

Headline:

```txt
Đừng bỏ lỡ những câu chuyện ngọt ngào
```

Description:

```txt
Đăng ký nhận tin để cập nhật những công thức mới nhất và các ưu đãi đặc biệt từ WeBee.
```

Input placeholder:

```txt
Email của bạn...
```

Button:

```txt
Đăng ký
```

## Chức năng

Người dùng nhập email để đăng ký nhận bản tin.

## Validation

- Email required.
- Đúng định dạng email.
- Không chỉ chứa khoảng trắng.

Error message:

```txt
Vui lòng nhập email hợp lệ.
```

## Submit behavior

Khi click `Đăng ký`:

1. Validate email.
2. Gọi API newsletter subscribe.
3. Hiển thị loading trên button.
4. Nếu thành công, hiển thị message:

```txt
Đăng ký nhận tin thành công!
```

5. Nếu email đã tồn tại:

```txt
Email này đã được đăng ký nhận tin.
```

6. Nếu lỗi:

```txt
Không thể đăng ký nhận tin. Vui lòng thử lại.
```

## API liên quan

```txt
POST /newsletter/subscribe
```

Payload:

```json
{
  "email": "customer@example.com"
}
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need newsletter subscription endpoint.
```

## Fallback

Nếu chưa có API, form không nên giả vờ đăng ký thành công thật. Có thể:

- Disable submit và ghi TODO.
- Hoặc lưu tạm local/dev only, nhưng phải đánh dấu rõ.

---

# 9. Button “Xem thêm bài viết”

## Giao diện

Button outline ở giữa:

```txt
Xem thêm bài viết
```

## Chức năng

Button dùng để tải thêm bài viết.

Có 2 phương án:

### Phương án A — Load more

Click button tải page tiếp theo và append vào grid hiện tại.

Phù hợp với thiết kế hiện tại.

Ví dụ:

```txt
GET /blog/posts?page=2&limit=6&category=all
```

### Phương án B — Pagination

Nếu nhiều bài viết và cần điều hướng rõ, có thể dùng pagination số.

## Đề xuất

Dùng `Load more` cho trang Blog vì nội dung dạng khám phá.

## Behavior

- Nếu còn bài viết: hiển thị button.
- Nếu hết bài viết: ẩn button hoặc hiển thị:

```txt
Bạn đã xem hết bài viết.
```

- Khi loading: button đổi thành:

```txt
Đang tải...
```

## API response cần có

```ts
export interface BlogPostListResponse {
  data: BlogPostCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}
```

---

# 10. Search behavior liên quan Blog

Header có search icon. Nếu search toàn site có hỗ trợ blog, kết quả search nên bao gồm:

- Sản phẩm.
- Bài viết blog.
- Chính sách nếu cần.

Nếu chỉ search blog trong trang blog, có thể thêm search input sau này.

API gợi ý:

```txt
GET /search?q=...&type=blog
```

hoặc:

```txt
GET /blog/posts?search=...
```

Không bắt buộc theo thiết kế hiện tại.

---

# 11. Footer

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
- Blog link trong footer active hoặc dẫn về `/blog`.
- Policy links đúng route.
- Social link mở tab mới.
- Email click mở mail client.
- Phone click mở call trên mobile.
- Map hiển thị vị trí cửa hàng.

## Rule

Không duplicate footer riêng cho Blog page.

Dùng:

```txt
src/app/shared/components/site-footer/
```

---

# 12. Content source

## Phương án A — Static config

Phù hợp khi:

- Dự án chưa có CMS.
- Số bài viết ít.
- MVP/đồ án.

File gợi ý:

```txt
src/app/features/blog/config/blog-posts.config.ts
src/app/features/blog/config/blog-categories.config.ts
```

Vẫn cần tổ chức theo slug để có thể mở trang chi tiết sau này.

## Phương án B — Backend/CMS

Phù hợp khi:

- Admin cần tạo/sửa/xóa bài viết.
- Blog cập nhật thường xuyên.
- Có ảnh cover, tag, trạng thái publish.

API đề xuất:

```txt
GET /blog/categories
GET /blog/posts
GET /blog/posts/:slug
```

Nếu backend chưa có:

```txt
TODO_BACKEND: Need blog CMS/API or confirm static blog content approach.
```

## Đề xuất cho WeBee

Nếu backend hiện chưa có CMS, có thể dùng static config trước nhưng tạo interface/service giống API để dễ chuyển đổi sau.

---

# 13. Relationship với các trang khác

## Product pages

Blog có thể liên kết đến sản phẩm liên quan trong bài viết.

Ví dụ bài công thức hoặc hướng dẫn có thể dẫn đến:

```txt
/products/:slug
```

## Membership

Bài viết khuyến mãi hoặc đặc quyền thành viên có thể dẫn đến:

```txt
/membership
/account
```

## Policies

Bài hướng dẫn đặt hàng có thể dẫn đến:

```txt
/policies/order-payment-guide
```

## Newsletter

Newsletter có thể dùng chung ở blog và các trang marketing khác nếu cần.

---

# 14. Blog detail page liên quan

Trang Blog list nên chuẩn bị liên kết đến trang chi tiết bài viết.

## Route đề xuất

```txt
/blog/:slug
```

## Blog detail cần có sau này

- Header.
- Breadcrumb.
- Cover image.
- Title.
- Published date.
- Category.
- Content.
- Related posts.
- Newsletter CTA.
- Footer.

Nếu chưa thiết kế chi tiết blog, đánh dấu:

```txt
TODO_DESIGN: Blog detail page design is not provided yet.
```

---

# 15. Angular implementation proposal

## Route

```txt
/blog
/blog/:slug
```

## Feature folder

```txt
src/app/features/blog/
  blog.routes.ts
  pages/
    blog-list/
      blog-list.page.ts
      blog-list.page.html
      blog-list.page.scss
    blog-detail/
      blog-detail.page.ts
      blog-detail.page.html
      blog-detail.page.scss
  components/
    blog-category-tabs/
    blog-card/
    newsletter-banner/
```

## Shared components

```txt
src/app/shared/components/
  site-header/
  site-footer/
  loading-state/
  empty-state/
  error-state/
```

## Core API services

```txt
src/app/core/api/blog.api.ts
src/app/core/api/newsletter.api.ts
```

## Core models

```txt
src/app/core/models/blog.model.ts
src/app/core/models/newsletter.model.ts
```

## Blog API methods đề xuất

```ts
getCategories(): Observable<BlogCategory[]>
getPosts(params: BlogPostQuery): Observable<BlogPostListResponse>
getPostBySlug(slug: string): Observable<BlogPostDetail>
```

## Newsletter API method

```ts
subscribe(payload: NewsletterSubscribeRequest): Observable<NewsletterSubscribeResponse>
```

---

# 16. Models đề xuất

## Blog category

```ts
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  isActive: boolean;
}
```

## Blog post query

```ts
export interface BlogPostQuery {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}
```

## Blog post detail

```ts
export interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  contentHtml: string;
  coverImageUrl: string;
  categorySlug: string;
  categoryName: string;
  publishedAt: string;
  authorName?: string;
  readingTimeMinutes?: number;
  relatedPosts?: BlogPostCard[];
}
```

## Newsletter

```ts
export interface NewsletterSubscribeRequest {
  email: string;
}
```

```ts
export interface NewsletterSubscribeResponse {
  success: boolean;
  message?: string;
}
```

---

# 17. Loading, empty, error states

## Page loading

Nếu blog lấy từ API:

- Hiển thị skeleton cards.
- Category tabs có thể loading riêng.

## Empty state

```txt
Chưa có bài viết nào.
```

Hoặc theo category:

```txt
Chưa có bài viết trong danh mục này.
```

## Error state

```txt
Không thể tải bài viết. Vui lòng thử lại.
```

## Newsletter states

- Idle
- Invalid email
- Submitting
- Success
- Error
- Already subscribed

---

# 18. Design tokens suy ra từ ảnh

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
Newsletter Brown: #3B2A1E
```

## Typography

```txt
Page title: 44–56px, bold
Subtitle: 15–17px
Category tab: 13–15px
Blog card title: 18–22px, bold
Blog card excerpt: 14–15px
Date: 13–14px
Newsletter title: 28–36px, bold
Button: 14–16px, semi-bold
```

## Layout

```txt
Page max width: 1200–1280px
Blog grid: 3 columns desktop
Card radius: 14–18px
Card shadow: nhẹ
Newsletter banner radius: 24–28px
Section spacing: 56–80px
Footer full width
```

---

# 19. Responsive behavior

## Desktop

- Header ngang.
- Blog grid 3 cột.
- Newsletter banner 2 cột: text/form trái, image phải.
- Footer 4 cột.

## Tablet

- Blog grid 2 cột.
- Category tabs có thể scroll ngang.
- Newsletter banner vẫn 2 cột hoặc chuyển 1 cột tùy width.

## Mobile

- Blog grid 1 cột.
- Category tabs horizontal scroll.
- Newsletter banner 1 cột.
- Email input và button full width hoặc stacked.
- Footer 1 cột.
- Map full width.

---

# 20. SEO và metadata

Blog list:

```txt
Blog & Tin tức | WeBee Bakery
```

Blog detail:

```txt
{post.title} | WeBee Bakery
```

Nếu Angular app hỗ trợ SEO/SSR, cập nhật metadata theo bài viết:

- title
- description
- og:image
- canonical URL

---

# 21. Acceptance criteria

Trang Blog đạt yêu cầu khi:

## Header

- Menu `Blog` active.
- Header auth/cart state hoạt động.
- Cart icon mở Cart Drawer.

## Category tabs

- Hiển thị đúng các tab: Tất cả, Tin tức, Công thức, Khuyến mãi, Quà tặng, Mùa Lễ Hội.
- Click tab lọc bài viết.
- Active tab phản ánh query param hoặc state.
- Reset page khi đổi category.

## Blog posts

- Hiển thị danh sách bài viết từ API hoặc static config có cấu trúc.
- Không hardcode trực tiếp toàn bộ card trong template.
- Card có ảnh, category badge, ngày đăng, title, excerpt, link đọc thêm.
- Click card/đọc thêm điều hướng đến `/blog/:slug`.

## Load more

- Button `Xem thêm bài viết` tải thêm bài nếu còn.
- Ẩn hoặc disable khi hết bài.
- Có loading state khi tải thêm.

## Newsletter

- Email input validate đúng.
- Gọi API đăng ký newsletter nếu backend có.
- Có success/error message.
- Không giả vờ đăng ký thành công nếu chưa có API mà không đánh dấu TODO_BACKEND.

## Footer

- Footer dùng component chung.
- Blog link hoạt động.
- Policy/contact/map hoạt động đúng.

## Technical

- Có loading, empty, error states.
- Có `TODO_BACKEND` nếu chưa có blog/newsletter API.
- Text tiếng Việt hiển thị đúng encoding.
- Responsive desktop/tablet/mobile cơ bản.
