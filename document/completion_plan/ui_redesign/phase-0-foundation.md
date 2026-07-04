# Phase 0 — Foundation: token layer, mixins, fonts, build config

## Mục tiêu
Xây nền SCSS dùng chung (hiện tại: 0 `@use`/`@mixin` toàn codebase, token CSS cũ 0 nơi dùng). Phase này không thay đổi hình ảnh — an toàn merge độc lập.

## Việc cụ thể

### 0.1 — Tạo `frontend/src/styles/_tokens.scss`
Pure Sass variables (0 CSS output): palette hợp nhất (xem [README](README.md)), type scale fluid, spacing `$sp-1..$sp-10` (4→128px), `$section-y`, radius scale (`$r-0/$r-xs/$r-sm/$r-pill/$r-arch`), 2 shadow, breakpoints `$bp-sm/md/lg/xl` (480/768/1024/1280), containers.

### 0.2 — Tạo `frontend/src/styles/_mixins.scss`
`@use "tokens" as t;` — gồm:
- `mq($bp)` / `mq-down($bp)` — media query theo breakpoint đặt tên
- `container($width)`
- `btn-base` (inline-flex, focus-visible ring, disabled) / `btn-solid` (ink → terracotta hover, pill) / `btn-outline` (hairline ink pill, fill khi hover) / `btn-text` (uppercase tracked + underline offset + mũi tên)
- `eyebrow` (caramel uppercase tracked, optional rule line)
- `display($level)` (Fraunces, weight ~550, leading chặt, ink)
- `hairline($side)`
- `field` (input/select: `$surface` bg, viền `$border`, `$r-xs`, focus terracotta + ring mềm)
- `arch-media`, `img-cover($ratio)`
- Giữ mixin gọn — mỗi lần `@include` là duplicate output (liên quan budget 8kB).

### 0.3 — Sửa `frontend/src/styles.scss`
- `@use "styles/tokens"`, emit palette + font ra `:root` dạng `--wb-*` (thay 6 token chết `--color-*`)
- Body defaults tokenized (font-body, paper bg, ink text)
- `@keyframes shimmer / pulse / spin` toàn cục 1 lần (xóa bản per-file khi migrate từng component)
- **KHÔNG** thêm global `h1-h6` serif hay `.btn` global — component opt-in qua mixin, admin/auth không bị ảnh hưởng.

### 0.4 — Sửa `frontend/angular.json`
- `build.options.stylePreprocessorOptions.includePaths: ["src/styles"]` → mọi component (kể cả inline `styles:[]`, vì `inlineStyleLanguage: "scss"` đã bật) chỉ cần `@use "tokens" as t; @use "mixins" as m;`
- Budget `anyComponentStyle`: warning `6kB`, error `10kB`. Lý do: prod build **đang fail** (product-detail 11.7kB, checkout 11.5kB, cart 10.4kB); mixin sẽ giảm mạnh, mục tiêu mỗi file rebuild ≤8kB — budget là lưới an toàn, không phải giấy phép phình to.

### 0.5 — Sửa `frontend/src/index.html`
Swap Google Fonts: `Fraunces:ital,opsz,wght@0,9..144,400..650;1,9..144,400..650` + `Be+Vietnam+Pro:wght@400;500;600;700`. Fallback nếu Fraunces không ưng: Playfair Display / Lora (đều có Vietnamese).

## Definition of Done
- [ ] `_tokens.scss` + `_mixins.scss` tồn tại, `styles.scss` dùng `@use`
- [ ] Một component thử nghiệm import được `@use "tokens" as t;` không cần đường dẫn tương đối
- [ ] `ng build` dev pass; các trang hiện tại render y hệt trước (chưa có gì consume token mới)
- [ ] Fonts mới load được, kiểm tra Fraunces render dấu tiếng Việt đúng
