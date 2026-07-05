# Phase B — Trang tùy chỉnh bánh

## Việc cụ thể
1. **Ảnh preview bị khóa** (`custom-cake.page.ts:126-131`): `previewImageUrl()` dùng `opts.find(o => o.imageUrl)` → luôn lấy option có ảnh đầu tiên trong mảng (multi-select append nên nó đứng đầu vĩnh viễn). Fix: duyệt **từ cuối mảng** (option chọn gần nhất có ảnh thắng); khi bỏ chọn tự fallback đúng vì tính từ mảng hiện tại; hết option có ảnh → thumbnail sản phẩm.
2. **Layout nhảy khi chọn option**:
   - `preview-info__options` chỉ render khi `selectedOptions().length > 0` → cột trái cao lên đột ngột. Fix: render container thường trực + `min-height` cố định.
   - Hint `@if (!canAddToCart())` biến mất khi đủ điều kiện → footer co. Fix: giữ chỗ bằng `visibility: hidden`.
3. **"Kem phủ" phải single-select**: logic đã đúng theo `isMultiple` (frontend `toggleOption:167`, backend `cart.service.ts:212`). Sai ở **dữ liệu**: `document/backend/option_groups.csv` để `is_multiple=True` cho Kem phủ. Fix: sửa CSV + script `prisma.optionGroup.updateMany({ where: { name: 'Kem phủ' }, data: { isMultiple: false } })` chạy 1 lần trên DB + sửa seed cho lần sau.

## Definition of Done
- [ ] Chọn 2 option có ảnh liên tiếp → preview theo cái mới nhất; bỏ chọn → fallback đúng
- [ ] Chọn/bỏ option không làm giật layout
- [ ] Kem phủ chỉ chọn được 1 (chọn cái mới thay cái cũ); Nhân bánh + Topping vẫn chọn nhiều
