# Sơ đồ DFD Context – Hệ thống WeBee

> Đối chiếu với code thực tế. Thanh toán dùng **QR chuyển khoản tĩnh** (không tích hợp cổng thanh toán online); webhook `POST /webhooks` chỉ để đối soát/cập nhật trạng thái thủ công.

## Tác nhân ngoài (External Entities)
- **KHÁCH HÀNG**
- **NGÂN HÀNG / QR CHUYỂN KHOẢN** (xác nhận chuyển khoản, không phải cổng thanh toán tự động)
- **GOOGLE OAUTH**
- **DỊCH VỤ GỬI EMAIL/SMS** (Nodemailer/Gmail + Twilio)
- **CLOUDINARY** (lưu ảnh sản phẩm, blog, đánh giá)
- **QUẢN TRỊ VIÊN**

## Tiến trình trung tâm (Process)
- **Hệ thống WeBee**

## Luồng dữ liệu (Data Flows)

### Từ KHÁCH HÀNG vào Hệ thống
- Thông tin đăng ký
- Thông tin đăng nhập
- Từ khóa tìm kiếm, tiêu chí lọc
- Thông tin đổi mật khẩu
- Thông tin hồ sơ
- Thành phần bánh tùy chỉnh
- Dữ liệu sản phẩm trong giỏ hàng
- Thông tin đặt hàng
- Mã voucher
- Nội dung đánh giá
- Dữ liệu hành vi

### Từ Hệ thống ra KHÁCH HÀNG
- Thông tin sản phẩm
- Kết quả tìm kiếm & lọc
- Thông tin bánh tùy chỉnh
- Dữ liệu tổng tiền giỏ hàng
- Kết quả áp giảm giá
- Mã đơn hàng, tóm tắt đơn
- Lịch sử đơn hàng

### Với GOOGLE OAUTH
- **Hệ thống → Google OAuth:** Yêu cầu đăng nhập
- **Google OAuth → Hệ thống:** Access token, Thông tin profile

### Với NGÂN HÀNG / QR CHUYỂN KHOẢN
- **Hệ thống → Khách:** Ảnh QR tĩnh + nội dung chuyển khoản (mã đơn)
- **Ngân hàng → Hệ thống (thủ công/webhook):** Xác nhận đã nhận tiền → cập nhật `payment_status`

### Với CLOUDINARY
- **Hệ thống → Cloudinary:** Upload ảnh sản phẩm / blog / đánh giá
- **Cloudinary → Hệ thống:** URL ảnh đã lưu

### Với DỊCH VỤ GỬI EMAIL/SMS
- **Hệ thống → Dịch vụ:** Dữ liệu reset mật khẩu, Xác nhận đơn, Kích hoạt tài khoản
- **Dịch vụ → Hệ thống:** Trạng thái gửi

### Với QUẢN TRỊ VIÊN
- **Hệ thống → Quản trị viên:** Danh sách & chi tiết đơn hàng, Thông tin khách hàng, Báo cáo doanh thu, Báo cáo hành vi người dùng
- **Quản trị viên → Hệ thống:** Thông tin đăng nhập, Thông tin danh mục & sản phẩm, Trạng thái đơn hàng, Thông tin danh mục & thành phần, Kết quả xác thực


# DFD Phân rã – Hệ thống WeBee (Level 0) – Chi tiết đọc/ghi datastore

## 1. Quản lý tài khoản & xác thực
- **Với KHÁCH HÀNG**: nhận thông tin đăng ký, đăng nhập, đổi mật khẩu, hồ sơ; gửi kết quả xác thực.
- **Với GOOGLE OAUTH**: gửi yêu cầu đăng nhập; nhận access token, thông tin profile.
- **Với DỊCH VỤ EMAIL/SMS**: gửi dữ liệu reset mật khẩu, kích hoạt tài khoản; nhận trạng thái gửi.
- **Truy xuất D1 (Tài khoản)**:
  - *Đọc*: thông tin đăng nhập (email, mật khẩu hash), profile hiện tại.
  - *Ghi*: thông tin đăng ký mới, mật khẩu đã đổi, profile cập nhật.

## 2. Xem và tìm kiếm sản phẩm
- **Với KHÁCH HÀNG**: nhận từ khóa, tiêu chí lọc; gửi kết quả tìm kiếm & lọc, thông tin sản phẩm.
- **Truy xuất**:
  - *D2 (Danh mục sản phẩm)* – đọc: danh sách danh mục để lọc.
  - *D3 (Sản phẩm)* – đọc: sản phẩm theo từ khóa, tiêu chí.
  - *D9 (Đánh giá)* – đọc: điểm đánh giá trung bình, số lượng đánh giá.

## 3. Tùy chỉnh bánh
- **Với KHÁCH HÀNG**: nhận thành phần bánh tùy chỉnh; gửi thông tin bánh tùy chỉnh, thông tin thành phần.
- **Truy xuất**:
  - *D4 (Nhóm thành phần)* – đọc: danh sách nhóm (loại bột, nhân, topping…).
  - *D5 (Chi tiết thành phần)* – đọc: tên, giá, tồn kho của từng thành phần.

## 4. Quản lý giỏ hàng
- **Với KHÁCH HÀNG**: nhận dữ liệu sản phẩm trong giỏ, thông tin đặt hàng, mã voucher; gửi tổng tiền giỏ, kết quả áp giảm giá.
- **Truy xuất**:
  - *D3 (Sản phẩm)* – đọc: giá gốc, thông tin sản phẩm.
  - *D5 (Chi tiết thành phần)* – đọc: giá thành phần tùy chọn.
  - *D8 (Mã giảm giá)* – đọc: mức giảm, điều kiện áp dụng.
  - (Giỏ hàng không ghi vào datastore – lưu tạm phiên)

## 5. Đặt hàng & thanh toán
- **Với KHÁCH HÀNG**: nhận thông tin đặt hàng, mã voucher; gửi mã đơn hàng, tóm tắt đơn, kết quả áp giảm giá, ảnh QR chuyển khoản.
- **Với NGÂN HÀNG / QR**: hiển thị QR tĩnh + nội dung chuyển khoản; nhận xác nhận thanh toán để cập nhật trạng thái.
- **Với DỊCH VỤ EMAIL/SMS**: gửi email/SMS xác nhận đơn.
- **Truy xuất**:
  - *Đọc*: D1 (thông tin khách hàng), D3 (giá sản phẩm), D5 (giá thành phần), D8 (kiểm tra mã giảm giá).
  - *Ghi*:
    - D6 (Đơn hàng): mã đơn, ngày đặt, tổng tiền, trạng thái, ID khách, snapshot thiệp/lời nhắn.
    - D7 (Chi tiết đơn) + D7b (Tùy chọn dòng đơn): snapshot sản phẩm, số lượng, thành phần, giá từng dòng.
    - D8 (Mã giảm giá): cập nhật số lần dùng.

## 6. Theo dõi đơn hàng
- **Với KHÁCH HÀNG**: nhận lịch sử đơn hàng; gửi thông tin đơn hàng (trạng thái, chi tiết).
- **Truy xuất**:
  - *Đọc*: D6 (danh sách đơn theo ID khách), D7 (chi tiết sản phẩm, thành phần của từng đơn).

## 7. Quản lý danh mục & sản phẩm (cho Quản trị viên)
- **Với QUẢN TRỊ VIÊN**: nhận thông tin đăng nhập, thông tin danh mục & sản phẩm; gửi lại thông tin danh mục, sản phẩm (kết quả xác thực, danh sách).
- **Truy xuất**:
  - *D2*: đọc danh sách danh mục; ghi/cập nhật (thêm, sửa, xóa danh mục).
  - *D3*: đọc danh sách sản phẩm; ghi/cập nhật (thêm, sửa giá, tồn kho, mô tả, ảnh).

## 8. Quản lý thành phần bánh (cho Quản trị viên)
- **Với QUẢN TRỊ VIÊN**: nhận thông tin danh mục thành phần & thông tin thành phần; gửi lại các danh sách tương ứng.
- **Truy xuất**:
  - *D4*: đọc danh sách nhóm thành phần; ghi/cập nhật nhóm.
  - *D5*: đọc danh sách thành phần theo nhóm; ghi/cập nhật thành phần (giá, tồn kho, tên).

## 9. Quản lý đơn hàng (cho Quản trị viên)
- **Với QUẢN TRỊ VIÊN**: nhận trạng thái đơn hàng cập nhật; gửi danh sách & chi tiết đơn hàng, thông tin khách hàng.
- **Truy xuất**:
  - *Đọc*: D6 (toàn bộ đơn), D7 (chi tiết đơn), D1 (thông tin khách hàng theo ID).
  - *Ghi (cập nhật)*: D6 (cập nhật trạng thái đơn: xác nhận, giao hàng, hoàn thành, hủy).

## 10. Thu thập hành vi người dùng
- **Với KHÁCH HÀNG**: nhận dữ liệu hành vi (xem, tìm kiếm, thêm giỏ, đặt hàng…).
- **Truy xuất**:
  - *Ghi*: D10 (Hành vi người dùng) – lưu sự kiện, thời gian, ID khách (nếu có).

## 11. Thống kê & báo cáo (cho Quản trị viên)
- **Với QUẢN TRỊ VIÊN**: nhận yêu cầu báo cáo; gửi báo cáo doanh thu, hành vi người dùng, thông tin khách hàng.
- **Truy xuất (đọc)**:
  - D6: doanh thu, số lượng đơn, trạng thái.
  - D7: sản phẩm bán chạy, doanh thu theo sản phẩm.
  - D1: số lượng khách mới, phân bố khách.
  - D9: điểm đánh giá trung bình, sản phẩm yêu thích.
  - D10: hành vi phổ biến, tỷ lệ chuyển đổi.

## 12. Tích điểm & xét hạng thành viên
- **Với KHÁCH HÀNG**: gửi số điểm, hạng hiện tại, kho voucher theo hạng.
- **Với QUẢN TRỊ VIÊN**: nhận yêu cầu chạy xét hạng theo chu kỳ (`POST /admin/loyalty/cycles/evaluate`).
- **Truy xuất**:
  - *Đọc*: D6 (đơn `delivered` để tính điểm & doanh thu chu kỳ).
  - *Ghi*: D1 (cập nhật `loyalty_points`, `membership_tier`), D11 (Nhật ký điểm), D12 (Chu kỳ hạng), D13 (Kho voucher — phát theo hạng).

## 13. Quản lý nội dung (Blog, Banner) — cho Quản trị viên
- **Với QUẢN TRỊ VIÊN**: nhận bài viết/banner (tạo, sửa, ẩn/hiện); gửi danh sách.
- **Với KHÁCH HÀNG**: gửi danh sách bài blog, banner đang active.
- **Với CLOUDINARY**: upload ảnh bìa/gallery/banner, nhận URL.
- **Truy xuất**: *Ghi/đọc* D14 (Blog), D15 (Banner).

## Tổng hợp kho dữ liệu
| Kho | Tên | Được ghi bởi process | Được đọc bởi process |
|-----|-----|----------------------|----------------------|
| D1 | Tài khoản | 1, 5, 12 | 1, 5, 9, 11, 12 |
| D2 | Danh mục sản phẩm | 7 | 2, 7 |
| D3 | Sản phẩm | 7 | 2, 4, 5, 7 |
| D4 | Nhóm thành phần | 8 | 3, 8 |
| D5 | Chi tiết thành phần | 8 | 3, 4, 5, 8 |
| D6 | Đơn hàng | 5, 9 | 6, 9, 11, 12 |
| D7 | Chi tiết đơn | 5 | 6, 9, 11 |
| D7b | Tùy chọn dòng đơn | 5 | 6, 9 |
| D8 | Mã giảm giá | 5, 12 | 4, 5, 12 |
| D9 | Đánh giá | 6 (sau khi nhận đơn) | 2, 11 |
| D10 | Hành vi người dùng | 10 | 11 |
| D11 | Nhật ký điểm (loyalty_logs) | 12 | 12 |
| D12 | Chu kỳ hạng (membership_cycles) | 12 | 11, 12 |
| D13 | Kho voucher (vouchers_inventory) | 12 | 12 |
| D14 | Blog (blog_posts) | 13 | 13 |
| D15 | Banner (banners) | 13 | 13 |