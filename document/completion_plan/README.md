# Kế hoạch hoàn thiện sản phẩm — WeBee Bakery

Tài liệu này là mục lục cho kế hoạch hoàn thiện sản phẩm, được xây dựng từ một đợt code review toàn diện (backend + frontend + tích hợp) thực hiện ngày 2026-07-03. Chi tiết từng vấn đề nằm trong file phase tương ứng.

## Bối cảnh

Kiến trúc tổng thể khá vững: backend module hóa rõ ràng (Express + Prisma + Zod validate ở mọi route), frontend dùng Angular 22 hiện đại (signals, standalone components) với lớp API client tập trung. Vấn đề chính không nằm ở kiến trúc mà ở **các điểm nối cụ thể giữa frontend và backend bị lệch** (sai HTTP method, sai tên field, sai enum) khiến nhiều luồng thực tế bị lỗi khi chạy, cộng thêm thiếu test hoàn toàn và vài tính năng chưa hoàn thiện.

## Danh sách phase

| Phase | Tên | Trạng thái | Skill khi thực thi |
|---|---|---|---|
| 1 | [Sửa lỗi kết nối frontend↔backend](phase-1-integration-fixes.md) | Đã sửa xong code; luồng khách hàng đã verify runtime, phần admin giữ lại chưa verify (theo yêu cầu) | `/code-review`, `/verify` |
| 2 | [Bảo mật](phase-2-security.md) | Chưa bắt đầu | `/security-review`, `/verify` |
| 3 | [Cấu hình production build](phase-3-production-config.md) | Chưa bắt đầu | `/verify` |
| 4 | [UI/UX polish](phase-4-ui-ux-polish.md) | Chưa bắt đầu | `/code-review`, `/verify` |
| 5 | [Hoàn thiện tính năng dang dở](phase-5-incomplete-features.md) | Chưa bắt đầu | `Workflow` (tùy chọn), `/verify` |
| 6 | [Test coverage](phase-6-test-coverage.md) | Chưa bắt đầu | `/verify` |
| 7 | [Đồng bộ tài liệu](phase-7-docs-sync.md) | Chưa bắt đầu | — (Edit trực tiếp) |

## UI Redesign — Editorial/Artisanal (đợt riêng)

Redesign giao diện client (giữ màu/chức năng, đổi ngôn ngữ thiết kế) có bộ tài liệu riêng tại [ui_redesign/](ui_redesign/README.md) — 8 phase từ foundation token layer đến checkout flow.

## Thứ tự thực hiện khuyến nghị

Phase 1 → 2 → 3 chạy tuần tự (mỗi phase phụ thuộc vào việc phase trước không phá luồng chính). Phase 4, 5, 6 có thể chạy song song sau khi Phase 1-3 xong, vì không phụ thuộc lẫn nhau. Phase 7 luôn chạy cuối cùng.

## Cách dùng các file phase

Mỗi file phase gồm:
1. **Mục tiêu** — vấn đề gì đang được giải quyết
2. **Việc cụ thể** — danh sách task với file/dòng liên quan, đã xác minh trong code thật (không suy đoán)
3. **Skill khi thực thi** — skill nào nên gọi và tại bước nào
4. **Definition of Done** — tiêu chí để coi phase là hoàn thành

Cập nhật cột "Trạng thái" ở bảng trên khi bắt đầu/hoàn thành mỗi phase.
