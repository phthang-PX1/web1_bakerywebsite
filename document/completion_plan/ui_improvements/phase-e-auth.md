# Phase E — Auth polish

## Bối cảnh
Trang đăng ký **đã tồn tại** ở `/auth/register` — trước Phase A bị "ẩn" do 3 link trỏ nhầm `/register`. Phase này polish 3 trang chính.

## Việc cụ thể
1. **Register** (`register.page.ts`): thêm field "Xác nhận mật khẩu" với validator khớp mật khẩu (cross-field validator trên FormGroup); lỗi hiển thị đỏ.
2. **Password visibility toggle**: nút con mắt (inline SVG) cho mọi input password ở login/register/reset-password — toggle `type="password|text"`.
3. Rà lại error style dùng `$danger` (đã đổi ở Phase D qua `auth.page.scss`).

## Definition of Done
- [ ] Đăng ký tài khoản mới qua UI thành công; mật khẩu không khớp → báo đỏ, không submit
- [ ] Con mắt hiện/ẩn mật khẩu hoạt động ở login/register/reset
