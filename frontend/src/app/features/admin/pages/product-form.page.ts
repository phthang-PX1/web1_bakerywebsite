import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-product-form-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <div class="admin-page">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
        <a routerLink="/admin/products" style="color:#6b6b6b;text-decoration:none;font-size:20px">←</a>
        <h1 class="admin-page__title" style="margin:0">{{ isEdit() ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h1>
      </div>

      @if (loadingProduct()) {
        <app-loading-spinner />
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
          <div class="form-group">
            <label>Tên sản phẩm *</label>
            <input formControlName="name" class="form-input" placeholder="Tên sản phẩm" />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="form-error">Vui lòng nhập tên sản phẩm.</p>
            }
          </div>

          <div class="form-group">
            <label>Mô tả</label>
            <textarea formControlName="description" class="form-textarea" rows="4" placeholder="Mô tả ngắn..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Giá cơ bản (VNĐ) *</label>
              <input formControlName="basePrice" type="number" class="form-input" placeholder="0" min="0" />
              @if (form.get('basePrice')?.invalid && form.get('basePrice')?.touched) {
                <p class="form-error">Vui lòng nhập giá hợp lệ.</p>
              }
            </div>
            <div class="form-group">
              <label>Danh mục (ID)</label>
              <input formControlName="categoryId" class="form-input" placeholder="category-id" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="display:flex;align-items:center;gap:10px;padding-top:24px">
              <input type="checkbox" formControlName="isActive" id="isActive" style="width:16px;height:16px" />
              <label for="isActive" style="margin:0;cursor:pointer">Đang bán</label>
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:10px;padding-top:24px">
              <input type="checkbox" formControlName="isCustomizable" id="isCustomizable" style="width:16px;height:16px" />
              <label for="isCustomizable" style="margin:0;cursor:pointer">Cho phép tùy chỉnh</label>
            </div>
          </div>

          @if (isEdit() && currentProduct()) {
            <div class="form-group">
              <label>Ảnh sản phẩm</label>
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">
                <img
                  [src]="currentProduct()!.thumbnailUrl ?? '/assets/images/product-placeholder.webp'"
                  alt="thumbnail"
                  style="width:80px;height:80px;border-radius:8px;object-fit:cover;border:1px solid #f3f4f6"
                  appImgFallback
                />
                <div>
                  <input type="file" accept="image/*" (change)="onFileSelect($event)" style="font-size:13px" />
                  @if (uploadingImage()) {
                    <p style="font-size:12px;color:#C96A2E;margin:4px 0 0">Đang tải ảnh…</p>
                  }
                </div>
              </div>
            </div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Đang lưu…' : (isEdit() ? 'Cập nhật' : 'Tạo sản phẩm') }}
            </button>
            <a routerLink="/admin/products" class="btn-outline" style="text-decoration:none;display:inline-flex;align-items:center">Hủy</a>
          </div>
        </form>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminProductFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly isEdit = signal(false);
  readonly loadingProduct = signal(false);
  readonly saving = signal(false);
  readonly uploadingImage = signal(false);
  readonly currentProduct = signal<Product | null>(null);

  private productId = '';

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    categoryId: [''],
    isActive: [true],
    isCustomizable: [false],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productId = id;
      this.loadProduct(id);
    }
  }

  private loadProduct(id: string): void {
    this.loadingProduct.set(true);
    this.adminApi.getProduct(id).subscribe({
      next: (p) => {
        this.currentProduct.set(p);
        this.form.patchValue({
          name: p.name,
          description: p.description ?? '',
          basePrice: p.basePrice,
          categoryId: p.categoryId ?? '',
          isActive: p.isActive,
          isCustomizable: p.isCustomizable,
        });
        this.loadingProduct.set(false);
      },
      error: () => { this.loadingProduct.set(false); this.toastService.error('Tải sản phẩm thất bại.'); },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    this.saving.set(true);

    if (this.isEdit()) {
      this.adminApi.updateProduct(this.productId, {
        name: v.name ?? undefined,
        description: v.description ?? undefined,
        basePrice: v.basePrice ?? undefined,
        categoryId: v.categoryId ?? undefined,
        isActive: v.isActive ?? undefined,
        isCustomizable: v.isCustomizable ?? undefined,
      }).subscribe({
        next: () => { this.saving.set(false); this.toastService.success('Cập nhật thành công.'); this.router.navigate(['/admin/products']); },
        error: () => { this.saving.set(false); this.toastService.error('Cập nhật thất bại.'); },
      });
    } else {
      // TODO_BACKEND: POST /admin/products create endpoint
      this.toastService.info('Tính năng tạo sản phẩm đang được phát triển.');
      this.saving.set(false);
    }
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.productId) return;
    this.uploadingImage.set(true);
    this.adminApi.uploadProductImage(this.productId, file).subscribe({
      next: (res) => {
        this.currentProduct.update((p) => p ? { ...p, thumbnailUrl: res.imageUrl } : p);
        this.uploadingImage.set(false);
        this.toastService.success('Tải ảnh thành công.');
      },
      error: () => { this.uploadingImage.set(false); this.toastService.error('Tải ảnh thất bại.'); },
    });
  }
}
