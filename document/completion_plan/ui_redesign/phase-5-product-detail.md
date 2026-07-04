# Phase 5 — Product detail (file đang phá prod build)

## Mục tiêu
`frontend/src/app/features/products/pages/product-detail.page.{html,scss}` — SCSS hiện 11.7kB **vượt budget 8kB làm prod build fail**. Rebuild SCSS từ đầu trên mixin (không trim vá), mục tiêu ≤8kB. Logic options/cart/reviews giữ nguyên.

## Spec
- Breadcrumb: micro-text muted
- **2 cột**: gallery trái ~55% (sticky trong section, khung sharp hoặc arch, thumbnail = ô vuông hairline nhỏ) / phải: tên Fraunces `$fs-display-2`, dòng rating, **giá lớn Fraunces kẹp giữa 2 hairline** (receipt cue)
- Options: outline-chip theo `field`/hairline pattern, selected = viền terracotta (không fill tràn); bỏ double-bezel swatch cũ
- Hàng hành động: quantity-stepper (Phase 2) + `btn-solid` "Thêm vào giỏ" cùng hàng
- **Mô tả/Đánh giá**: bỏ tab box → section editorial hairline-top + eyebrow label ("Mô tả", "Đánh giá"), measure hẹp `$container-narrow`
- Review row: hairline divider, **chữ cái đầu người review Fraunces** thay avatar tròn; giữ ảnh review nếu có
- Related products: tái dùng product-card mới

## Definition of Done
- [ ] `ng build` prod **pass** (hết lỗi budget)
- [ ] SCSS mới ≤ 8kB
- [ ] Chọn option → giá cập nhật, thêm giỏ hoạt động, tab nội dung đầy đủ
- [ ] Responsive: gallery stack trên mobile
