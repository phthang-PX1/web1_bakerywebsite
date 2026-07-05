# Phase F — Category art SVG

## Việc cụ thể
1. Vẽ 6 SVG minh họa line-art dễ thương, đồng bộ phong cách (stroke espresso `#2b1a0f` ~1.5-2px, fill sand/honey nhạt, chi tiết caramel), khung vuông ~120x120 viewBox: `banh-gato.svg` (bánh kem tầng + nến), `banh-entremet.svg` (bánh tráng gương + lát cắt), `banh-mousse.svg` (bánh tròn mềm + topping cầu), `tiramisu.svg` (khối vuông lớp + rắc cacao + thìa), `mini-cakes.svg` (cupcake), `banh-nuong.svg` (croissant/bánh mì). Đặt tại `frontend/public/assets/categories/`.
2. Redesign `category-shortcuts`: từ typographic index → **lưới 6 tile** (ảnh minh họa trong đĩa tròn nền `$sand` + tên dưới); hover: lift nhẹ + tên italic terracotta; giữ header section hiện có. Responsive: 6→3→2 cột.
3. `home.data.ts`: field `icon` (emoji) → `image` (đường dẫn svg); cập nhật model `HomeCategoryItem` + template.

## Definition of Done
- [ ] 6 tile hiện SVG minh họa, phong cách đồng bộ thương hiệu
- [ ] Click tile lọc đúng category ở trang products
- [ ] Không còn emoji trong home.data.ts
