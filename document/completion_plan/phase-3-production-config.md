# Phase 3 — Cấu hình production build

## Mục tiêu

Đảm bảo build production của frontend thực sự trỏ tới backend production, thay vì âm thầm dùng cấu hình dev (`localhost:3000`) — một lỗi cấu hình sẽ khiến bản build "production" không hoạt động khi deploy thật.

## Việc cụ thể

### 3.1 — `environment.prod.ts` không bao giờ được dùng khi build production
- `frontend/angular.json`, trong `architect.build.configurations.production` (dòng ~37-52), **không có** khối `fileReplacements` để thay `environment.ts` bằng `environment.prod.ts`.
- Hậu quả: chạy `ng build --configuration production` vẫn nhúng `frontend/src/environments/environment.ts` (`apiUrl: 'http://localhost:3000/api'`) vào bundle, không phải `environment.prod.ts`.
- `frontend/src/environments/environment.prod.ts:3` hiện chỉ có placeholder `apiUrl: 'https://your-production-domain.com/api'` — chưa được điền domain thật.
- **Fix**:
  1. Thêm `fileReplacements` chuẩn của Angular CLI vào `configurations.production` trong `angular.json`:
     ```json
     "fileReplacements": [
       {
         "replace": "src/environments/environment.ts",
         "with": "src/environments/environment.prod.ts"
       }
     ]
     ```
  2. Khi có domain backend thật, cập nhật `environment.prod.ts` với `apiUrl` chính xác (thay placeholder).

### 3.2 — Kiểm tra CORS backend khớp domain production
- `backend/src/config/env.ts:42-44` build `allowedOrigins` từ `http://localhost:4200` (hardcode) + `FRONTEND_URL` (từ `.env`, split theo dấu phẩy).
- Khi deploy, đảm bảo biến môi trường `FRONTEND_URL` trên server production được set đúng domain frontend thật (không phải placeholder `https://your-production-domain.com`).
- Lưu ý: `backend/.env` hiện có `FRONTEND_URL` bị khai báo 2 lần (dòng 12 và 41) — dotenv giữ giá trị **đầu tiên**, dòng sau bị bỏ qua. Nên dọn dẹp file `.env` xóa dòng trùng để tránh nhầm lẫn khi chỉnh sửa sau này (không ảnh hưởng hành vi hiện tại vì cả 2 giá trị đều chứa `localhost:4200`).

## Skill khi thực thi

- `/verify`: chạy `ng build --configuration production` trong `frontend/`, sau đó kiểm tra file bundle output (`dist/`) có chứa đúng URL production đã cấu hình (dùng `grep`/tìm chuỗi trong file JS đã build) — không chỉ tin vào cấu hình, phải xác nhận bằng bundle thật.

## Definition of Done

- [ ] `angular.json` có `fileReplacements` trong cấu hình `production`.
- [ ] Build `ng build --configuration production` xong, kiểm tra bundle JS chứa đúng `apiUrl` từ `environment.prod.ts`, không phải `localhost:3000`.
- [ ] `environment.prod.ts` chứa domain backend thật (khi đã có), không còn placeholder.
- [ ] `FRONTEND_URL` trên môi trường production của backend trỏ đúng domain frontend thật, và dòng trùng lặp trong `.env` mẫu/local đã được dọn dẹp.
