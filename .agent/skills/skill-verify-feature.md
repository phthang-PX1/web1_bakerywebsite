# Skill: Kiểm tra chức năng sau khi fix

## Khi nào dùng

Sau khi đã fix lỗi (dùng `skill-fix-bug.md`) và `ng build` thành công, dùng skill này để xác nhận chức năng hoạt động **đúng và đầy đủ** trước khi chuyển sang cải thiện UI.

---

## Thông tin cần cung cấp

1. **Tên trang / chức năng** vừa được fix
2. **Loại chức năng** (xem danh mục bên dưới để chọn checklist phù hợp)

---

## Nhiệm vụ của Agent

### Bước 1 — Đọc lại code sau fix

Đọc lại các file đã thay đổi để xác nhận:
- Không còn `any` type không hợp lệ
- Không còn import thừa (gây warning `NG8113`)
- Signal / BehaviorSubject được cleanup đúng (dùng `takeUntilDestroyed()`)
- Template dùng `@if`, `@for`, `@else` (không dùng `*ngIf`, `*ngFor` cũ)

### Bước 2 — Chạy checklist theo loại chức năng

#### A. Mọi trang đều phải check

- [ ] **Loading state**: có `app-loading-spinner` hiển thị khi đang fetch data
- [ ] **Error state**: có thông báo lỗi + nút retry khi API thất bại
- [ ] **Empty state**: có thông báo phù hợp khi data rỗng (không để blank)
- [ ] **Toast messages**: success toast khi thành công, error toast khi thất bại
- [ ] **Console sạch**: không có lỗi JavaScript, không có TS runtime error
- [ ] **ng build**: `ng build --configuration development` chạy không có ERROR (warning là chấp nhận được)

#### B. Trang có Form (đăng nhập, đăng ký, checkout, profile, địa chỉ...)

- [ ] **Validation hiển thị**: thông báo lỗi validation bằng tiếng Việt khi blur hoặc submit
- [ ] **Submit button disabled**: khi form invalid hoặc đang loading
- [ ] **Reset sau submit thành công**: form reset hoặc navigate đi sau khi thành công
- [ ] **Reactive Forms**: dùng `FormBuilder` + `ReactiveFormsModule`, không dùng template-driven

#### C. Trang có danh sách + phân trang (sản phẩm, đơn hàng, admin...)

- [ ] **Phân trang hoạt động**: click page number thay đổi data đúng
- [ ] **Filter/Search**: thay đổi filter reload data từ đầu (page = 1)
- [ ] **Skeleton/Spinner**: hiện khi chuyển trang hoặc apply filter

#### D. Trang liên quan đến giỏ hàng / checkout

- [ ] **withCredentials**: mọi call tới CartApi phải có `{ withCredentials: true }`
- [ ] **Cart badge cập nhật**: header cart badge refresh sau khi thêm/xóa item
- [ ] **Cart merge**: sau khi đăng nhập, giỏ guest được merge vào tài khoản
- [ ] **Checkout validation**: `deliveryAddress` bắt buộc khi chọn "giao hàng", không bắt buộc khi "tự lấy"

#### E. Trang yêu cầu đăng nhập (account, checkout...)

- [ ] **authGuard**: route đã được bảo vệ trong `app.routes.ts`
- [ ] **Redirect đúng**: khi chưa đăng nhập, redirect tới `/login?redirect=<path>`
- [ ] **Redirect sau login**: sau khi đăng nhập, quay lại đúng trang ban đầu

#### F. Trang admin

- [ ] **adminGuard**: route có `canActivate: [adminGuard]`
- [ ] **Role check**: user thường không thể truy cập `/admin/*`
- [ ] **CRUD**: tạo/sửa/xóa/toggle cập nhật UI ngay lập tức (optimistic update hoặc reload)

#### G. Trang OAuth / Callback

- [ ] **Token lưu đúng**: `accessToken` + `refreshToken` vào localStorage với key `webee_access_token` / `webee_refresh_token`
- [ ] **Navigate sau login**: redirect về `/` hoặc `?redirect=` param
- [ ] **Error state**: nếu OAuth thất bại, hiện thông báo lỗi

### Bước 3 — Kiểm tra responsive (nhanh)

- [ ] Layout không bị vỡ ở mobile (< 768px): dùng DevTools → 375px width
- [ ] Không có nội dung bị tràn ra ngoài màn hình (overflow-x)
- [ ] Buttons và form inputs đủ lớn để tap (min 44px height)

### Bước 4 — Tổng kết

Output theo format:

```
## Kết quả kiểm tra: <Tên trang>

**Build:** ✅ Không có lỗi / ❌ Còn lỗi (liệt kê)

**Checklist chung:**
- [x] Loading state
- [x] Error state
- [x] Empty state
- [x] Toast messages
- [x] Console sạch

**Checklist đặc thù (<loại>):**
- [x] ...
- [ ] ... (ghi rõ vấn đề nếu fail)

**Kết luận:**
✅ Chức năng ổn định — có thể chuyển sang cải thiện UI
❌ Còn vấn đề: <mô tả> → cần fix trước
```

---

## Đầu ra

- Checklist đầy đủ đã được check từng mục
- Kết luận rõ ràng: ổn định hay còn vấn đề
- Nếu còn vấn đề: mô tả ngắn gọn và gợi ý dùng `skill-fix-bug.md` để fix tiếp

---

## Lưu ý

- Chỉ kết luận "ổn định" khi **tất cả** checkbox bắt buộc đều pass
- Không bỏ qua checklist vì "trông có vẻ ổn" — phải đọc code để xác nhận
- Nếu không có template HTML riêng (component dùng inline template), đọc trực tiếp trong file `.ts`
