import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { CategoriesApi } from '../../../core/api/categories.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Category } from '../../../core/models/category.model';
import type { Product } from '../../../core/models/product.model';
import { getCategoryImage } from '../../../core/utils/category-image.util';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      <div style="margin-bottom: 28px;">
        <h1 class="admin-page__title" style="margin: 0; font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800;">Danh mục sản phẩm</h1>
        <p class="admin-page__subtitle" style="margin: 4px 0 0; color: #7a6555; font-size: 14.5px;">Quản lý nhóm hàng và phân loại nội dung cho khách hàng.</p>
      </div>

      <div style="display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start;">
        <!-- Column Left: Add/Edit Form -->
        <div class="dashboard-card" style="padding: 24px; background: #ffffff; border: 1px solid #ede8e2; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="font-size: 18px; font-family: 'Fraunces', serif; color: #2b1a0f; margin: 0 0 20px; font-weight: 800;">
            {{ editingCategory() ? 'Cập nhật danh mục' : 'Thêm danh mục mới' }}
          </h2>
          
          <form [formGroup]="catForm" (ngSubmit)="submitCategory()" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Tên danh mục *</label>
              <input formControlName="name" class="form-input" placeholder="Ví dụ: Bánh Mousse" style="width:100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; outline: none;" />
              @if (catForm.get('name')?.invalid && catForm.get('name')?.touched) {
                <p style="color: #dc2626; font-size: 12.5px; font-weight: 600; margin: 4px 0 0;">Vui lòng nhập tên danh mục.</p>
              }
            </div>

            <div>
              <label style="display: block; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Slug đường dẫn *</label>
              <input formControlName="slug" class="form-input" placeholder="Ví dụ: banh-mousse" style="width:100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; outline: none;" />
              @if (catForm.get('slug')?.invalid && catForm.get('slug')?.touched) {
                <p style="color: #dc2626; font-size: 12.5px; font-weight: 600; margin: 4px 0 0;">Vui lòng nhập slug hợp lệ (chỉ gồm chữ thường, số và gạch ngang).</p>
              }
            </div>

            <div>
              <label style="display: block; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Mô tả ngắn</label>
              <textarea formControlName="description" class="form-textarea" rows="4" placeholder="Mô tả danh mục..." style="width:100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; resize: vertical; outline: none;"></textarea>
            </div>

            @if (!editingCategory()) {
              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Ảnh minh họa</label>
                <input type="file" accept="image/*" (change)="onFileSelected($event)" style="font-size: 13px; width: 100%; color: #7a6555;" />
              </div>
            }

            <div style="display: flex; gap: 12px; margin-top: 10px;">
              @if (editingCategory()) {
                <button type="button" class="btn-secondary" style="flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #ede8e2; background: #fff; cursor: pointer; font-weight: 700; font-size: 14px;" (click)="cancelEdit()">Hủy sửa</button>
              }
              <button type="submit" class="btn-primary" style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #f5c842; color: #2b1a0f; cursor: pointer; font-weight: 800; font-size: 14px;" [disabled]="catForm.invalid || saving()">
                {{ saving() ? 'Đang lưu...' : (editingCategory() ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Column Right: Categories List Table -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Search and filters -->
          <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Tìm theo tên hoặc slug..."
                style="width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none;"
              />
              <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7a6555; display: flex; align-items: center;">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 11.5L15 15M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </div>
            <div>
              <select [(ngModel)]="statusFilter" style="padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; background: #fff; font-weight: 600; color: #2b1a0f; outline: none; cursor: pointer;">
                <option value="">Trạng thái: Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã ẩn</option>
              </select>
            </div>
          </div>

          <!-- Categories Table -->
          @if (loading()) {
            <app-loading-spinner />
          } @else {
            <div class="dashboard-card" style="padding: 0; overflow: hidden; border: 1px solid #ede8e2; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                  <thead>
                    <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                      <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; width: 60px; text-align: center;">STT</th>
                      <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; width: 80px;">Ảnh</th>
                      <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Tên danh mục</th>
                      <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center; width: 100px;">Số sản phẩm</th>
                      <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center; width: 160px;">Hiển thị trang chủ/Trạng thái</th>
                      <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: right; width: 120px;">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (category of filteredCategories(); track category.categoryId; let idx = $index) {
                      <tr style="border-bottom: 1px solid #f3ece3;">
                        <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: #7a6555; vertical-align: middle;">{{ idx + 1 }}</td>
                        <td style="padding: 14px 16px; vertical-align: middle;">
                          <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; background: #f9ede0; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">
                            <img
                              [src]="getCategoryImage(category.slug)"
                              [alt]="category.name"
                              style="width: 100%; height: 100%; object-fit: contain;"
                              appImgFallback
                            />
                          </div>
                        </td>
                        <td style="padding: 14px 16px; font-weight: 800; color: #2b1a0f; vertical-align: middle;">{{ category.name }}</td>
                        <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: #2b1a0f; vertical-align: middle;">
                          {{ getProductCountByCategory(category.categoryId) }}
                        </td>
                        <td style="padding: 14px 16px; text-align: center; vertical-align: middle;">
                          <span 
                            [style.background-color]="category.isActive ? '#e8fdf0' : '#fef2f2'"
                            [style.color]="category.isActive ? '#16a34a' : '#dc2626'"
                            style="font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px; display: inline-block; border: 1.5px solid currentColor;"
                          >
                            {{ category.isActive ? 'Đang hiển thị' : 'Đang ẩn' }}
                          </span>
                        </td>
                        <td style="padding: 14px 16px; text-align: right; vertical-align: middle;">
                          <div style="display: flex; gap: 8px; justify-content: flex-end;">
                            <button 
                              (click)="startEdit(category)"
                              style="background: #fff; border: 1.5px solid #ede8e2; color: #7a6555; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 700; transition: all 0.15s;"
                              onmouseover="this.style.borderColor='#c96a2e'; this.style.color='#c96a2e';"
                              onmouseout="this.style.borderColor='#ede8e2'; this.style.color='#7a6555';"
                            >
                              Sửa
                            </button>
                            <button 
                              (click)="toggleActive(category)"
                              [style.background]="category.isActive ? '#fef2f2' : '#f0fdf4'"
                              [style.border-color]="category.isActive ? '#fca5a5' : '#bbf7d0'"
                              [style.color]="category.isActive ? '#dc2626' : '#16a34a'"
                              style="border: 1.5px solid; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 700; transition: all 0.15s;"
                            >
                              {{ category.isActive ? 'Ẩn' : 'Hiện' }}
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: #7a6555; font-weight: 600;">Chưa có danh mục nào. Bấm "Thêm mới" bên trái để tạo danh mục đầu tiên.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCategoriesPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly editingCategory = signal<Category | null>(null);
  readonly saving = signal(false);

  // Filters
  readonly searchQuery = signal('');
  readonly statusFilter = signal('');

  readonly filteredCategories = computed(() => {
    let list = this.categories();
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();

    if (query) {
      list = list.filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query));
    }
    if (status) {
      const activeBool = status === 'active';
      list = list.filter((c) => c.isActive === activeBool);
    }
    return list;
  });

  readonly catForm = this.fb.group({
    name: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: ['']
  });

  private imageFile: File | null = null;

  ngOnInit(): void {
    this.catForm.get('slug')?.disable();
    this.catForm.get('name')?.valueChanges.subscribe(() => this.syncCategorySlugFromName());
    this.loadCategories();
    this.loadProducts();
  }

  syncCategorySlugFromName(): void {
    const name = this.catForm.get('name')?.value || '';
    this.catForm.patchValue({ slug: slugify(name) }, { emitEvent: false });
  }

  // Dùng chung helper với client (home) để ảnh danh mục hai bên khớp nhau (C-1).
  getCategoryImage = getCategoryImage;

  loadCategories(): void {
    this.loading.set(true);
    this.categoriesApi.getCategories().subscribe({
      next: (list) => {
        this.categories.set([...list]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Tải danh sách danh mục thất bại.');
      }
    });
  }

  loadProducts(): void {
    // Tải sản phẩm để đếm số SP mỗi danh mục (max backend cho phép = 500).
    this.adminApi.getProducts({ limit: 500 }).subscribe({
      next: (res) => {
        this.products.set([...res.items]);
      },
      error: (err) => {
        console.error('[Categories] Error loading products:', err);
        if (err?.status !== 401) {
          this.toastService.error('Không tải được số lượng sản phẩm theo danh mục.');
        }
      }
    });
  }

  getProductCountByCategory(categoryId: string): number {
    return this.products().filter(p => p.categoryId === categoryId).length;
  }

  startEdit(category: Category): void {
    this.imageFile = null;
    this.editingCategory.set(category);
    this.catForm.reset({
      name: category.name,
      slug: slugify(category.name) || category.slug,
      description: category.description ?? ''
    });
  }

  cancelEdit(): void {
    this.editingCategory.set(null);
    this.catForm.reset({ name: '', slug: '', description: '' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFile = input.files?.[0] ?? null;
  }

  submitCategory(): void {
    if (this.catForm.invalid) {
      this.catForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.catForm.getRawValue();

    const category = this.editingCategory();
    if (category) {
      this.adminApi.updateCategory(category.categoryId, {
        name: v.name ?? undefined,
        slug: v.name ? (v.slug || slugify(v.name)) : undefined,
        description: v.description ?? undefined
      }).subscribe({
        next: () => {
          this.toastService.success('Cập nhật danh mục thành công.');
          this.loadCategories();
          this.cancelEdit();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Cập nhật thất bại.');
        }
      });
    } else {
      this.adminApi.createCategory({
        name: v.name!,
        slug: v.slug || slugify(v.name!),
        description: v.description || undefined
      }, this.imageFile ?? undefined).subscribe({
        next: () => {
          this.toastService.success('Tạo danh mục thành công.');
          this.loadCategories();
          this.cancelEdit();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Tạo danh mục thất bại. Vui lòng kiểm tra lại slug hoặc kết nối.');
        }
      });
    }
  }

  toggleActive(category: Category): void {
    this.adminApi.toggleCategoryStatus(category.categoryId).subscribe({
      next: (updated) => {
        this.categories.update((list) =>
          list.map((c) => c.categoryId === updated.categoryId ? { ...c, isActive: updated.isActive } : c)
        );
        this.toastService.success(`Đã ${updated.isActive ? 'hiện' : 'ẩn'} danh mục "${category.name}".`);
      },
      error: () => {
        this.toastService.error('Thao tác thất bại.');
      }
    });
  }
}
