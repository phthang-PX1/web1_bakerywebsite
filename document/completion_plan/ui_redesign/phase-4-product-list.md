# Phase 4 — Product list

## Mục tiêu
`frontend/src/app/features/products/pages/product-list.page.{html,scss}` — trang cửa hàng theo nhịp editorial, mọi control filter/sort/search/pagination giữ nguyên binding.

## Spec
- **Page header**: eyebrow "Cửa hàng", title Fraunces `$fs-display-2`, count kết quả muted cùng dòng title, hairline dưới
- **Toolbar**: bỏ pill fill — micro-label uppercase, select/input dùng `field` mixin; filter active = gạch chân ink thay chip fill
- **Sidebar**: giữ chức năng (price slider, category checkbox), restyle theo token — checkbox accent terracotta, slider thumb ink
- **Grid nhịp editorial**: 4 cột lg; `:nth-child(9n+1)` span 2 cột (cadence lặp qua các trang pagination); 2 cột md, 1-2 cột sm
- Skeleton dùng `shimmer` global; empty/error state giữ logic, restyle
- Pagination component đã redesign ở Phase 2 tự áp dụng

## Definition of Done
- [ ] Search/filter/sort/pagination hoạt động y nguyên
- [ ] Grid có nhịp featured lặp, không còn đều tăm tắp
- [ ] SCSS ≤ 8kB
- [ ] Responsive 390/768/1440
