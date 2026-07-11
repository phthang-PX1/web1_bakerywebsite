# Phase C — Sửa nhanh item trong giỏ (prefill)

## Bối cảnh
Backend `PUT /cart/items/:id` chỉ nhận `quantity` (`cart.schema.ts:33-35`) — không sửa được options. Flow: **remove item cũ + add item mới** do frontend orchestrate.

## Việc cụ thể
1. Nút Sửa (`cart.page.html:71`, `cart-drawer.component.ts:45`): thêm `[queryParams]="{ edit: item.cartItemId }"`.
2. `product-detail.page.ts`: đọc `queryParamMap.get('edit')`; khi optionGroups + cart sẵn sàng → preselect options theo `option_item_ids` của cart item + set quantity; nút đổi nhãn "Cập nhật giỏ hàng"; submit gọi `replaceItem` rồi navigate `/cart` + toast thành công. Nếu cartItemId không còn trong giỏ → hoạt động như thêm mới bình thường.
3. `CartService.replaceItem(cartItemId, payload)`: remove cũ → add mới (tuần tự để tránh race với optimistic update), trả Observable.

## Definition of Done
- [ ] Giỏ → Sửa → trang sản phẩm hiện đúng option + số lượng cũ, nút "Cập nhật giỏ hàng"
- [ ] Cập nhật xong: item cũ biến mất, item mới đúng lựa chọn, không trùng lặp
- [ ] Vào thẳng sản phẩm (không edit param) hoạt động như cũ
