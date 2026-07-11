import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../core/services/toast.service';
import { CakeIngredient, INITIAL_INGREDIENTS } from './custom-cake-list.page';

@Component({
  selector: 'app-admin-custom-cake-detail-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-page-container" style="position: relative; min-height: 100vh; overflow: hidden; font-family: 'Be Vietnam Pro', sans-serif;">
      
      <!-- BACKGROUND BEHIND DRAWER (List Table disabled) -->
      <div style="opacity: 0.35; pointer-events: none; padding: 24px; max-width: 1200px; margin: 0 auto;">
        <!-- Header -->
        <div style="margin-bottom: 28px;">
          <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0 0 6px;">Quản lý Sản phẩm</h1>
          <p style="margin: 0; font-size: 14.5px; color: #7a6555; font-weight: 500;">
            Danh sách các nguyên liệu, cốt bánh và topping dùng cho tính năng tự thiết kế bánh.
          </p>
        </div>

        <!-- Tab bar -->
        <div style="display: flex; gap: 24px; border-bottom: 2px solid #f3ece3; margin-bottom: 24px;">
          <button style="background: none; border: none; font-size: 16px; font-weight: 600; color: #7a6555; padding: 10px 4px; border-bottom: 3.5px solid transparent; font-family: 'Be Vietnam Pro', sans-serif;">Bánh có sẵn</button>
          <button style="background: none; border: none; font-size: 16px; font-weight: 800; color: #2b1a0f; padding: 10px 4px; border-bottom: 3.5px solid #f5c842; font-family: 'Be Vietnam Pro', sans-serif;">Tùy chỉnh bánh</button>
        </div>

        <!-- Filter box -->
        <div class="dashboard-card" style="padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; gap: 16px; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="position: relative; flex: 1; max-width: 440px;">
              <input type="text" placeholder="Tìm tên nguyên liệu..." style="width: 100%; padding: 11px 16px 11px 42px; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14.5px;" />
            </div>
            <button class="btn-primary" style="background: #f5c842; color: #2b1a0f; font-weight: 800; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px;">+ Thêm nguyên liệu mới</button>
          </div>
        </div>

        <!-- Table view placeholder -->
        <div class="dashboard-card" style="padding: 30px; height: 350px;">
          <div style="text-align: center; color: #7a6555; padding-top: 100px;">Đang chỉnh sửa nguyên liệu...</div>
        </div>
      </div>

      <!-- SEMI-TRANSPARENT BACKDROP OVERLAY FOR CLOSING -->
      <div 
        (click)="closeDrawer()"
        style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(43, 26, 15, 0.15); z-index: 990; cursor: pointer;"
      ></div>

      <!-- RIGHT SLIDE OUT DRAWER PANEL (The main focus based on TuyChinhBanh_ChiTiet.png) -->
      <div 
        class="drawer-panel"
        style="position: fixed; top: 0; right: 0; bottom: 0; width: 440px; background: #ffffff; box-shadow: -4px 0 25px rgba(43, 26, 15, 0.12); z-index: 1000; display: flex; flex-direction: column; transition: transform 0.25s ease-out; box-sizing: border-box; border-left: 1px solid #ede8e2;"
      >
        <!-- Drawer Header -->
        <div style="padding: 24px 28px; border-bottom: 1.5px solid #f3ece3; display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
          <h2 style="margin: 0; font-family: 'Fraunces', serif; font-size: 20px; font-weight: 800; color: #2b1a0f;">
            {{ isNew() ? 'Thêm nguyên liệu mới' : 'Chỉnh sửa nguyên liệu' }}
          </h2>
          <button 
            (click)="closeDrawer()" 
            style="background: none; border: none; font-size: 22px; color: #7a6555; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;"
            onmouseover="this.style.background='#fff5ee'; this.style.color='#2b1a0f';"
            onmouseout="this.style.background='none'; this.style.color='#7a6555';"
          >
            ✕
          </button>
        </div>

        <!-- Drawer Body (Form) -->
        <div style="flex: 1; overflow-y: auto; padding: 28px; display: flex; flex-direction: column; gap: 20px; background: #ffffff;">
          
          <!-- Name Input -->
          <div>
            <label style="font-size: 14.5px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 8px;">Tên thành phần *</label>
            <input 
              type="text" 
              [(ngModel)]="name" 
              placeholder="Nhập tên thành phần..."
              style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.15s;"
              onfocus="this.style.borderColor='#f5c842'"
              onblur="this.style.borderColor='#ede8e2'"
            />
          </div>

          <!-- Category Select -->
          <div>
            <label style="font-size: 14.5px; font-weight: 700; color: #2b1a0f; display: block; margin-bottom: 8px;">Phân loại *</label>
            <select 
              [(ngModel)]="category" 
              style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 14.5px; outline: none; background: #ffffff; color: #2b1a0f;"
            >
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <!-- Cấu hình giá theo kích cỡ -->
          <div style="background: #fffcf9; border: 1.5px solid #ede8e2; border-radius: 12px; padding: 20px;">
            <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 800; color: #2b1a0f; letter-spacing: 0.03em;">Cấu hình giá theo kích cỡ</h4>
            
            @if (category() === 'Topping') {
              <!-- Topping flat price input -->
              <div>
                <label style="font-size: 13px; font-weight: 700; color: #7a6555; display: block; margin-bottom: 6px;">Áp dụng chung (VNĐ)</label>
                <input 
                  type="number" 
                  [(ngModel)]="priceGeneral" 
                  placeholder="0"
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14.5px; outline: none; text-align: right; font-weight: 700;"
                />
              </div>
            } @else {
              <!-- Pricing per sizes -->
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <span style="font-size: 13.5px; font-weight: 600; color: #2b1a0f; width: 60px;">12 cm</span>
                  <input 
                    type="number" 
                    [(ngModel)]="price12" 
                    placeholder="35000"
                    style="flex: 1; padding: 9px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; outline: none; text-align: right;"
                  />
                  <span style="font-size: 13.5px; font-weight: 600; color: #7a6555;">đ</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <span style="font-size: 13.5px; font-weight: 600; color: #2b1a0f; width: 60px;">16 cm</span>
                  <input 
                    type="number" 
                    [(ngModel)]="price16" 
                    placeholder="55000"
                    style="flex: 1; padding: 9px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; outline: none; text-align: right;"
                  />
                  <span style="font-size: 13.5px; font-weight: 600; color: #7a6555;">đ</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <span style="font-size: 13.5px; font-weight: 600; color: #2b1a0f; width: 60px;">20 cm</span>
                  <input 
                    type="number" 
                    [(ngModel)]="price20" 
                    placeholder="75000"
                    style="flex: 1; padding: 9px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; outline: none; text-align: right;"
                  />
                  <span style="font-size: 13.5px; font-weight: 600; color: #7a6555;">đ</span>
                </div>
              </div>
            }
          </div>

          <!-- Trạng thái hiển thị toggle block -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-top: 1.5px solid #f3ece3; padding-top: 18px; margin-top: 8px;">
            <div>
              <div style="font-size: 14.5px; font-weight: 700; color: #2b1a0f; margin-bottom: 4px;">Trạng thái hiển thị</div>
              <p style="margin: 0; font-size: 12px; color: #7a6555; line-height: 1.4; max-width: 280px;">
                Hiển thị công khai trên công cụ tự thiết kế bánh
              </p>
            </div>
            <label class="webee-switch">
              <input type="checkbox" [(ngModel)]="isActive" />
              <span class="webee-slider"></span>
            </label>
          </div>

        </div>

        <!-- Drawer Footer (Buttons) -->
        <div style="padding: 20px 28px; border-top: 1.5px solid #f3ece3; display: flex; gap: 14px; background: #ffffff;">
          <button 
            (click)="closeDrawer()" 
            style="flex: 1; background: #ffffff; color: #7a6555; border: 1.5px solid #ede8e2; font-weight: 700; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 14.5px; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
            onmouseover="this.style.background='#fffbf7'"
            onmouseout="this.style.background='#ffffff'"
          >
            Hủy
          </button>
          <button 
            (click)="saveIngredient()" 
            [disabled]="!name().trim()"
            style="flex: 1; background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 14.5px; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
            [style.opacity]="!name().trim() ? '0.6' : '1'"
            [style.cursor]="!name().trim() ? 'not-allowed' : 'pointer'"
            onmouseover="this.style.background='#e5b832'"
            onmouseout="this.style.background='#f5c842'"
          >
            Lưu thay đổi
          </button>
        </div>

      </div>

    </div>

    <!-- Switch Toggle Custom Styles -->
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
export class AdminCustomCakeDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly isNew = signal(false);
  readonly loading = signal(false);

  // Form states using signals
  readonly name = signal('');
  readonly category = signal<CakeIngredient['category']>('Nhân bánh');
  readonly price12 = signal<number | undefined>(undefined);
  readonly price16 = signal<number | undefined>(undefined);
  readonly price20 = signal<number | undefined>(undefined);
  readonly priceGeneral = signal<number | undefined>(undefined);
  readonly isActive = signal(true);

  readonly categories: CakeIngredient['category'][] = ['Nhân bánh', 'Kem phủ', 'Topping', 'Cốt bánh', 'Kích cỡ'];

  private ingredientId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      if (id === 'new') {
        this.isNew.set(true);
        this.resetForm();
      } else {
        this.ingredientId = id;
        this.loadIngredient(id);
      }
    }
  }

  resetForm(): void {
    this.name.set('');
    this.category.set('Nhân bánh');
    this.price12.set(undefined);
    this.price16.set(undefined);
    this.price20.set(undefined);
    this.priceGeneral.set(undefined);
    this.isActive.set(true);
  }

  loadIngredient(id: string): void {
    this.loading.set(true);
    const stored = localStorage.getItem('webee_custom_cake_ingredients');
    let list: CakeIngredient[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        list = [];
      }
    }

    const ing = list.find(item => item.id === id);
    if (ing) {
      this.name.set(ing.name);
      this.category.set(ing.category);
      this.price12.set(ing.price12);
      this.price16.set(ing.price16);
      this.price20.set(ing.price20);
      this.priceGeneral.set(ing.priceGeneral);
      this.isActive.set(ing.isActive);
    } else {
      this.toastService.error('Không tìm thấy nguyên liệu.');
      this.router.navigate(['/admin/custom-cake']);
    }
    this.loading.set(false);
  }

  saveIngredient(): void {
    const n = this.name().trim();
    if (!n) {
      this.toastService.error('Vui lòng nhập tên thành phần.');
      return;
    }

    const stored = localStorage.getItem('webee_custom_cake_ingredients');
    let list: CakeIngredient[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        list = [];
      }
    }

    const ingredientData: CakeIngredient = {
      id: this.isNew() ? `ing-${Date.now()}` : this.ingredientId,
      category: this.category(),
      name: n,
      isActive: this.isActive()
    };

    if (this.category() === 'Topping') {
      ingredientData.priceGeneral = this.priceGeneral() !== undefined ? Number(this.priceGeneral()) : 0;
    } else {
      if (this.price12() !== undefined) ingredientData.price12 = Number(this.price12());
      if (this.price16() !== undefined) ingredientData.price16 = Number(this.price16());
      if (this.price20() !== undefined) ingredientData.price20 = Number(this.price20());
    }

    if (this.isNew()) {
      list.push(ingredientData);
      this.toastService.success('Đã thêm nguyên liệu mới.');
    } else {
      list = list.map(item => item.id === this.ingredientId ? ingredientData : item);
      this.toastService.success('Đã lưu thay đổi.');
    }

    localStorage.setItem('webee_custom_cake_ingredients', JSON.stringify(list));
    this.closeDrawer();
  }

  closeDrawer(): void {
    this.router.navigate(['/admin/custom-cake']);
  }
}
