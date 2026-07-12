# Tổng quan hệ thống tài liệu WeBee Bakery

> Cập nhật lần cuối: 2026-06-27  
> Chuẩn đặt tên: `snake_case.md`  
> Mục đích: Bản đồ dẫn đường cho toàn bộ lập trình viên và AI Agent khi tham gia phát triển dự án WeBee Bakery.

---

## 1. 📂 `.agent/` — Quy tắc & Hướng dẫn cho AI Agent

Thư mục này chứa các ràng buộc bắt buộc, quy tắc kiến trúc và quy trình làm việc mà AI lập trình viên (Coding Agent) phải đọc trước khi thực thi viết code.

| File | Mô tả vai trò |
|---|---|
| `workflow_rules.md` | Quy tắc làm việc tổng thể, danh sách thông tin đã biết về backend và nguyên tắc xử lý khi gặp mâu thuẫn. |
| `backend_alignment.md` | Danh sách kiểm tra (checklist) đồng bộ API, xử lý cookie giỏ hàng, quy tắc thanh toán và form đặt hàng. |
| `coding_rules.md` | Tiêu chuẩn viết code Angular 22+ (Standalone components) và Express/TypeScript. |
| `feature_template.md` | Mẫu tài liệu chuẩn hóa khi triển khai một tính năng mới. |
| `frontend_architecture.md` | Kiến trúc Frontend: cách chia cấu trúc thư mục, state management và giao tiếp HTTP. |
| `no_code_planning.md` | Quy tắc tuyệt đối cấm sửa source code trong các pha quy hoạch, lập kế hoạch hoặc audit. |
| `ui_ux_rules.md` | Hệ thống token thiết kế ấm áp (warm bakery), quy tắc responsive 8px, các trạng thái UI (Loading/Empty/Error) và Copywriting tiếng Việt. |
| `conflict_check.md` | Checklist rà soát xung đột UI/UX trước khi code. |
| `implementation_workflow.md` | Quy trình từng bước thực thi coding cho Frontend. |
| 📂 `skills/` | Chứa 9 kỹ năng chuyên sâu hỗ trợ AI: `cloudinary.md`, `debug.md`, `integration.md`, `module.md`, `prisma_schema.md`, `review_commit.md`, `scaffolding.md`, `setup_env.md`, `update.md`. |

---

## 2. 📂 `document/` — Tài liệu Toàn hệ thống & Kiến trúc

Chứa các đặc tả hệ thống, báo cáo kiểm toán tổng thể và hợp đồng giao tiếp giữa Frontend - Backend.

| File | Mô tả vai trò |
|---|---|
| `context.md` | Bối cảnh dự án, quy mô nghiệp vụ và chân dung khách hàng mục tiêu. |
| `feature_mapping.md` | Bảng ánh xạ chi tiết từng tính năng UI với API endpoint tương ứng bên Backend. |
| `layout_contract.md` | Hợp đồng giao diện chung: Navbar, Footer, Cart Drawer và luồng điều hướng route. |
| `schema.md` | Đặc tả mô hình dữ liệu chuẩn (TypeScript interfaces khớp với Prisma ERD và Zod schemas). |
| `dfd.md` | Sơ đồ luồng dữ liệu hệ thống (Data Flow Diagram). |
| `erd.md` | Sơ đồ thực thể kết nối cơ sở dữ liệu (Entity Relationship Diagram). |
| `tech_stack.md` | Công nghệ nền tảng sử dụng trong dự án. |
| `loyalty_rule.md` | Quy tắc tích điểm và xếp hạng thành viên thân thiết. |

---

## 3. 📂 `document/backend/` — Tài liệu & Dữ liệu Backend

Chứa đặc tả API, kế hoạch bổ sung backend và các file dữ liệu mẫu (seed data).

| File | Mô tả vai trò |
|---|---|
| `api_contract.md` | Hợp đồng API chính thức (phân định rõ API đã có trong source code và API `TODO_BACKEND`). |
| `gap_analysis.md` | Phân tích các khoảng trống chức năng của Backend và kế hoạch cập nhật an toàn (đặc biệt là bổ sung COD). |
| `setup_plan.md` | Kế hoạch setup môi trường, cơ sở dữ liệu và tích hợp bên thứ ba ban đầu. |
| `structure.md` | Cấu trúc thư mục chuẩn của mã nguồn Backend Express/TypeScript. |
| `*.csv` | Dữ liệu mẫu (Categories, Products, Options, Images) dùng để seed vào database. |

---

## 4. 📂 `document/frontend/` — Đặc tả chức năng Màn hình Frontend

Chứa mô tả nghiệp vụ chi tiết cho từng trang của ứng dụng Angular cùng kế hoạch triển khai tổng thể.

| File | Mô tả trang / chức năng |
|---|---|
| `implementation_plan.md` | **Kế hoạch triển khai Frontend 10 pha chi tiết** (Tài liệu gối đầu giường khi bắt đầu code). |
| `home.md` | Trang chủ (Banner, Sản phẩm nổi bật, Bánh bán chạy nhất). |
| `products.md` | Trang danh sách sản phẩm (Lọc theo danh mục, giá, sắp xếp, phân trang). |
| `product_detail.md` | Trang chi tiết sản phẩm (Gallery ảnh, Đánh giá, Bộ chọn tùy chỉnh bánh theo cấu hình). |
| `cart.md` & `cart_drawer.md` | Trang giỏ hàng đầy đủ và Giỏ hàng trượt nhanh (Drawer), ghi chú lời chúc. |
| `checkout.md` | Trang thanh toán (Chọn COD/Chuyển khoản, gộp địa chỉ 3 cấp thành 1 string, chọn ngày/giờ giao hàng). |
| `orders.md` | Trang đặt hàng thành công và theo dõi thanh toán chuyển khoản bằng QR (polling 3 giây). |
| `account.md` | Trang quản lý tài khoản thành viên (`/account/*`: Hồ sơ, Địa chỉ, Lịch sử đơn hàng, Điểm thưởng). |
| `custom_cake.md` | Trang cấu hình bánh kem theo yêu cầu (`/custom-cake`: Giao diện chia đôi màn hình, ẩn footer). |
| `blog.md` & `policies.md` | Các trang nội dung tĩnh (Bài viết, Chính sách mua hàng, bảo mật). |
