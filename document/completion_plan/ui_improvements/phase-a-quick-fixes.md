# Phase A — Quick fixes

## Việc cụ thể
1. **Giá hiển thị = đơn giá, không nhân số lượng** (tổng chỉ tính trong giỏ):
   - `frontend/src/app/features/products/pages/product-detail.page.ts:60` — bỏ `* this.quantity()` trong `totalPrice()`. `addToCart()` gửi quantity riêng nên backend không ảnh hưởng.
   - `frontend/src/app/features/custom-cake/pages/custom-cake.page.ts:137` — tương tự.
2. **3 link `/register` hỏng** (route thật `/auth/register`, `/register` rơi wildcard về home): `membership.page.ts:36`, `auth/pages/activate.page.ts:22`, `auth/pages/login.page.ts:72`.
3. **Chính sách**:
   - `policy.page.ts` POLICIES map chỉ có `privacy/shipping/returns/terms`; footer link 4 slug không tồn tại (`customer-support`, `loyalty`, `order-payment-guide`, `shipping-guide`). Bổ sung 4 policy mới với nội dung tiếng Việt; đồng bộ footer + policy-nav; thêm dropdown "Chính sách" vào header (pattern giống dropdown Sản phẩm).
4. **Branding**: header thêm wordmark "WeBee" Fraunces + logo 44→56px; footer logo tăng tương ứng; bỏ `filter: grayscale(1)` map (`site-footer.component.scss:132`).
5. **Custom-cake layout logo**: `custom-cake-layout.component.ts` thay chữ trần bằng logo img + wordmark.

## Definition of Done
- [ ] Tăng số lượng ở product-detail/custom-cake → giá đứng yên
- [ ] 3 link register về `/auth/register`
- [ ] 5 link chính sách footer + dropdown header mở đúng trang, không còn "Không tìm thấy chính sách"
- [ ] Logo + wordmark hiện ở header/footer/custom-cake; map có màu
