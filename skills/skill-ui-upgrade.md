# Skill: Nâng cấp UI/UX với TasteSkill

## Khi nào dùng

Sau khi một trang đã **ổn định về chức năng** (đã pass `skill-verify-feature.md`), dùng skill này để cải thiện giao diện với TasteSkill — một bộ design rules cho AI agent giúp tạo ra UI chuyên nghiệp, nhất quán, không "slop".

---

## Cài đặt TasteSkill (làm 1 lần duy nhất)

### Bước 1 — Cài đặt

Chạy lệnh này tại thư mục gốc của project (`web1_bakerywebsite/`):

```bash
npx skills add Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Lệnh này tạo file `SKILL.md` tại thư mục gốc. Claude Code tự động đọc file này khi làm việc.

### Bước 2 — Tuỳ chỉnh SKILL.md cho WeBee

Sau khi tạo xong, mở `SKILL.md` và thêm đoạn sau vào đầu file (sau dòng title):

```markdown
## WeBee Brand Constraints (MANDATORY — override defaults)

- **Primary color:** #C96A2E (warm amber-brown)
- **Background:** #FDFAF6 (warm cream)
- **Dark:** #7A3D18
- **Accent / Gold:** #E8B86D
- **Light surface:** #F5E6D3
- **Error:** #dc2626
- **Font:** Inter (already loaded via Google Fonts)
- **Style:** Warm artisan bakery — NOT corporate, NOT minimal, NOT cold blue tones
- **Border radius:** 10–16px for cards, 8px for buttons/inputs
- **Base spacing unit:** 8px
- **Language:** ALL UI text MUST remain in Vietnamese — never translate to English
- **Angular constraint:** ONLY modify `.html` template and `.scss` file — NEVER touch `.ts` signal/service logic
```

### Bước 3 — Xác nhận

Chạy `ng build --configuration development` để đảm bảo project vẫn build OK sau khi thêm `SKILL.md`.

---

## Cách dùng để nâng cấp một trang

### Thông tin cần cung cấp

1. **Tên trang** cần nâng cấp (ví dụ: trang danh sách sản phẩm, trang checkout)
2. **Vấn đề cụ thể** cần cải thiện (ví dụ: "card sản phẩm trông bland", "form checkout không có visual hierarchy", "spacing không đều")
3. **Giữ nguyên gì** (ví dụ: "giữ màu brand, giữ layout 2 cột")

### Nhiệm vụ của Agent

1. **Đọc SKILL.md** để lấy design rules của TasteSkill + WeBee constraints
2. **Đọc file cần nâng cấp**: `<page>.page.html` + `<page>.page.scss` (và các component con nếu cần)
3. **Đọc `.agent/ui_ux_rules.md`** để đảm bảo tuân thủ brand identity WeBee
4. **Chỉ sửa template HTML và SCSS** — KHÔNG chạm vào logic TypeScript, signal, service call, form control
5. **Áp dụng cải thiện** theo thứ tự ưu tiên:
   - Visual hierarchy: heading sizes, font weights, color contrast
   - Spacing: consistent 8px grid, padding/margin hợp lý
   - Micro-interactions: hover states, focus states, transitions nhẹ (150–200ms)
   - Empty/Error/Loading states: thiết kế có hồn, không chỉ là text thuần
   - Mobile: kiểm tra responsive layout
6. **Chạy `ng build`** sau khi sửa để xác nhận không có lỗi template

### Giới hạn bắt buộc

| Được phép | Không được phép |
|---|---|
| Sửa HTML structure (thêm wrapper div, class) | Đổi tên biến TypeScript |
| Thêm/sửa CSS class | Thay đổi logic `@if`, `@for` |
| Viết lại toàn bộ SCSS | Thêm/bỏ service inject |
| Thêm CSS animation/transition | Sửa FormControl / Validator |
| Thêm SVG icon inline | Xóa event binding `(click)`, `(submit)` |
| Điều chỉnh grid/flexbox layout | Đổi route `routerLink` |

---

## Checklist sau khi nâng cấp

- [ ] `ng build --configuration development` — không có ERROR
- [ ] Màu brand WeBee được giữ nguyên (#C96A2E primary, #FDFAF6 bg)
- [ ] Tất cả text vẫn bằng tiếng Việt
- [ ] Không có Angular binding nào bị vỡ (`[ngClass]`, `(click)`, `{{ }}`, v.v.)
- [ ] Loading/Empty/Error state vẫn hiển thị đúng
- [ ] Toast messages vẫn hoạt động
- [ ] Mobile layout không bị vỡ (test ở 375px width)
- [ ] Không dùng màu mặc định không phù hợp brand (tránh xanh lam, xám lạnh)

---

## Thứ tự nâng cấp khuyến nghị

Nâng cấp theo độ ưu tiên hiển thị với người dùng:

1. **Trang chủ** (`home.page`) — ấn tượng đầu tiên
2. **Trang danh sách sản phẩm** (`product-list.page`) — trang xem nhiều nhất
3. **Trang chi tiết sản phẩm** (`product-detail.page`) — conversion point
4. **Trang giỏ hàng + checkout** (`cart.page`, `checkout.page`) — critical flow
5. **Trang tài khoản** (`account.page`, `profile.page`) — retention
6. **Trang admin** (`dashboard.page`, `products-list.page`) — internal tooling
7. **Trang phụ** (blog, policies, membership)

---

## Đầu ra

- Các file `.html` và `.scss` đã được nâng cấp
- Tóm tắt những gì đã thay đổi và lý do (visual hierarchy, spacing, states...)
- Kết quả `ng build` — xác nhận không có lỗi

---

## Lưu ý

- Nếu TasteSkill gợi ý màu không phù hợp brand WeBee (ví dụ màu xanh lam), **ưu tiên WeBee brand constraints** trong `SKILL.md` và `.agent/ui_ux_rules.md`
- Không cài nhiều skill TasteSkill chồng lên nhau — chỉ dùng `design-taste-frontend` (v2) cho project này
- Mỗi lần nâng cấp 1 trang → build → xem browser → confirm → mới chuyển sang trang tiếp theo
- Nếu gặp lỗi template sau khi nâng cấp, dùng `skill-fix-bug.md` để debug
