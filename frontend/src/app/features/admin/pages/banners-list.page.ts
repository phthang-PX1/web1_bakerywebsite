import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Banner } from '../../../core/models/banner.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-banners-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, ConfirmDialogComponent],
  template: `
    <div class="admin-page">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <h1 class="admin-page__title" style="margin:0">Banner trang chủ</h1>
        <button class="btn-primary" (click)="openForm()">+ Thêm banner</button>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="admin-section" style="margin-bottom:24px">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Liên kết</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (banner of banners(); track banner.bannerId) {
                  <tr>
                    <td>
                      <img [src]="banner.imageUrl" [alt]="banner.title"
                        style="width:96px;height:54px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb" />
                    </td>
                    <td>
                      <strong>{{ banner.title }}</strong>
                      @if (banner.subtitle) {
                        <div style="font-size:12px;color:#6b6b6b">{{ banner.subtitle }}</div>
                      }
                    </td>
                    <td style="font-size:12px;color:#6b6b6b">{{ banner.linkUrl || '—' }}</td>
                    <td>{{ banner.sortOrder }}</td>
                    <td>
                      @if (banner.isActive) {
                        <span class="badge-active">Hiển thị</span>
                      } @else {
                        <span class="badge-inactive">Đã ẩn</span>
                      }
                    </td>
                    <td>
                      <div style="display:flex;gap:8px">
                        <button class="btn-sm btn-sm--secondary" (click)="openForm(banner)">Sửa</button>
                        <button class="btn-sm btn-sm--secondary" (click)="toggleBanner(banner)">
                          {{ banner.isActive ? 'Ẩn' : 'Hiện' }}
                        </button>
                        <button class="btn-sm btn-sm--secondary" style="color:#dc2626" (click)="deletingId.set(banner.bannerId)">Xóa</button>
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="6" style="text-align:center;color:#6b6b6b;padding:32px">Chưa có banner nào. Thêm banner để trang chủ hiển thị carousel chiến dịch.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Create/Edit modal -->
      @if (showForm()) {
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:50;display:flex;align-items:center;justify-content:center;padding:16px">
          <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 24px">
              {{ editing() ? 'Sửa banner' : 'Thêm banner mới' }}
            </h2>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="form-group">
                <label>Tiêu đề *</label>
                <input formControlName="title" class="form-input" placeholder="VD: Chương trình Khách hàng Thân thiết 2026" />
                @if (form.get('title')?.invalid && form.get('title')?.touched) {
                  <p class="form-error">Vui lòng nhập tiêu đề (tối thiểu 2 ký tự).</p>
                }
              </div>
              <div class="form-group">
                <label>Mô tả ngắn</label>
                <input formControlName="subtitle" class="form-input" placeholder="Dòng phụ hiển thị dưới tiêu đề" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Liên kết khi bấm</label>
                  <input formControlName="linkUrl" class="form-input" placeholder="/membership hoặc /products" />
                </div>
                <div class="form-group">
                  <label>Thứ tự</label>
                  <input formControlName="sortOrder" type="number" class="form-input" min="0" />
                </div>
              </div>
              <div class="form-group">
                <label>Ảnh banner {{ editing() ? '(để trống nếu giữ ảnh cũ)' : '*' }}</label>
                <input type="file" accept="image/*" (change)="onFileSelect($event)" style="font-size:13px" />
                @if (previewUrl()) {
                  <img [src]="previewUrl()" alt="Xem trước"
                    style="margin-top:10px;width:100%;max-height:160px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb" />
                }
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="form.invalid || saving() || (!editing() && !imageFile)">
                  {{ saving() ? 'Đang lưu…' : (editing() ? 'Cập nhật' : 'Thêm banner') }}
                </button>
                <button type="button" class="btn-outline" (click)="closeForm()">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-dialog
        [open]="deletingId() !== null"
        title="Xóa banner"
        message="Bạn có chắc muốn xóa banner này? Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        (confirm)="deleteBanner()"
        (cancel)="deletingId.set(null)"
      />
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminBannersListPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly banners = signal<Banner[]>([]);
  readonly showForm = signal(false);
  readonly editing = signal<Banner | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(null);

  imageFile: File | null = null;

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    subtitle: [''],
    linkUrl: [''],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.adminApi.getBanners().subscribe({
      next: (banners) => { this.banners.set(banners); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Tải danh sách banner thất bại.'); },
    });
  }

  openForm(banner?: Banner): void {
    this.editing.set(banner ?? null);
    this.imageFile = null;
    this.previewUrl.set(banner?.imageUrl ?? null);
    this.form.reset({
      title: banner?.title ?? '',
      subtitle: banner?.subtitle ?? '',
      linkUrl: banner?.linkUrl ?? '',
      sortOrder: banner?.sortOrder ?? 0,
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
    this.imageFile = null;
    this.previewUrl.set(null);
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.imageFile = file;
    this.previewUrl.set(file ? URL.createObjectURL(file) : this.editing()?.imageUrl ?? null);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const body = {
      title: v.title!,
      subtitle: v.subtitle || undefined,
      linkUrl: v.linkUrl || undefined,
      sortOrder: v.sortOrder ?? 0,
    };
    this.saving.set(true);

    const current = this.editing();
    const request$ = current
      ? this.adminApi.updateBanner(current.bannerId, body, this.imageFile ?? undefined)
      : this.adminApi.createBanner(body, this.imageFile!);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success(current ? 'Đã cập nhật banner.' : 'Đã thêm banner mới.');
        this.closeForm();
        this.load();
      },
      error: () => { this.saving.set(false); this.toastService.error('Lưu banner thất bại.'); },
    });
  }

  toggleBanner(banner: Banner): void {
    this.adminApi.toggleBannerStatus(banner.bannerId).subscribe({
      next: (updated) => {
        this.banners.update((list) => list.map((b) => b.bannerId === updated.bannerId ? updated : b));
        this.toastService.success(`Đã ${updated.isActive ? 'hiện' : 'ẩn'} banner.`);
      },
      error: () => this.toastService.error('Thao tác thất bại.'),
    });
  }

  deleteBanner(): void {
    const id = this.deletingId();
    if (!id) return;
    this.adminApi.deleteBanner(id).subscribe({
      next: () => {
        this.banners.update((list) => list.filter((b) => b.bannerId !== id));
        this.deletingId.set(null);
        this.toastService.success('Đã xóa banner.');
      },
      error: () => { this.deletingId.set(null); this.toastService.error('Xóa banner thất bại.'); },
    });
  }
}
