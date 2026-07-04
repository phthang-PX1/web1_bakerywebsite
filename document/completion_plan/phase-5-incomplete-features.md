# Phase 5 — Hoàn thiện tính năng dang dở

## Mục tiêu

Xử lý các tính năng đã có một phần hạ tầng (schema, hàm tính toán) nhưng chưa được nối vào luồng vận hành thực tế — hiện đang là "nợ tính năng" chứ không phải bug.

## Việc cụ thể

### 5.1 — Loyalty membership tier cycle chưa được orchestrate
- `MembershipCycle` model đã có trong `backend/prisma/schema.prisma`.
- Hàm tính hạng thành viên `resolveMembershipTierForCycle()` và bảng ngưỡng `TIER_THRESHOLDS` đã implement đầy đủ trong `backend/src/modules/loyalty/loyalty.service.ts`, khớp chính xác với `document/loyalty_rule.md` (Bronze ≥2 đơn/500k, Silver ≥4/1.2M, Gold ≥6/2.5M, Diamond ≥10/5M).
- **Vấn đề**: không có cron job, scheduled task, hay endpoint admin nào gọi tới hàm này — cơ chế đánh giá lại hạng thành viên mỗi 6 tháng mô tả trong tài liệu chưa hoạt động trong thực tế; không có `MembershipCycle` row nào từng được tạo.
- **Fix (cần quyết định hướng trước khi code)**:
  - Phương án A (đơn giản, không cần thêm dependency): thêm endpoint admin `POST /admin/loyalty/cycles/evaluate` để admin tự trigger đánh giá lại tier theo chu kỳ hiện tại, chạy thủ công hoặc gọi qua external cron (VD: cron job hệ điều hành, hoặc dịch vụ như GitHub Actions/cron-job.org gọi endpoint này định kỳ).
  - Phương án B (tự động hoàn toàn): thêm scheduled job trong chính backend (VD: dùng `node-cron`) chạy định kỳ, không cần trigger ngoài.
  - Khuyến nghị: Phương án A trước (đơn giản, dễ kiểm soát, không thêm dependency mới), có thể nâng cấp lên B sau nếu cần.

### 5.2 — `VoucherInventory` chỉ có schema, chưa có logic
- Model `VoucherInventory` tồn tại trong `schema.prisma` nhưng không có service/controller/route nào sử dụng.
- **Quyết định cần đưa ra trước khi code**: tính năng voucher tồn kho có còn nằm trong phạm vi sản phẩm hiện tại không?
  - Nếu **có**: cần thiết kế CRUD đầy đủ (tạo/issue voucher cho user theo tier, kiểm tra tồn kho khi áp dụng, endpoint `/users/me/vouchers` như `gap_analysis.md` đã đề cập nhưng chưa triển khai).
  - Nếu **không cần trong giai đoạn này**: cân nhắc xóa model khỏi schema để tránh gây hiểu nhầm "tính năng đã có" khi thực tế chưa dùng, hoặc giữ nguyên và ghi chú rõ trong `document/backend/gap_analysis.md` (Phase 7) là "chưa triển khai, để dành tương lai".

## Skill khi thực thi

- Task này có 2 phần độc lập (loyalty cycle job và voucher inventory quyết định) và có thể cần cả backend service mới + endpoint + (tùy chọn) cron setup — nếu muốn triển khai nhanh, có thể dùng `Workflow` để một agent xử lý loyalty cycle trong khi agent khác xử lý voucher inventory song song, vì hai việc này không phụ thuộc lẫn nhau.
- Mặc định (không dùng Workflow): xử lý tuần tự bằng agent thường, sau đó `/verify` — chạy thử endpoint mới bằng Postman/curl hoặc qua `test_api_runner.ts` mở rộng, xác nhận `MembershipCycle` row được tạo đúng và tier được cập nhật đúng cho user test.

## Definition of Done

- [ ] Có cơ chế (endpoint hoặc cron) để trigger đánh giá lại membership tier theo chu kỳ, đã test với dữ liệu seed thật.
- [ ] `MembershipCycle` row được tạo và tier user được cập nhật đúng khi trigger.
- [ ] Đã có quyết định rõ ràng về `VoucherInventory` (triển khai đầy đủ hoặc ghi nhận là out-of-scope), được phản ánh trong Phase 7 (đồng bộ tài liệu).
