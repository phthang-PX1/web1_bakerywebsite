import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
  selector: 'app-admin-product-form-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      
      <!-- Breadcrumb & Title Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 13.5px; color: #7a6555; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <a routerLink="/admin/products" style="color: #7a6555; text-decoration: none;">Quản lý sản phẩm</a>
            <span>/</span>
            <span style="color: #2b1a0f;">{{ isEdit() ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</span>
          </div>
          <h1 style="font-family: 'Fraunces', serif; font-size: 30px; font-weight: 800; color: #2b1a0f; margin: 0 0 4px;">
            {{ isEdit() ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}
          </h1>
          <p style="margin: 0; font-size: 14px; color: #7a6555; font-weight: 500;">
            Nhập thông tin, hình ảnh và cấu hình thuộc tính cho sản phẩm mới của cửa hàng
          </p>
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <div style="display: flex; gap: 12px;">
            <a 
              routerLink="/admin/products"
              style="background: #ffffff; color: #7a6555; border: 1.5px solid #ede8e2; font-weight: 700; padding: 10px 24px; border-radius: 99px; cursor: pointer; text-decoration: none; font-size: 14.5px; display: inline-flex; align-items: center; transition: background 0.15s;"
              onmouseover="this.style.background='#fffbf7'"
              onmouseout="this.style.background='#ffffff'"
            >
              Hủy bỏ
            </a>
            <button 
              type="button"
              (click)="submit()"
              [disabled]="form.invalid || saving()"
              style="background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 10px 28px; border-radius: 99px; cursor: pointer; font-size: 14.5px; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
              onmouseover="this.style.background='#e5b832'"
              onmouseout="this.style.background='#f5c842'"
            >
              {{ saving() ? 'Đang lưu...' : (isEdit() ? 'Lưu thay đổi' : 'Thêm sản phẩm') }}
            </button>
          </div>
          @if (form.invalid) {
            <span style="font-size: 12px; color: #dc2626; font-weight: 600; display: block;">
              Yêu cầu nhập: {{ getInvalidFields().join(', ') }}
            </span>
          }
        </div>
      </div>

      @if (loadingProduct()) {
        <app-loading-spinner />
      } @else {
        <!-- Main Form Grid Layout -->
        <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; align-items: start;">
          
          <!-- LEFT SIDE: Text and Details -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Thông tin cơ bản -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Thông tin cơ bản</h3>
              
              <form [formGroup]="form" style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Tên sản phẩm *</label>
                  <input 
                    formControlName="name" 
                    (input)="onNameChange()"
                    class="form-input" 
                    placeholder="Nhập tên sản phẩm tại đây..." 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box;"
                  />
                  @if (form.get('name')?.invalid && form.get('name')?.touched) {
                    <p style="color: #dc2626; font-size: 12.5px; margin: 4px 0 0; font-weight: 600;">Vui lòng nhập tên sản phẩm.</p>
                  }
                </div>

                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Đường dẫn Slug (tự động phát sinh)</label>
                  <input 
                    formControlName="slug" 
                    class="form-input" 
                    placeholder="slug-duong-dan" 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box; background: #fffcf8; cursor: not-allowed;"
                    readonly
                  />
                </div>

                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Mô tả ngắn</label>
                  <textarea 
                    formControlName="description" 
                    class="form-textarea" 
                    rows="4" 
                    placeholder="Nhập mô tả ngắn về sản phẩm..."
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box;"
                  ></textarea>
                </div>
              </form>
            </div>

            <!-- Hình ảnh sản phẩm -->
            <div class="dashboard-card" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Hình ảnh sản phẩm</h3>
                <span style="font-size: 13.5px; color: #7a6555; font-weight: 700;">{{ getUploadedImagesCount() }}/4</span>
              </div>

              <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px;">
                <!-- Main Thumbnail Select Box -->
                <div 
                  (click)="thumbnailInput.click()"
                  style="border: 2px dashed #ede8e2; border-radius: 12px; background: #fffbf7; height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative; transition: border-color 0.15s;"
                  onmouseover="this.style.borderColor='#f5c842'"
                  onmouseout="this.style.borderColor='#ede8e2'"
                >
                  <input 
                    type="file" 
                    #thumbnailInput 
                    accept="image/*" 
                    (change)="onThumbnailFileSelected($event)" 
                    style="display: none;" 
                  />
                  
                  @if (previewThumbnail()) {
                    <img [src]="previewThumbnail()" style="width: 100%; height: 100%; object-fit: cover;" />
                    <button 
                      (click)="removeThumbnail($event)" 
                      style="position: absolute; top: 10px; right: 10px; background: rgba(43,26,15,0.7); border: none; border-radius: 50%; color: white; width: 26px; height: 26px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;"
                    >
                      ✕
                    </button>
                  } @else {
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7a6555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span style="font-weight: 700; color: #2b1a0f; font-size: 14.5px;">Thêm ảnh chính</span>
                    <span style="font-size: 12.5px; color: #7a6555; margin-top: 4px;">Kéo thả hoặc click để tải lên</span>
                  }
                </div>

                <!-- 3 Extra Gallery Slots -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  @for (slot of gallerySlots; track slot; let idx = $index) {
                    <div 
                      (click)="galleryInput.click()"
                      style="border: 2px dashed #ede8e2; border-radius: 10px; background: #fffbf7; height: 78px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative; transition: border-color 0.15s;"
                      onmouseover="this.style.borderColor='#f5c842'"
                      onmouseout="this.style.borderColor='#ede8e2'"
                    >
                      <input 
                        type="file" 
                        #galleryInput 
                        accept="image/*" 
                        (change)="onGalleryFileSelected($event, idx)" 
                        style="display: none;" 
                      />

                      @if (previewGallery()[idx]) {
                        <img [src]="previewGallery()[idx]" style="width: 100%; height: 100%; object-fit: cover;" />
                        <button 
                          (click)="removeGalleryImg($event, idx)" 
                          style="position: absolute; top: 4px; right: 4px; background: rgba(43,26,15,0.7); border: none; border-radius: 50%; color: white; width: 18px; height: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 9px;"
                        >
                          ✕
                        </button>
                      } @else {
                        <div style="text-align: center;">
                          <span style="font-size: 18px; color: #7a6555; display: block; margin-bottom: 2px;">+</span>
                          <span style="font-size: 11px; font-weight: 700; color: #7a6555;">Thêm ảnh</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Thông tin chi tiết -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Thông tin chi tiết</h3>
              
              <form [formGroup]="form" style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Hương vị</label>
                  <input 
                    formControlName="flavor" 
                    class="form-input" 
                    placeholder="Ví dụ: Thanh mát – Ngọt dịu – Béo nhẹ..." 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box;"
                  />
                </div>

                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Cấu trúc bánh</label>
                  <input 
                    formControlName="structure" 
                    class="form-input" 
                    placeholder="Ví dụ: Lớp mousse sánh mịn, cốt bông lan mềm..." 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box;"
                  />
                </div>

                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Cách bảo quản</label>
                  <input 
                    formControlName="storage" 
                    class="form-input" 
                    placeholder="Ví dụ: Bảo quản mát từ 2-4 độ C..." 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box;"
                  />
                </div>

                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Phụ kiện tặng kèm</label>
                  <input 
                    formControlName="giftAccessories" 
                    class="form-input" 
                    placeholder="Ví dụ: Dao cắt bánh, bộ dĩa, muỗng, nến nhỏ..." 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box;"
                  />
                </div>
              </form>
            </div>
          </div>

          <!-- RIGHT SIDE: Configuration, Price, Stock & Variants -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Trạng thái & Phân loại -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Trạng thái & Phân loại</h3>
              
              <form [formGroup]="form" style="display: flex; flex-direction: column; gap: 16px;">
                <!-- Active status toggle -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 14px; font-weight: 700; color: #2b1a0f;">Đang bán</span>
                  <label class="webee-switch">
                    <input type="checkbox" formControlName="isActive" />
                    <span class="webee-slider"></span>
                  </label>
                </div>

                <!-- Chuyên mục select -->
                <div>
                  <label style="font-size: 14px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 6px;">Chuyên mục *</label>
                  <select 
                    formControlName="categoryId" 
                    style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14.5px; outline: none; background: #ffffff; color: #2b1a0f;"
                  >
                    <option value="" disabled>— Chọn danh mục —</option>
                    @for (cat of categoriesList(); track cat.categoryId) {
                      <option [value]="cat.categoryId">{{ cat.name }}</option>
                    }
                  </select>
                  @if (form.get('categoryId')?.invalid && form.get('categoryId')?.touched) {
                    <p style="color: #dc2626; font-size: 12.5px; margin: 4px 0 0; font-weight: 600;">Vui lòng chọn danh mục.</p>
                  }
                </div>

                <div style="border-top: 1.5px solid #fcfaf7; padding-top: 14px; display: flex; flex-direction: column; gap: 14px;">
                  <!-- Express toggle -->
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13.5px; font-weight: 600; color: #2b1a0f;">Giao hàng hỏa tốc (30-45')</span>
                    <label class="webee-switch">
                      <input type="checkbox" formControlName="deliveryExpress" />
                      <span class="webee-slider"></span>
                    </label>
                  </div>

                  <!-- Return toggle -->
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13.5px; font-weight: 600; color: #2b1a0f;">Miễn phí đổi trả trong 24h</span>
                    <label class="webee-switch">
                      <input type="checkbox" formControlName="freeReturn24h" />
                      <span class="webee-slider"></span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <!-- Giá cơ bản -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Giá cơ bản (VNĐ)</h3>
              <form [formGroup]="form">
                <input 
                  type="number" 
                  formControlName="basePrice" 
                  class="form-input" 
                  placeholder="0"
                  style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 15px; font-weight: 800; text-align: right; color: #c96a2e;"
                />
                @if (form.get('basePrice')?.invalid && form.get('basePrice')?.touched) {
                  <p style="color: #dc2626; font-size: 12.5px; margin: 4px 0 0; font-weight: 600;">Vui lòng nhập giá cơ bản lớn hơn hoặc bằng 0.</p>
                }
              </form>
            </div>



            <!-- Biến thể -->
            <div class="dashboard-card" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Biến thể</h3>
                <button 
                  type="button" 
                  (click)="addVariant()"
                  style="background: #fffbf7; border: 1.5px solid #ede8e2; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #c96a2e; font-weight: bold; font-size: 16px;"
                >
                  +
                </button>
              </div>

              <!-- List of variants in FormArray -->
              <div style="display: flex; flex-direction: column; gap: 12px;">
                @for (variantGroup of variantsFormArray.controls; track variantGroup; let idx = $index) {
                  <div [formGroup]="getVariantFormGroup(idx)" style="background: #fffcf9; border: 1px solid #f3ece3; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px; position: relative;">
                    <button 
                      (click)="removeVariant(idx)"
                      style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 13px; font-weight: bold;"
                    >
                      Xóa
                    </button>
                    
                    <div>
                      <label style="font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; display: block; margin-bottom: 4px;">Kích cỡ</label>
                      <input 
                        formControlName="name" 
                        class="form-input" 
                        placeholder="e.g. Size 20cm" 
                        style="width: 100%; padding: 6px 10px; border: 1.5px solid #ede8e2; border-radius: 6px; font-size: 13px;"
                      />
                    </div>
                    
                    <div>
                      <label style="font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; display: block; margin-bottom: 4px;">Giá tiền</label>
                      <input 
                        type="number"
                        formControlName="price" 
                        class="form-input" 
                        placeholder="360000" 
                        style="width: 100%; padding: 6px 10px; border: 1.5px solid #ede8e2; border-radius: 6px; font-size: 13px; text-align: right;"
                      />
                    </div>
                  </div>
                } @empty {
                  <p style="font-size: 13px; color: #7a6555; margin: 0; text-align: center; padding: 12px; border: 1.5px dashed #ede8e2; border-radius: 8px;">
                    Chưa thêm biến thể nào. Bấm nút "+" để thêm biến thể kích cỡ.
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Toggle Switch Styles -->
    <style>
      .webee-switch {
        position: relative;
        display: inline-block;
        width: 42px;
        height: 22px;
      }
      .webee-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .webee-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #e5e7eb;
        transition: .3s;
        border-radius: 34px;
        border: 1px solid #d1d5db;
      }
      .webee-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      }
      input:checked + .webee-slider {
        background-color: #f5c842;
        border-color: #f5c842;
      }
      input:checked + .webee-slider:before {
        transform: translateX(20px);
      }
    </style>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminProductFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApi);

  readonly isEdit = signal(false);
  readonly loadingProduct = signal(false);
  readonly saving = signal(false);

  readonly previewThumbnail = signal<string>('');
  readonly previewGallery = signal<string[]>([]);
  readonly gallerySlots = [0, 1, 2];

  thumbnailFile: File | null = null;
  readonly galleryFiles = signal<(File | null)[]>([null, null, null]);

  originalImages: { imageId: string; imageUrl: string }[] = [];
  deletedImageIds: string[] = [];

  readonly categoriesList = signal<Category[]>([]);

  private productId = '';
  sizeGroupId = '';
  originalProductOptionGroup: any = null;

  readonly form = this.fb.group({
    name: ['', Validators.required],
    slug: [''],
    description: [''],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    isActive: [true],
    deliveryExpress: [true],
    freeReturn24h: [true],
    flavor: [''],
    structure: [''],
    storage: [''],
    giftAccessories: [''],
    stock: [0],
    variants: this.fb.array([])
  });

  get variantsFormArray(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  getVariantFormGroup(index: number): FormGroup {
    return this.variantsFormArray.at(index) as FormGroup;
  }

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.productId = id;
      this.loadProductReal(id);
    }
  }

  loadCategories(): void {
    this.adminApi.getCategories().subscribe({
      next: (list) => {
        this.categoriesList.set([...list]);
      },
      error: (err) => {
        console.error('[ProductForm] Error loading categories:', err);
        this.toastService.error('Không thể tải danh mục sản phẩm.');
      }
    });
  }

  private loadProductReal(id: string): void {
    this.loadingProduct.set(true);
    this.adminApi.getProduct(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          name: p.name,
          slug: p.slug,
          description: p.description ?? '',
          basePrice: Number(p.basePrice),
          categoryId: p.categoryId ?? '',
          isActive: p.isActive,
          // Handle backend default behavior gracefully if properties aren't in model
          deliveryExpress: true,
          freeReturn24h: true,
          flavor: '',
          structure: '',
          storage: '',
          giftAccessories: '',
          stock: null
        });

        this.previewThumbnail.set(p.thumbnailUrl || '');
        
        // Clear variants FormArray first
        this.variantsFormArray.clear();
        
        // Find the first option group representing size variants
        const sizeGroup = p.optionGroups && p.optionGroups.length > 0 ? p.optionGroups[0] : null;
        if (sizeGroup) {
          this.sizeGroupId = sizeGroup.groupId;
          this.originalProductOptionGroup = sizeGroup;
          if (sizeGroup.items) {
            sizeGroup.items.forEach(item => {
              this.variantsFormArray.push(this.fb.group({
                itemId: [item.itemId],
                name: [item.name, Validators.required],
                price: [Number(item.extraPrice), [Validators.required, Validators.min(0)]],
                stock: [10] // dummy stock
              }));
            });
          }
        }

        if (p.images) {
          this.originalImages = p.images.map(img => ({
            imageId: img.imageId,
            imageUrl: img.imageUrl
          }));
          
          const galleryUrls = p.images.map(img => img.imageUrl);
          // Pre-fill gallery slots
          const filledGallery = [
            galleryUrls[0] || '',
            galleryUrls[1] || '',
            galleryUrls[2] || ''
          ];
          this.previewGallery.set(filledGallery);
        }

        this.loadingProduct.set(false);
      },
      error: (err) => {
        console.error('[ProductForm] Error loading product:', err);
        this.loadingProduct.set(false);
        this.toastService.error('Không tìm thấy sản phẩm.');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  onNameChange(): void {
    const name = this.form.get('name')?.value || '';
    const slug = slugify(name);
    this.form.patchValue({ slug });
  }

  addVariant(): void {
    this.variantsFormArray.push(this.fb.group({
      itemId: [''],
      name: ['', Validators.required],
      price: [this.form.get('basePrice')?.value || 0, [Validators.required, Validators.min(0)]],
      stock: [10, [Validators.required, Validators.min(0)]]
    }));
  }

  removeVariant(index: number): void {
    this.variantsFormArray.removeAt(index);
  }

  onThumbnailFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.thumbnailFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewThumbnail.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeThumbnail(event: Event): void {
    event.stopPropagation();
    this.thumbnailFile = null;
    this.previewThumbnail.set('');
  }

  onGalleryFileSelected(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const files = [...this.galleryFiles()];
      files[index] = file;
      this.galleryFiles.set(files);
      
      const reader = new FileReader();
      reader.onload = () => {
        const arr = [...this.previewGallery()];
        arr[index] = reader.result as string;
        this.previewGallery.set(arr);
      };
      reader.readAsDataURL(file);
    }
  }

  removeGalleryImg(event: Event, index: number): void {
    event.stopPropagation();
    
    // Check if this slot had an original image
    const originalImgUrl = this.previewGallery()[index];
    const found = this.originalImages.find(img => img.imageUrl === originalImgUrl);
    if (found) {
      this.deletedImageIds.push(found.imageId);
    }

    const arr = [...this.previewGallery()];
    arr[index] = '';
    this.previewGallery.set(arr);

    const files = [...this.galleryFiles()];
    files[index] = null;
    this.galleryFiles.set(files);
  }

  getUploadedImagesCount(): number {
    let count = 0;
    if (this.previewThumbnail()) count++;
    this.previewGallery().forEach(img => {
      if (img) count++;
    });
    return count;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Vui lòng kiểm tra lại thông tin form.');
      return;
    }

    const val = this.form.getRawValue();
    this.saving.set(true);

    const payload = {
      categoryId: val.categoryId!,
      name: val.name!,
      slug: val.slug || slugify(val.name!),
      description: val.description || undefined,
      basePrice: Number(val.basePrice),
      isCustomizable: false
    };

    const saveVariants = (productId: string, callback: () => void) => {
      const variants = this.variantsFormArray.value;
      const proceedWithItems = (groupId: string) => {
        const itemObservables: Observable<unknown>[] = [];
        const currentItemIds = new Set<string>();

        variants.forEach((v: any, index: number) => {
          const itemBody = {
            name: v.name,
            extraPrice: Number(v.price),
            sortOrder: index + 1
          };

          if (v.itemId) {
            currentItemIds.add(v.itemId);
            itemObservables.push(this.adminApi.updateOptionItem(v.itemId, itemBody));
          } else {
            itemObservables.push(this.adminApi.createOptionItem(groupId, itemBody));
          }
        });

        // Handle deleted items (pre-existing items that are not in the form anymore)
        if (this.sizeGroupId) {
          const originalGroup = this.originalProductOptionGroup;
          if (originalGroup && originalGroup.items) {
            originalGroup.items.forEach((item: any) => {
              if (!currentItemIds.has(item.itemId) && item.isActive !== false) {
                // Soft delete by setting isActive to false (toggling active)
                itemObservables.push(this.adminApi.toggleOptionItemStatus(item.itemId));
              }
            });
          }
        }

        if (itemObservables.length > 0) {
          forkJoin(itemObservables).subscribe({
            next: () => callback(),
            error: (err) => {
              console.error('[ProductForm] Error saving variants:', err);
              // Sản phẩm chính đã lưu; báo rõ biến thể (size) lưu chưa trọn vẹn thay
              // vì im lặng, để admin biết cần kiểm tra lại phần kích cỡ.
              this.toastService.error('Sản phẩm đã lưu nhưng một số biến thể (kích cỡ) chưa lưu được. Vui lòng kiểm tra lại.');
              callback();
            }
          });
        } else {
          callback();
        }
      };

      if (this.sizeGroupId) {
        proceedWithItems(this.sizeGroupId);
      } else if (variants.length > 0) {
        this.adminApi.createOptionGroup(productId, {
          name: 'Kích cỡ',
          isRequired: true,
          isMultiple: false,
          sortOrder: 1
        }).subscribe({
          next: (group) => {
            this.sizeGroupId = group.groupId;
            proceedWithItems(group.groupId);
          },
          error: (err) => {
            console.error('[ProductForm] Error creating option group:', err);
            this.toastService.error('Sản phẩm đã lưu nhưng nhóm kích cỡ chưa tạo được. Vui lòng thử lại phần biến thể.');
            callback();
          }
        });
      } else {
        callback();
      }
    };

    if (this.isEdit()) {
      // First, handle deleted images
      const deleteObservables = this.deletedImageIds.map(imgId => 
        this.adminApi.deleteProductImage(this.productId, imgId)
      );

      // We can chain these operations
      const performUpdate = (newThumbnailUrl?: string) => {
        const updatePayload = {
          ...payload,
          isActive: val.isActive ?? undefined,
          ...(newThumbnailUrl && { thumbnailUrl: newThumbnailUrl })
        };

        this.adminApi.updateProduct(this.productId, updatePayload).subscribe({
          next: () => {
            saveVariants(this.productId, () => {
              // Upload new gallery files if any
              const activeGalleryFiles = this.galleryFiles().filter((file): file is File => file !== null);
              if (activeGalleryFiles.length > 0) {
                this.adminApi.uploadProductImages(this.productId, activeGalleryFiles).subscribe({
                  next: () => {
                    this.toastService.success('Đã lưu thay đổi cho sản phẩm thành công.');
                    this.saving.set(false);
                    this.router.navigate(['/admin/products']);
                  },
                  error: (err) => {
                    console.error('[ProductForm] Gallery upload error:', err);
                    this.toastService.success('Đã lưu sản phẩm nhưng tải ảnh phụ thất bại.');
                    this.saving.set(false);
                    this.router.navigate(['/admin/products']);
                  }
                });
              } else {
                this.toastService.success('Đã lưu các thay đổi cho sản phẩm.');
                this.saving.set(false);
                this.router.navigate(['/admin/products']);
              }
            });
          },
          error: (err) => {
            console.error('[ProductForm] Update error:', err);
            const msg = err?.error?.message || 'Không thể cập nhật sản phẩm.';
            this.toastService.error(msg);
            this.saving.set(false);
          }
        });
      };

      // Process deletions
      if (deleteObservables.length > 0) {
        let completedDeletes = 0;
        deleteObservables.forEach(obs => {
          obs.subscribe({
            next: () => {
              completedDeletes++;
              if (completedDeletes === deleteObservables.length) {
                this.handleThumbnailAndSubmitEdit(performUpdate);
              }
            },
            error: (err) => {
              console.error('[ProductForm] Image delete error:', err);
              completedDeletes++;
              if (completedDeletes === deleteObservables.length) {
                this.handleThumbnailAndSubmitEdit(performUpdate);
              }
            }
          });
        });
      } else {
        this.handleThumbnailAndSubmitEdit(performUpdate);
      }

    } else {
      // Create mode
      const mainThumbnail = this.thumbnailFile || undefined;
      this.adminApi.createProduct(payload, mainThumbnail).subscribe({
        next: (created) => {
          saveVariants(created.productId, () => {
            // If there are gallery images, upload them now
            const activeGalleryFiles = this.galleryFiles().filter((file): file is File => file !== null);
            if (activeGalleryFiles.length > 0) {
              this.adminApi.uploadProductImages(created.productId, activeGalleryFiles).subscribe({
                next: () => {
                  this.toastService.success('Đã thêm sản phẩm mới thành công.');
                  this.saving.set(false);
                  this.router.navigate(['/admin/products']);
                },
                error: (err) => {
                  console.error('[ProductForm] Gallery upload error:', err);
                  this.toastService.success('Đã tạo sản phẩm thành công nhưng tải ảnh phụ thất bại.');
                  this.saving.set(false);
                  this.router.navigate(['/admin/products']);
                }
              });
            } else {
              this.toastService.success('Đã thêm sản phẩm mới thành công.');
              this.saving.set(false);
              this.router.navigate(['/admin/products']);
            }
          });
        },
        error: (err) => {
          console.error('[ProductForm] Creation error:', err);
          const msg = err?.error?.message || 'Đã xảy ra lỗi khi tạo sản phẩm.';
          this.toastService.error(msg);
          this.saving.set(false);
        }
      });
    }
  }

  private handleThumbnailAndSubmitEdit(callback: (newThumbnailUrl?: string) => void) {
    if (this.thumbnailFile) {
      this.adminApi.uploadProductImages(this.productId, [this.thumbnailFile]).subscribe({
        next: (uploadedImages) => {
          const newThumbnail = uploadedImages.length > 0 ? uploadedImages[uploadedImages.length - 1]?.imageUrl : undefined;
          callback(newThumbnail);
        },
        error: (err) => {
          console.error('[ProductForm] Thumbnail upload error in edit:', err);
          // Try to continue without updating thumbnail
          callback();
        }
      });
    } else {
      callback();
    }
  }

  getInvalidFields(): string[] {
    const invalid: string[] = [];
    const controls = this.form.controls;
    (Object.keys(controls) as Array<keyof typeof controls>).forEach(key => {
      const control = controls[key];
      if (control && control.invalid) {
        let displayName = key as string;
        if (key === 'name') displayName = 'Tên sản phẩm';
        if (key === 'basePrice') displayName = 'Giá cơ bản';
        if (key === 'categoryId') displayName = 'Chuyên mục';
        invalid.push(displayName);
      }
    });
    return invalid;
  }
}
