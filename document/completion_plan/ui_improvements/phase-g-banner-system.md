# Phase G — Hero banner động quản lý từ admin

## Backend (theo pattern module hiện có)
1. Prisma model `Banner`: `bannerId` uuid PK, `title` (255), `subtitle?` (500), `imageUrl` (500), `linkUrl?` (500), `sortOrder` int default 0, `isActive` bool default true, `createdAt/updatedAt`. Migration mới.
2. Module `backend/src/modules/banners/` (routes/controller/service/schema + Zod + swagger):
   - Public `GET /banners`: isActive=true, orderBy sortOrder asc.
   - Admin (`auth` + `requireRole('admin')`): `GET /admin/banners` (tất cả), `POST /admin/banners` (multipart field `image` → Cloudinary folder `webee/banners`, validate mimetype + 5MB như products), `PUT /admin/banners/:id` (title/subtitle/linkUrl/sortOrder + ảnh mới tùy chọn), `PATCH /admin/banners/:id/status`, `DELETE /admin/banners/:id` (xóa Cloudinary image nếu được).
   - Mount `routes/index.ts`: `/banners` + `/admin/banners`.

## Admin UI
3. `frontend/src/app/features/admin/pages/banners-list.page.ts` (inline template + admin.page.scss như các trang admin khác): bảng thumbnail/title/sortOrder/active-toggle/sửa/xóa + form tạo/sửa (title, subtitle, linkUrl, sortOrder, file ảnh). `AdminApi`: `getBanners/createBanner/updateBanner/toggleBannerStatus/deleteBanner`. Route `/admin/banners` + link menu admin layout.

## Home carousel
4. `core/api/banners.api.ts`: `getBanners(): Observable<Banner[]>` + model.
5. Component `hero-carousel` (features/home/components): slide 0 = hero editorial hiện tại (giữ nguyên `app-hero-banner`); slide 1..n = banner API (layout text trái Fraunces title/subtitle + CTA link, ảnh arch phải — cùng ngôn ngữ hero). Auto-rotate 6s (clear khi hover/focus), chấm điều hướng + mũi tên, swipe pointer events; API rỗng/lỗi → chỉ hiện hero mặc định, không dot. Không thêm thư viện.

## Definition of Done
- [ ] Admin tạo banner (có ảnh) → home hiện carousel trượt kèm banner; sửa/toggle/xóa hoạt động
- [ ] API public chỉ trả banner active, đúng thứ tự sortOrder
- [ ] Không có banner → home như hiện tại (không dot/mũi tên)
- [ ] Prod build pass; carousel không giật layout (chiều cao slide ổn định)
