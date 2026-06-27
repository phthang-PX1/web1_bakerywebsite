# custom_cake.md

# Mô tả chức năng trang Tùy chỉnh bánh (Custom Cake Configurator) — WeBee Bakery

## 1. Vai trò của trang Tùy chỉnh bánh

Trang `Tùy chỉnh bánh` là công cụ giúp khách hàng tự thiết kế chiếc bánh kem theo ý muốn cho các dịp đặc biệt (sinh nhật, kỷ niệm, tiệc cưới...). Khác với việc mua một sản phẩm có sẵn, luồng này cho phép người dùng từng bước chọn kích thước, cốt bánh, nhân kem, đồ trang trí, thông điệp viết lên bánh và xác nhận giá tiền dự kiến theo thời gian thực.

Mục tiêu chính:
- Cung cấp trải nghiệm tùy chỉnh bánh trực quan, sinh động và cao cấp.
- Giữ sự tập trung tối đa cho người dùng trong quá trình cấu hình bánh (ẩn footer).
- Tính toán và hiển thị giá ước tính theo từng tùy chọn được thêm vào.
- Thêm bánh tùy chỉnh vào giỏ hàng (`POST /cart/items`) với danh sách `option_item_ids` tương ứng.

---

## 2. Bố cục giao diện đặc biệt (Split-Screen Layout)

Để tối ưu hóa trải nghiệm người dùng, trang sử dụng bố cục chia đôi màn hình (Split-Screen) trên desktop:

### 2.1. Cột trái / Nửa trên (Sticky Preview)
- Hiển thị hình ảnh mô phỏng hoặc hình minh họa của bánh theo các tùy chọn đang chọn.
- Luôn giữ cố định (sticky) khi cuộn bảng tùy chọn bên phải.
- Có nút `← Quay lại` hoặc `Hủy` ở góc trên bên trái để quay lại trang chủ/danh sách sản phẩm.

### 2.2. Cột phải / Nửa dưới (Scrollable Configuration Panel)
- Chứa các bước hoặc nhóm tùy chọn (Option Groups).
- Thanh tổng kết giá (Price Summary Bar) được ghim cố định ở đáy panel này, hiển thị tổng tiền tạm tính và nút `Thêm vào giỏ hàng`.

### 2.3. Header & Footer
- **Header**: Hiển thị dạng tối giản (Simplified Header) gồm Logo WeBee và nút đóng/quay lại, hoặc Header chuẩn.
- **Footer**: **Bắt buộc ẨN** trên trang này để tránh làm xao nhãng luồng cấu hình bánh.

---

## 3. Các bước tùy chọn (Configuration Steps / Option Groups)

Dữ liệu tùy chọn được tải từ API `GET /products/:id/options` (với `:id` là ID của sản phẩm `Custom Cake` nền trong database).

Các nhóm tùy chọn điển hình:
1. **Kích thước bánh (Size)** — *Bắt buộc (Required)*
   - Ví dụ: Size 14cm (2-4 người), Size 18cm (6-8 người), Size 22cm (10-12 người).
2. **Cốt bánh (Sponge Base)** — *Bắt buộc (Required)*
   - Ví dụ: Vani, Chocolate, Trà xanh Matcha, Red Velvet.
3. **Nhân bánh & Kem phủ (Filling & Cream)** — *Bắt buộc (Required)*
   - Ví dụ: Kem tươi dâu tây, Kem chocolate phô mai, Kem chanh dây.
4. **Trang trí bề mặt (Toppings & Decoration)** — *Chọn nhiều (Multiple)*
   - Ví dụ: Thêm trái cây tươi (+50.000đ), Thêm macaron (+40.000đ), Phủ bột vàng kim sa (+30.000đ).
5. **Lời chúc trên bánh (Custom Message)** — *Tùy chọn (Optional)*
   - Ô nhập văn bản tối đa 50 ký tự (lưu vào `customNote` khi thêm vào giỏ).

---

## 4. Công thức tính giá (Pricing Logic)

- Giá hiển thị trên UI là **Giá tạm tính (Estimated Price)**:
  $$\text{Estimated Total} = \text{Base Price} + \sum \text{Extra Price của các Option đã chọn}$$
- **Lưu ý quan trọng (Backend Authority)**: Backend là nơi quyết định giá cuối cùng khi gọi `POST /cart/items` và `POST /orders`. Frontend chỉ tính toán để hiển thị realtime cho người dùng trải nghiệm mượt mà.

---

## 5. Ánh xạ API & State Management

### 5.1. API Yêu cầu
- `GET /products/:slug` (hoặc `:id`) — Lấy thông tin sản phẩm nền (Base Custom Cake Product).
- `GET /products/:id/options` — Lấy danh sách nhóm tùy chọn và chi tiết giá từng mục.
- `POST /cart/items` — Thêm bánh vào giỏ hàng với payload:
  ```json
  {
    "productId": "uuid-of-custom-cake",
    "quantity": 1,
    "optionItemIds": ["size-uuid", "sponge-uuid", "topping-uuid"],
    "customNote": "Chúc mừng sinh nhật WeBee"
  }
  ```

### 5.2. Xử lý sau khi thêm vào giỏ
- Mở **Cart Drawer** ngay trên trang hiện tại để xác nhận thành công.
- Không tự động chuyển trang sang `/cart` hay `/checkout`.

---

## 6. Các trạng thái giao diện (UI States)

- **Loading State**: Hiển thị Skeleton cho khung ảnh preview và các danh sách nút bấm tùy chọn.
- **Empty / Error State**: Nếu không tải được cấu hình bánh từ backend, hiển thị thông báo lỗi và nút `Thử lại` hoặc `Quay lại thực đơn`.
