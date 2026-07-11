import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { CategoriesApi } from '../../../core/api/categories.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Product } from '../../../core/models/product.model';
import type { Category } from '../../../core/models/category.model';
import type { PaginatedResponse } from '../../../core/models/pagination.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

export interface ExtendedProduct extends Product {
  description: string | null;
  soldCount?: number;
  stock?: number;
  deliveryExpress?: boolean;
  freeReturn24h?: boolean;
  flavor?: string;
  structure?: string;
  storage?: string;
  giftAccessories?: string;
  variants?: { name: string; price: number; stock: number }[];
}

const MOCK_PRODUCTS: ExtendedProduct[] = [
  {
    productId: '1',
    categoryId: 'gato',
    name: 'Bánh kem sữa tươi',
    slug: 'banh-kem-sua-tuoi',
    description: 'Bánh gato truyền thống nhỏ xinh cho bữa tiệc gia đình ấm cúng.',
    basePrice: 120000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.8,
    reviewCount: 42,
    soldCount: 142,
    stock: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'gato', name: 'Bánh Gato', slug: 'banh-gato', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '2',
    categoryId: 'entremet',
    name: 'Midnight Salt',
    slug: 'midnight-salt',
    description: 'Sự kết hợp hoàn hảo giữa socola caramel muối mặn đặc biệt.',
    basePrice: 320000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 5.0,
    reviewCount: 12,
    soldCount: 32,
    stock: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'entremet', name: 'Bánh Entremet', slug: 'banh-entremet', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '3',
    categoryId: 'mousse',
    name: 'Strawberry Dream',
    slug: 'strawberry-dream',
    description: 'Lớp kem mousse dâu tây ngọt mát dịu dàng cùng nhân dâu tây tươi.',
    basePrice: 429000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.9,
    reviewCount: 65,
    soldCount: 89,
    stock: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'mousse', name: 'Bánh Mousse', slug: 'banh-mousse', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '4',
    categoryId: 'baked',
    name: 'Bánh Chumi Sô-cô-la',
    slug: 'banh-chumi-so-co-la',
    description: 'Sự kết hợp ngọt ngào giữa cốt bánh nướng thơm lừng và sốt sô cô la.',
    basePrice: 97000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.5,
    reviewCount: 33,
    soldCount: 67,
    stock: 0,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'baked', name: 'Bánh nướng', slug: 'banh-nuong', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '5',
    categoryId: 'tiramisu',
    name: 'Tiramisu Classic',
    slug: 'tiramisu-classic',
    description: 'Bông lan vani xen lẫn kem mascarpone phảng phất hương rượu và cà phê.',
    basePrice: 222000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.7,
    reviewCount: 98,
    soldCount: 211,
    stock: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'tiramisu', name: 'Bánh Tiramisu', slug: 'banh-tiramisu', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '6',
    categoryId: 'gato',
    name: 'Bánh bắp phô mai',
    slug: 'banh-bap-pho-mai',
    description: 'Vị ngọt thanh tự nhiên của bắp kết hợp hoàn hảo cùng kem phô mai béo ngậy.',
    basePrice: 140000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.6,
    reviewCount: 47,
    soldCount: 95,
    stock: 18,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'gato', name: 'Bánh Gato', slug: 'banh-gato', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '7',
    categoryId: 'entremet',
    name: 'Berry Blush',
    slug: 'berry-blush',
    description: 'Dâu sữa chua tươi mát ngọt ngào kết hợp mousse mịn màng.',
    basePrice: 300000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.8,
    reviewCount: 29,
    soldCount: 41,
    stock: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'entremet', name: 'Bánh Entremet', slug: 'banh-entremet', description: null, imageUrl: null, isActive: true, createdAt: '' }
  },
  {
    productId: '8',
    categoryId: 'minicakes',
    name: 'Panacotta Táo xanh',
    slug: 'panacotta-tao-xanh',
    description: 'Món tráng miệng Mini Cakes ngọt dịu kết hợp vị chua mát thanh khiết của táo xanh.',
    basePrice: 19000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80',
    isCustomizable: false,
    hasRequiredOptions: false,
    avgRating: 4.4,
    reviewCount: 156,
    soldCount: 312,
    stock: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { categoryId: 'minicakes', name: 'Mini Cakes', slug: 'mini-cakes', description: null, imageUrl: null, isActive: true, createdAt: '' }
  }
];

@Component({
  selector: 'app-admin-products-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif;">
      
      <!-- Tiêu đề lớn -->
      <div style="margin-bottom: 28px;">
        <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0 0 6px;">Quản lý Sản phẩm</h1>
        <p style="margin: 0; font-size: 14.5px; color: #7a6555; font-weight: 500;">
          Danh sách sản phẩm của cửa hàng. Bạn có thể nhanh chóng cập nhật giá, tồn kho và trạng thái hiển thị.
        </p>
      </div>

      <!-- Tab bar điều hướng -->
      <div style="display: flex; gap: 24px; border-bottom: 2px solid #f3ece3; margin-bottom: 24px;">
        <button 
          class="tab-btn active" 
          style="background: none; border: none; font-size: 16px; font-weight: 800; color: #2b1a0f; padding: 10px 4px; border-bottom: 3.5px solid #f5c842; cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;"
        >
          Bánh có sẵn ({{ filteredProducts().length }})
        </button>
        <button 
          routerLink="/admin/custom-cake"
          style="background: none; border: none; font-size: 16px; font-weight: 600; color: #7a6555; padding: 10px 4px; border-bottom: 3.5px solid transparent; cursor: pointer; transition: color 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
          onmouseover="this.style.color='#2b1a0f'"
          onmouseout="this.style.color='#7a6555'"
        >
          Tùy chỉnh bánh
        </button>
      </div>

      <!-- Bộ lọc và Tìm kiếm -->
      <div class="dashboard-card" style="padding: 24px; margin-bottom: 24px;">
        <!-- Search & Add Row -->
        <div style="display: flex; gap: 16px; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="position: relative; flex: 1; max-width: 440px;">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Tìm tên sản phẩm..."
              style="width: 100%; padding: 11px 16px 11px 42px; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14.5px; outline: none; background: #ffffff; font-family: 'Be Vietnam Pro', sans-serif;"
            />
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7a6555; display: flex; align-items: center; pointer-events: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>

          <a 
            routerLink="/admin/products/new"
            class="btn-primary" 
            style="background: #f5c842; color: #2b1a0f; font-weight: 700; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-size: 14px;"
            onmouseover="this.style.background='#e5b832'"
            onmouseout="this.style.background='#f5c842'"
          >
            <span style="font-size: 18px; font-weight: bold; line-height: 1;">+</span> Thêm sản phẩm
          </a>
        </div>

        <!-- Advanced Filters -->
        <div style="border-top: 1.5px solid #fcfaf7; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: 800; font-size: 14px; color: #2b1a0f; text-transform: uppercase; letter-spacing: 0.05em;">Bộ lọc nâng cao</span>
            <button 
              (click)="resetFilters()" 
              style="background: none; border: 1.5px solid #7a6555; color: #7a6555; font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
              onmouseover="this.style.background='#fffcf9'; this.style.borderColor='#c96a2e'; this.style.color='#c96a2e';"
              onmouseout="this.style.background='none'; this.style.borderColor='#7a6555'; this.style.color='#7a6555';"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Đặt lại bộ lọc
            </button>
          </div>

          <!-- Category Chips -->
          <div style="margin-bottom: 16px;">
            <label style="font-size: 12.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; display: block; margin-bottom: 8px;">DANH MỤC</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button 
                (click)="selectedCategory.set('')"
                [style.background]="selectedCategory() === '' ? '#f5c842' : '#ffffff'"
                [style.color]="selectedCategory() === '' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="selectedCategory() === '' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
              >
                Tất cả
              </button>
              @for (cat of categoriesList(); track cat.categoryId) {
                <button 
                  (click)="selectedCategory.set(cat.categoryId)"
                  [style.background]="selectedCategory() === cat.categoryId ? '#f5c842' : '#ffffff'"
                  [style.color]="selectedCategory() === cat.categoryId ? '#2b1a0f' : '#7a6555'"
                  [style.border-color]="selectedCategory() === cat.categoryId ? '#f5c842' : '#ede8e2'"
                  style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
                >
                  {{ cat.name }} ({{ getCategoryCount(cat.categoryId) }})
                </button>
              }
            </div>
          </div>

          <!-- Status Chips -->
          <div>
            <label style="font-size: 12.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; display: block; margin-bottom: 8px;">TRẠNG THÁI</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button 
                (click)="selectedStatus.set('')"
                [style.background]="selectedStatus() === '' ? '#f5c842' : '#ffffff'"
                [style.color]="selectedStatus() === '' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="selectedStatus() === '' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
              >
                Tất cả
              </button>
              <button 
                (click)="selectedStatus.set('active')"
                [style.background]="selectedStatus() === 'active' ? '#f5c842' : '#ffffff'"
                [style.color]="selectedStatus() === 'active' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="selectedStatus() === 'active' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
              >
                Đang bán ({{ getStatusCount(true) }})
              </button>
              <button 
                (click)="selectedStatus.set('inactive')"
                [style.background]="selectedStatus() === 'inactive' ? '#f5c842' : '#ffffff'"
                [style.color]="selectedStatus() === 'inactive' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="selectedStatus() === 'inactive' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;"
              >
                Tạm ẩn ({{ getStatusCount(false) }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Products List Table -->
      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="dashboard-card" style="padding: 0; overflow: hidden; margin-bottom: 20px;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14.5px;">
              <thead>
                <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; width: 80px;">Sản phẩm</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;"></th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Danh mục</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: right;">Giá bán</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: center;">Đã bán</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: center; width: 160px;">Trạng thái hiển thị</th>
                  <th style="padding: 16px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: right; width: 120px;">Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (prod of pagedProducts(); track prod.productId; let idx = $index) {
                  <tr 
                    (click)="goToDetail(prod.productId)"
                    style="border-bottom: 1px solid #f3ece3; cursor: pointer; transition: background 0.15s;"
                    onmouseover="this.style.background='#fffcf9'"
                    onmouseout="this.style.background='transparent'"
                  >
                    <!-- Thumbnail -->
                    <td style="padding: 16px; vertical-align: middle;">
                      <div style="width: 56px; height: 56px; border-radius: 8px; overflow: hidden; border: 1.5px solid #ede8e2; background: #fff;">
                        <img 
                          [src]="prod.thumbnailUrl ?? '/assets/images/product-placeholder.svg'" 
                          [alt]="prod.name"
                          style="width: 100%; height: 100%; object-fit: cover;"
                          appImgFallback
                        />
                      </div>
                    </td>
                    
                    <!-- Name & Subtitle -->
                    <td style="padding: 16px; vertical-align: middle;">
                      <div style="font-weight: 800; color: #2b1a0f; font-size: 15px;">{{ prod.name }}</div>
                      <div style="font-size: 12px; color: #7a6555; margin-top: 4px; max-width: 320px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                        {{ prod.description || 'Chưa có mô tả' }}
                      </div>
                    </td>

                    <!-- Category -->
                    <td style="padding: 16px; vertical-align: middle; color: #2b1a0f; font-weight: 600;">
                      {{ prod.category?.name ?? 'Bánh Gato' }}
                    </td>

                    <!-- Price -->
                    <td style="padding: 16px; vertical-align: middle; text-align: right; font-weight: 800; color: #2b1a0f; font-size: 15px;">
                      {{ prod.basePrice | currencyVnd }}
                    </td>

                    <!-- Sold -->
                    <td style="padding: 16px; vertical-align: middle; text-align: center; color: #7a6555; font-weight: 600;">
                      {{ prod.soldCount ?? 0 }}
                    </td>


                    <!-- Toggle Status -->
                    <td style="padding: 16px; vertical-align: middle; text-align: center;" (click)="$event.stopPropagation()">
                      <div style="display: inline-flex; align-items: center; gap: 8px;">
                        <label class="webee-switch">
                          <input 
                            type="checkbox" 
                            [checked]="prod.isActive" 
                            (change)="toggleActiveLocal(prod)"
                          />
                          <span class="webee-slider"></span>
                        </label>
                        <span 
                          [style.color]="prod.isActive ? '#e5a900' : '#9ca3af'" 
                          style="font-size: 13.5px; font-weight: 700; min-width: 70px; text-align: left;"
                        >
                          {{ prod.isActive ? 'Đang bán' : 'Tạm ẩn' }}
                        </span>
                      </div>
                    </td>

                    <!-- Actions -->
                    <td style="padding: 16px; vertical-align: middle; text-align: right;" (click)="$event.stopPropagation()">
                      <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <a 
                          [routerLink]="['/admin/products', prod.productId, 'edit']"
                          style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #fffbf7; border: 1.5px solid #ede8e2; color: #7a6555; transition: all 0.15s; text-decoration: none;"
                          onmouseover="this.style.borderColor='#c96a2e'; this.style.color='#c96a2e';"
                          onmouseout="this.style.borderColor='#ede8e2'; this.style.color='#7a6555';"
                          title="Sửa sản phẩm"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </a>
                        <button 
                          (click)="deleteProductLocal(prod.productId)"
                          style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #fffbf7; border: 1.5px solid #fecaca; color: #dc2626; transition: all 0.15s; cursor: pointer;"
                          onmouseover="this.style.background='#fef2f2';"
                          onmouseout="this.style.background='#fffbf7';"
                          title="Xóa sản phẩm"
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
                    <td colspan="8" style="text-align: center; padding: 48px; color: #7a6555; font-weight: 600;">
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
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
              Hiển thị {{ (currentPage() - 1) * itemsPerPage + 1 }}-{{ getPageMaxIndex() }} trên tổng số {{ filteredProducts().length }} sản phẩm
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
export class AdminProductsListPage implements OnInit {
  private readonly router = inject(Router);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly products = signal<ExtendedProduct[]>([]);
  readonly categoriesList = signal<Category[]>([]);

  readonly currentPage = signal(1);
  readonly itemsPerPage = 8;

  // Filters
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly selectedStatus = signal('');

  // Computed local filters to instantly search within client
  readonly filteredProducts = computed(() => {
    let list = this.products();
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const status = this.selectedStatus();

    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query) || (p.slug && p.slug.toLowerCase().includes(query)));
    }
    if (category) {
      list = list.filter((p) => p.categoryId === category);
    }
    if (status) {
      const activeBool = status === 'active';
      list = list.filter((p) => p.isActive === activeBool);
    }
    return list;
  });

  // Paged slice
  readonly pagedProducts = computed(() => {
    const list = this.filteredProducts();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return list.slice(start, start + this.itemsPerPage);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.itemsPerPage) || 1;
  });

  ngOnInit(): void {
    this.loadCategories();
    this.initProductsStore();
  }

  loadCategories(): void {
    this.adminApi.getCategories().subscribe({
      next: (list) => {
        this.categoriesList.set([...list]);
      },
      error: (err) => {
        console.error('[ProductsList] Error loading categories:', err);
      }
    });
  }

  initProductsStore(): void {
    this.loading.set(true);
    this.adminApi.getProducts({ limit: 100 }).subscribe({
      next: (res: PaginatedResponse<Product>) => {
        this.products.set(res.items as ExtendedProduct[]);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('[Products] Failed to load from API, falling back to localStorage', err);
        // Fallback: try localStorage, then empty list
        const stored = localStorage.getItem('webee_admin_products');
        if (stored) {
          try { this.products.set(JSON.parse(stored)); } catch { this.products.set([]); }
        } else {
          this.products.set([]);
        }
        this.loading.set(false);
        this.toastService.error('Tải sản phẩm thất bại. Vui lòng thử lại.');
      }
    });
  }

  getCategoryCount(categoryId: string): number {
    return this.products().filter(p => p.categoryId === categoryId).length;
  }

  getStatusCount(active: boolean): number {
    return this.products().filter(p => p.isActive === active).length;
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageMaxIndex(): number {
    const total = this.filteredProducts().length;
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

  goToDetail(id: string): void {
    this.router.navigate(['/admin/products', id]);
  }

  toggleActiveLocal(product: ExtendedProduct): void {
    this.adminApi.toggleProductStatus(product.productId).subscribe({
      next: (updated: Product) => {
        this.products.update(list =>
          list.map(p => p.productId === updated.productId ? { ...p, isActive: updated.isActive } : p)
        );
        this.toastService.success(`Đã ${updated.isActive ? 'hiện' : 'ẩn'} sản phẩm "${updated.name}".`);
      },
      error: (err: unknown) => {
        console.warn('[Products] Toggle status API error, applying local fallback', err);
        this.products.update(list =>
          list.map(p => p.productId === product.productId ? { ...p, isActive: !p.isActive } : p)
        );
        this.toastService.success(`Đã ${!product.isActive ? 'hiện' : 'ẩn'} sản phẩm "${product.name}".`);
      }
    });
  }

  deleteProductLocal(productId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.adminApi.deleteProduct(productId).subscribe({
        next: (res) => {
          this.products.update(list => list.filter(p => p.productId !== productId));
          this.toastService.success('Đã xóa sản phẩm thành công.');
          this.currentPage.set(1);
        },
        error: (err: unknown) => {
          console.error('[Products] Delete API error:', err);
          this.toastService.error('Không thể xóa sản phẩm.');
        }
      });
    }
  }
}
