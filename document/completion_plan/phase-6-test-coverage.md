# Phase 6 — Test coverage

## Mục tiêu

Dự án hiện **không có test tự động thật nào** ở cả backend và frontend, dù README backend claim "Testing: Jest (Backend), Vitest (Frontend)". Đây là rủi ro lớn cho việc duy trì lâu dài, đặc biệt sau khi Phase 1 sửa nhiều điểm nối frontend↔backend — cần test để đảm bảo các lỗi tương tự không tái diễn.

## Việc cụ thể

### 6.1 — Backend: 0 test thật
- Không có file `*.test.ts`/`*.spec.ts` nào trong `backend/` (ngoài `node_modules`), không có Jest/Vitest config, `package.json` không có `test` script.
- File duy nhất giống test là `backend/test_api_runner.ts` — script smoke-test thủ công, chạy app in-process, đăng nhập tài khoản seed (`admin@webee.vn`, `khach01@webee.vn`), gọi tuần tự các API và in kết quả ra console. **Không phải test framework thật** (không có assertion library, không cô lập/mocking, ghi dữ liệu thật vào DB/Redis đang trỏ tới — chạy tùy tiện sẽ tạo đơn hàng thật, thay đổi số lần dùng coupon).
- **Fix**:
  1. Cài đặt Jest (hoặc Vitest) cho backend, thêm script `test` vào `package.json`.
  2. Viết unit test cho service layer — ưu tiên các phần có business logic quan trọng, đã bị lỗi/gần lỗi trong đợt review này:
     - `auth.service.ts`: refresh token, activation, reset password (đặc biệt: test case xác nhận response `/auth/refresh` trả đủ field, tránh regression giống lỗi Phase 1.5).
     - `cart.service.ts`: thêm/sửa/xóa item, tính subtotal, option-group validation.
     - `orders.service.ts`: tạo đơn từ cart, state machine chuyển trạng thái, format order item (tránh regression giống Phase 1.4).
     - `loyalty.service.ts`: tính điểm theo tier multiplier, `resolveMembershipTierForCycle()`.
  3. Có thể giữ `test_api_runner.ts` như một smoke test thủ công riêng biệt (không xóa), nhưng ghi rõ trong comment/README rằng nó có tác dụng phụ ghi DB thật, không dùng trong CI.

### 6.2 — Frontend: chỉ có 1 file test lỗi thời
- `frontend/src/app/app.spec.ts` là boilerplate mặc định của Angular CLI, assert tìm text "Hello, webee-frontend" trong `<h1>` — nhưng `App` component thực tế giờ chỉ bootstrap `AuthService.init()`/`CartService.loadCart()` trong `<router-outlet>`, không còn render nội dung đó → **test này gần như chắc chắn đang fail**.
- **Fix**:
  1. Sửa hoặc xóa `app.spec.ts` cho khớp hành vi thật của `App` component hiện tại.
  2. Viết test mới cho các phần có logic quan trọng nhất:
     - `AuthService`: lưu/đọc token, luồng refresh (test riêng cho bug Phase 1.5 để tránh tái diễn).
     - `CartService`: optimistic update + rollback khi API lỗi (logic này khá phức tạp theo khảo sát, đáng được test).
     - `auth.interceptor.ts`: gắn header, xử lý 401 → refresh, gate tránh refresh đồng thời.
     - Form quan trọng: `checkout.page.ts` (validate dynamic theo fulfillment_type), `login.page.ts`.

## Skill khi thực thi

- `/verify` sau khi viết mỗi cụm test — chạy thật bộ test (`npm test` ở cả backend và frontend) và xác nhận pass, không chỉ dựa vào việc code test "trông hợp lý". Đặc biệt kiểm tra test không pass giả (VD: assertion luôn đúng, không thực sự kiểm tra hành vi).

## Definition of Done

- [ ] Backend có `test` script chạy được, có ít nhất test cho auth (refresh token), cart, orders (state machine + format), loyalty (tính tier).
- [ ] `app.spec.ts` không còn fail; có thêm test cho AuthService, CartService, interceptor.
- [ ] Test cho luồng đã sửa ở Phase 1 (refresh token trả đủ field, order item field name đúng) tồn tại và pass — đảm bảo không regression trong tương lai.
- [ ] `test_api_runner.ts` được ghi chú rõ ràng là smoke-test thủ công có tác dụng phụ, không chạy trong CI.
