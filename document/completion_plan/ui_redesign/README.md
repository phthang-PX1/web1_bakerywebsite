# UI Redesign — Editorial/Artisanal (trang client)

Redesign giao diện client theo phong cách **tạp chí ẩm thực thủ công**: serif display lớn, layout bất đối xứng, khoảng trắng rộng, hairline thay shadow — thoát khỏi cảm giác "AI-generated" (card grid đều, radius lung tung, emoji icon, 2 hệ màu lẫn lộn). Giữ nguyên: màu thương hiệu, nội dung, chức năng, logic TS. Chỉ đổi: template markup/class + SCSS.

**Phạm vi đợt này**: home, product list/detail, cart (+drawer), checkout/success/tracking, header/footer, shared components. **Không đụng**: admin, auth, account, membership, blog, policy, custom-cake.

## Design language

### Typography
| Vai trò | Font | Ghi chú |
|---|---|---|
| Display (heading, giá, số) | **Fraunces** (variable, italic) | Có Vietnamese subset; weight ~400-650 |
| Body | **Be Vietnam Pro** 400/500/600/700 | Giữ từ hiện tại, bỏ 800/900 |

Type scale fluid: `$fs-display-1: clamp(2.75rem, 2rem + 4vw, 5rem)` · `$fs-display-2: clamp(2rem, 1.5rem + 2.5vw, 3.25rem)` · `$fs-h3: clamp(1.375rem, 1.2rem + 1vw, 1.75rem)` · body 16/15/13px · eyebrow 12px uppercase tracking 0.14em.

### Palette hợp nhất (toàn bộ là màu sẵn có)
| Token | Hex | Vai trò | Khai tử |
|---|---|---|---|
| `$primary` | `#C96A2E` | Màu hành động duy nhất | `#8C4516` |
| `$primary-dark` | `#7A3D18` | Hover/pressed | |
| `$ink` | `#2b1a0f` | Text display, band tối | `#3b2a1e` `#1a1a1a` `#1C1412` |
| `$accent` | `#f5c842` | Honey — badge/highlight | `#f4c542` |
| `$caramel` | `#c47a2b` | Eyebrow, rule line | |
| `$paper` | `#fdfbf5` | Nền trang | `#FDFAF6` |
| `$surface` | `#FFFBF7` | Card/panel | |
| `$surface-warm` | `#FFF5EE` | Tint nhấn nhẹ | |
| `$sand` | `#F5E6D3` | Band mềm | |
| `$muted` | `#7a6555` | Text phụ | `#6b6b6b` `#5C4A3A` |
| `$border` | `#EDE8E2` | Hairline | `#e5e7eb` `#f3f4f6` |

### Nguyên tắc anti-AI
1. **Radius có chủ đích**: `0` cho ảnh editorial · `4px` input · `10px` panel · `999px` chỉ cho pill button · arch `999px 999px 0 0` cho ảnh đặc trưng. Khai tử mọi giá trị 12-40px.
2. **Hairline thay shadow**: mặc định card = viền 1px `$border`, không shadow. Chỉ 2 shadow warm-tint: `$shadow-soft` (0 2px 12px rgba(43,26,15,.06)) và `$shadow-lift` (0 16px 40px rgba(43,26,15,.12)).
3. **1 nút solid mỗi view** — còn lại outline pill hoặc text-link gạch chân + mũi tên.
4. **Nhịp section**: section rhythm `$section-y: clamp(4rem, 8vw, 7.5rem)`. Grid sản phẩm dùng **tỉ lệ đều 4:5, 4 cột** (quyết định của người dùng sau khi thử nhịp featured bất đối xứng — card đều, nút thêm giỏ thẳng hàng đáy nhờ stretch + `margin-top: auto`).
5. **Typography thay trang trí**: typographic index thay emoji, số section Fraunces, chữ cái đầu thay avatar tròn.
6. Breakpoints thống nhất: `480 / 768 / 1024 / 1280`. Containers: `min(1200px, 92vw)` (+wide 1400 / narrow 760).

## Mục lục phase

| Phase | File | Trạng thái |
|---|---|---|
| 0 | [Foundation — tokens, mixins, fonts, build config](phase-0-foundation.md) | ✅ Hoàn thành |
| 1 | [Shell — header, footer](phase-1-shell.md) | ✅ Hoàn thành |
| 2 | [Shared components](phase-2-shared-components.md) | ✅ Hoàn thành |
| 3 | [Home](phase-3-home.md) | ✅ Hoàn thành |
| 4 | [Product list](phase-4-product-list.md) | ✅ Hoàn thành (kèm fix bug load trang đầu) |
| 5 | [Product detail](phase-5-product-detail.md) | ✅ Hoàn thành — prod build hết lỗi budget |
| 6 | [Cart](phase-6-cart.md) | ✅ Hoàn thành |
| 7 | [Checkout flow](phase-7-checkout.md) | ✅ Hoàn thành |

Trình tự bắt buộc 0 → 1 → 2, sau đó 3-7 theo thứ tự (5 ưu tiên vì đang phá prod build). Sau mỗi phase: `ng build` prod + kiểm tra visual.

## Đợt 2 — các trang còn lại (✅ hoàn thành)

Sau đợt 1, toàn bộ trang client còn lại đã được chuyển sang cùng design language:
- **Auth** (`auth.page.scss` + `auth-layout`): card hairline, label uppercase tracked, logo WeBee Fraunces italic.
- **Account** (`account.page.scss`, `account-form.page.scss` + 4 trang con): hero hairline, nav card, order rows receipt-style, status badge outline; bổ sung style cho các class chưa từng được style (loyalty progress, address card, order summary, review form). Dùng `%placeholder + @extend` để dedupe button mixin (file dùng chung 4 trang, tránh vượt budget).
- **Membership**: tier card viền top màu tier, tên Fraunces italic, bỏ emoji.
- **Blog + Policy** (`content.page.scss`): blog card không box, date eyebrow caramel, thêm style `.policy-content`/`.policy-nav`.
- **Custom-cake** (+ layout): preview arch trên nền sand, option pill outline; **fix bug có sẵn**: trang tìm `search='custom'` (0 kết quả vĩnh viễn) → đổi sang lọc `isCustomizable` từ danh sách thật.
- **Product-card fix**: bỏ chuỗi `height: 100%` khiến body card bị kéo giãn theo card featured cùng hàng (giá + nút tách xa tên); sửa placeholder `.webp` → `.svg`; bỏ emoji nav/empty-state ở account.

**Chưa đụng**: toàn bộ admin (theo yêu cầu).
