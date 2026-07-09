import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../core/services/toast.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

export interface CakeIngredient {
  id: string;
  category: 'Nhân bánh' | 'Kem phủ' | 'Topping' | 'Cốt bánh' | 'Kích cỡ';
  name: string;
  price12?: number; // Price for 12cm
  price16?: number; // Price for 16cm
  price20?: number; // Price for 20cm
  priceGeneral?: number; // Flat price
  isActive: boolean;
}

export const INITIAL_INGREDIENTS: CakeIngredient[] = [
  {
    id: '1',
    category: 'Nhân bánh',
    name: 'Nhân caramel muối mặn',
    price12: 35000,
    price16: 55000,
    price20: 75000,
    isActive: true
  },
  {
    id: '2',
    category: 'Kem phủ',
    name: 'Mousse phô mai béo nhẹ',
    price12: 35000,
    price16: 45000,
    price20: 65000,
    isActive: true
  },
  {
    id: '3',
    category: 'Topping',
    name: 'Hạnh nhân lát rang nhẹ',
    priceGeneral: 15000,
    isActive: true
  },
  {
    id: '4',
    category: 'Nhân bánh',
    name: 'Nhân dưa lưới tươi',
    price12: 30000,
    price16: 50000,
    isActive: false
  },
  {
    id: '5',
    category: 'Kem phủ',
    name: 'Kem sữa tươi dưa lưới',
    price12: 40000,
    price16: 60000,
    price20: 80000,
    isActive: true
  },
  {
    id: '6',
    category: 'Cốt bánh',
    name: 'Cốt bánh Vanilla mềm xốp',
    price12: 30000,
    price16: 50000,
    price20: 70000,
    isActive: true
  }
];

@Component({
  selector: 'app-admin-custom-cake-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; position: relative;">
      
      <!-- Page Title -->
      <div style="margin-bottom: 28px;">
        <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0 0 6px;">Quản lý Sản phẩm</h1>
        <p style="margin: 0; font-size: 14.5px; color: #7a6555; font-weight: 500;">
          Danh sách các nguyên liệu, cốt bánh và topping dùng cho tính năng tự thiết kế bánh.
        </p>
      </div>

      <!-- Navigation Tab Bar -->
      <div style="display: flex; gap: 24px; border-bottom: 2px solid #f3ece3; margin-bottom: 24px;">
        <button 
          routerLink="/admin/products"
          style="background: none; border: none; font-size: 16px; font-weight: 600; color: #7a6555; padding: 10px 4px; border-bottom: 3.5px solid transparent; cursor: pointer; transition: color 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
          onmouseover="this.style.color='#2b1a0f'"
          onmouseout="this.style.color='#7a6555'"
        >
          Bánh có sẵn
        </button>
        <button 
          class="tab-btn active" 
          style="background: none; border: none; font-size: 16px; font-weight: 800; color: #2b1a0f; padding: 10px 4px; border-bottom: 3.5px solid #f5c842; cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;"
        >
          Tùy chỉnh bánh
        </button>
      </div>

      <!-- Search and Toolbar Box -->
      <div class="dashboard-card" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; gap: 16px; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="position: relative; flex: 1; max-width: 440px;">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Tìm tên nguyên liệu..."
              style="width: 100%; padding: 11px 16px 11px 42px; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14.5px; outline: none; background: #ffffff;"
            />
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7a6555; display: flex; align-items: center; pointer-events: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>

          <button 
            (click)="addNewIngredient()"
            class="btn-primary" 
            style="background: #f5c842; color: #2b1a0f; font-weight: 800; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-family: 'Be Vietnam Pro', sans-serif;"
            onmouseover="this.style.background='#e5b832'"
            onmouseout="this.style.background='#f5c842'"
          >
            <span style="font-size: 18px; font-weight: bold; line-height: 1;">+</span> Thêm nguyên liệu mới
          </button>
        </div>

        <!-- Filter tag chips row -->
        <div style="border-top: 1.5px solid #fcfaf7; padding-top: 16px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <button 
              (click)="selectedCategory.set('')"
              [style.background]="selectedCategory() === '' ? '#f5c842' : '#ffffff'"
              [style.color]="selectedCategory() === '' ? '#2b1a0f' : '#7a6555'"
              [style.border-color]="selectedCategory() === '' ? '#f5c842' : '#ede8e2'"
              style="padding: 8px 18px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
            >
              Tất cả
            </button>
            @for (cat of categories; track cat) {
              <button 
                (click)="selectedCategory.set(cat)"
                [style.background]="selectedCategory() === cat ? '#f5c842' : '#ffffff'"
                [style.color]="selectedCategory() === cat ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="selectedCategory() === cat ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 18px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
              >
                {{ cat }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Main Ingredients Table -->
      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="dashboard-card" style="padding: 0; overflow: hidden; margin-bottom: 20px;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14.5px;">
              <thead>
                <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; width: 60px; text-align: center;">STT</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; width: 140px;">Phân loại</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Tên thành phần</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; width: 280px;">Giá theo kích cỡ</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: center; width: 180px;">Trạng thái hiển thị</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: right; width: 100px;">Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (ing of pagedIngredients(); track ing.id; let idx = $index) {
                  <tr 
                    (click)="editIngredient(ing.id)"
                    style="border-bottom: 1px solid #f3ece3; cursor: pointer; transition: background 0.15s;"
                    onmouseover="this.style.background='#fffcf9'"
                    onmouseout="this.style.background='transparent'"
                  >
                    <!-- STT -->
                    <td style="padding: 16px; vertical-align: middle; text-align: center; color: #7a6555; font-weight: 600;">
                      {{ (currentPage() - 1) * itemsPerPage + idx + 1 }}
                    </td>

                    <!-- Phân loại -->
                    <td style="padding: 16px; vertical-align: middle; color: #7a6555; font-weight: 600;">
                      {{ ing.category }}
                    </td>

                    <!-- Tên thành phần -->
                    <td style="padding: 16px; vertical-align: middle;">
                      <strong style="color: #2b1a0f; font-size: 15px;">{{ ing.name }}</strong>
                    </td>

                    <!-- Giá theo kích cỡ -->
                    <td style="padding: 16px; vertical-align: middle; line-height: 1.6;">
                      @if (ing.priceGeneral !== undefined) {
                        <div style="font-weight: 600; color: #7a6555;">
                          Áp dụng chung: <span style="color: #c96a2e; font-weight: 800;">{{ ing.priceGeneral | currencyVnd }}</span>
                        </div>
                      } @else {
                        <div style="display: flex; flex-direction: column; gap: 2px; font-size: 13.5px; color: #2b1a0f;">
                          @if (ing.price12 !== undefined) {
                            <div>12 cm: <span style="font-weight: 700; color: #c96a2e;">{{ ing.price12 | currencyVnd }}</span></div>
                          }
                          @if (ing.price16 !== undefined) {
                            <div>16 cm: <span style="font-weight: 700; color: #c96a2e;">{{ ing.price16 | currencyVnd }}</span></div>
                          }
                          @if (ing.price20 !== undefined) {
                            <div>20 cm: <span style="font-weight: 700; color: #c96a2e;">{{ ing.price20 | currencyVnd }}</span></div>
                          }
                        </div>
                      }
                    </td>

                    <!-- Trạng thái -->
                    <td style="padding: 16px; vertical-align: middle; text-align: center;" (click)="$event.stopPropagation()">
                      <div style="display: inline-flex; align-items: center; gap: 8px;">
                        <label class="webee-switch">
                          <input 
                            type="checkbox" 
                            [checked]="ing.isActive" 
                            (change)="toggleActiveLocal(ing)"
                          />
                          <span class="webee-slider"></span>
                        </label>
                        <span 
                          [style.color]="ing.isActive ? '#e5a900' : '#9ca3af'" 
                          style="font-size: 13.5px; font-weight: 700; min-width: 70px; text-align: left;"
                        >
                          {{ ing.isActive ? 'Đang bán' : 'Tạm ẩn' }}
                        </span>
                      </div>
                    </td>

                    <!-- Hành động -->
                    <td style="padding: 16px; vertical-align: middle; text-align: right;" (click)="$event.stopPropagation()">
                      <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button 
                          (click)="editIngredient(ing.id)"
                          style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #fffbf7; border: 1.5px solid #ede8e2; color: #7a6555; transition: all 0.15s; cursor: pointer;"
                          onmouseover="this.style.borderColor='#c96a2e'; this.style.color='#c96a2e';"
                          onmouseout="this.style.borderColor='#ede8e2'; this.style.color='#7a6555';"
                          title="Sửa thành phần"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          (click)="deleteIngredientLocal(ing.id)"
                          style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #fffbf7; border: 1.5px solid #fecaca; color: #dc2626; transition: all 0.15s; cursor: pointer;"
                          onmouseover="this.style.background='#fef2f2';"
                          onmouseout="this.style.background='#fffbf7';"
                          title="Xóa thành phần"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 48px; color: #7a6555; font-weight: 600;">
                      Không tìm thấy nguyên liệu nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination Row -->
        @if (totalPages() > 1) {
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
            <span style="font-size: 13.5px; color: #7a6555; font-weight: 600;">
              Hiển thị {{ (currentPage() - 1) * itemsPerPage + 1 }}-{{ getPageMaxIndex() }} trên tổng số {{ filteredIngredients().length }} nguyên liệu
            </span>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button 
                [disabled]="currentPage() === 1"
                (click)="goToPage(currentPage() - 1)"
                style="padding: 8px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; background: #ffffff; color: #7a6555; cursor: pointer; font-weight: 700; transition: all 0.15s; font-size: 13px;"
                [style.opacity]="currentPage() === 1 ? '0.5' : '1'"
                [style.cursor]="currentPage() === 1 ? 'not-allowed' : 'pointer'"
              >
                ◀ Trước
              </button>
              
              @for (p of getPagesArray(); track p) {
                <button 
                  (click)="goToPage(p)"
                  [style.background]="currentPage() === p ? '#f5c842' : '#ffffff'"
                  [style.color]="currentPage() === p ? '#2b1a0f' : '#7a6555'"
                  [style.border-color]="currentPage() === p ? '#f5c842' : '#ede8e2'"
                  style="width: 36px; height: 36px; border: 1.5px solid; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-size: 13px;"
                >
                  {{ p }}
                </button>
              }

              <button 
                [disabled]="currentPage() === totalPages()"
                (click)="goToPage(currentPage() + 1)"
                style="padding: 8px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; background: #ffffff; color: #7a6555; cursor: pointer; font-weight: 700; transition: all 0.15s; font-size: 13px;"
                [style.opacity]="currentPage() === totalPages() ? '0.5' : '1'"
                [style.cursor]="currentPage() === totalPages() ? 'not-allowed' : 'pointer'"
              >
                Sau ▶
              </button>
            </div>
          </div>
        }
      }
    </div>

    <!-- Panel Drawer Outlet for edit / add (placed on screen overlay) -->
    <!-- Detail page or form drawer overlays here if route is matching -->
  `,
  styles: [`
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
  `],
  styleUrl: './admin.page.scss',
})
export class AdminCustomCakeListPage implements OnInit {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly ingredients = signal<CakeIngredient[]>([]);
  readonly categories: CakeIngredient['category'][] = ['Nhân bánh', 'Kem phủ', 'Topping', 'Cốt bánh', 'Kích cỡ'];

  readonly currentPage = signal(1);
  readonly itemsPerPage = 6;

  // Filters
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');

  // Computeds
  readonly filteredIngredients = computed(() => {
    let list = this.ingredients();
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();

    if (query) {
      list = list.filter(ing => ing.name.toLowerCase().includes(query));
    }
    if (category) {
      list = list.filter(ing => ing.category === category);
    }
    return list;
  });

  readonly pagedIngredients = computed(() => {
    const list = this.filteredIngredients();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return list.slice(start, start + this.itemsPerPage);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredIngredients().length / this.itemsPerPage) || 1;
  });

  ngOnInit(): void {
    this.initIngredientsStore();
  }

  initIngredientsStore(): void {
    this.loading.set(true);
    const stored = localStorage.getItem('webee_custom_cake_ingredients');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.ingredients.set(parsed);
        this.loading.set(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    localStorage.setItem('webee_custom_cake_ingredients', JSON.stringify(INITIAL_INGREDIENTS));
    this.ingredients.set(INITIAL_INGREDIENTS);
    this.loading.set(false);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageMaxIndex(): number {
    const total = this.filteredIngredients().length;
    const max = this.currentPage() * this.itemsPerPage;
    return max > total ? total : max;
  }

  getPagesArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      arr.push(i);
    }
    return arr;
  }

  toggleActiveLocal(ing: CakeIngredient): void {
    const list = this.ingredients().map(item => {
      if (item.id === ing.id) {
        return { ...item, isActive: !item.isActive };
      }
      return item;
    });
    this.ingredients.set(list);
    localStorage.setItem('webee_custom_cake_ingredients', JSON.stringify(list));
    this.toastService.success(`Đã ${!ing.isActive ? 'hiện' : 'ẩn'} thành phần "${ing.name}".`);
  }

  deleteIngredientLocal(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa thành phần tùy chỉnh này?')) {
      const list = this.ingredients().filter(item => item.id !== id);
      this.ingredients.set(list);
      localStorage.setItem('webee_custom_cake_ingredients', JSON.stringify(list));
      this.toastService.success('Đã xóa thành phần thành công.');
      this.currentPage.set(1);
    }
  }

  editIngredient(id: string): void {
    this.router.navigate(['/admin/custom-cake', id]);
  }

  addNewIngredient(): void {
    this.router.navigate(['/admin/custom-cake', 'new']);
  }
}
