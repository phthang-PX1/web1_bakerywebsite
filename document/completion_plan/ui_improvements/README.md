# UX đợt 3 — Banner động, category art, sửa 7 nhóm vấn đề

Đợt hoàn thiện thứ 3 sau redesign editorial, xử lý các vấn đề người dùng rà soát thực tế. Quyết định đã chốt: banner quản lý từ **admin** (backend mới), icon danh mục = **SVG vẽ tay**, sửa giỏ hàng = **prefill trang sản phẩm**.

| Phase | Nội dung | Trạng thái |
|---|---|---|
| A | [Quick fixes — giá đơn vị, link register, chính sách, branding, map màu](phase-a-quick-fixes.md) | ✅ Hoàn thành |
| B | [Custom-cake — preview image, layout jump, Kem phủ single-select](phase-b-custom-cake.md) | ✅ Hoàn thành (DB đã cập nhật 24 nhóm) |
| C | [Cart edit — prefill trang sản phẩm + replaceItem](phase-c-cart-edit.md) | ✅ Hoàn thành |
| D | [Checkout — điểm nhấn màu + lỗi đỏ + scroll-to-error](phase-d-checkout.md) | ✅ Hoàn thành |
| E | [Auth — confirm password, password toggle](phase-e-auth.md) | ✅ Hoàn thành |
| F | [Category art — 6 SVG minh họa + tile grid](phase-f-category-art.md) | ✅ Hoàn thành |
| G | [Hero banner động — backend + admin UI + carousel](phase-g-banner-system.md) | ✅ Hoàn thành (dùng `prisma db push` do schema drift chặn migrate) |

## Đợt bổ sung — Auth theo SĐT + redesign (✅ hoàn thành)

- **Bỏ dropdown "Chính sách" khỏi header** (header quá chật) — chính sách vẫn đủ ở footer + policy-nav trong trang.
- **Đăng ký/đăng nhập bằng SĐT + mật khẩu**: backend vốn hỗ trợ email-hoặc-phone; đã sửa register để **tài khoản SĐT kích hoạt ngay** (không phụ thuộc SMS Twilio — trước đây gửi SMS fail là rollback cả đăng ký). Email đi qua nút "Tiếp tục với Google" ở cả login lẫn register. Quên mật khẩu chuyển sang SĐT (gửi link qua SMS — cần Twilio hoạt động thật khi production).
- **Redesign bộ auth**: layout split-screen — panel trái nền espresso với logo + wordmark, quote Fraunces italic thương hiệu, khối arch trang trí, "Est. 2018 · TP. Hồ Chí Minh"; form phải kiểu frameless editorial (eyebrow + title serif có nhấn italic terracotta). Verify runtime: đăng ký SĐT mới → đăng nhập ngay → vào account thành công.

**Fix ngoài kế hoạch phát hiện khi verify:**
- `CLOUDINARY_CLOUD_NAME` trong `backend/.env` viết hoa → mọi upload ảnh (products/banners) đều 500. Đã sửa về `dhw56qppe`.
- `extraPrice` từ API options là string (Prisma Decimal) → custom-cake cộng chuỗi ra 42.9M thay vì 429k. Đã coerce `Number()`.
- `adminGuard` chạy trước khi user load xong khi vào thẳng URL `/admin/*` → admin hợp lệ bị đá về home. Guard giờ tự gọi `getMe()` khi user chưa sẵn sàng.

Thứ tự: A → B → C → D → E → F → G (G độc lập, có thể song song sau A). Mỗi phase: build + verify runtime.
