import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Product } from '../../../core/models/product.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-products-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyVndPipe, LoadingSpinnerComponent, PaginationComponent, ImgFallbackDirective],
  template: `
    <div class="admin-page">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <h1 class="admin-page__title" style="margin:0">Sản phẩm</h1>
        <a class="btn-primary" routerLink="/admin/products/new" style="text-decoration:none;display:inline-block">+ Thêm sản phẩm</a>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="admin-section">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Tùy chỉnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.productId) {
                  <tr>
                    <td>
                      <img
                        [src]="product.thumbnailUrl ?? '/assets/images/product-placeholder.svg'"
                        [alt]="product.name"
                        class="product-thumb"
                        appImgFallback
                      />
                    </td>
                    <td>
                      <strong>{{ product.name }}</strong>
                      <div style="font-size:12px;color:#6b6b6b;margin-top:2px">{{ product.slug }}</div>
                    </td>
                    <td>{{ product.basePrice | currencyVnd }}</td>
                    <td>
                      @if (product.isActive) {
                        <span class="badge-active">Đang bán</span>
                      } @else {
                        <span class="badge-inactive">Ẩn</span>
                      }
                    </td>
                    <td>{{ product.isCustomizable ? 'Có' : '—' }}</td>
                    <td>
                      <div style="display:flex;gap:8px;align-items:center">
                        <a
                          [routerLink]="['/admin/products', product.productId, 'edit']"
                          class="btn-sm btn-sm--primary"
                        >Sửa</a>
                        <button
                          class="btn-sm btn-sm--secondary"
                          (click)="toggleActive(product)"
                          [disabled]="togglingId() === product.productId"
                        >
                          {{ product.isActive ? 'Ẩn' : 'Hiện' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="pagination-row">
              <app-pagination
                [currentPage]="currentPage()"
                [totalPages]="totalPages()"
                (pageChange)="goToPage($event)"
              />
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminProductsListPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly togglingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.adminApi.getProducts({ page, limit: 20 }).subscribe({
      next: (res) => {
        this.products.set([...res.items]);
        this.currentPage.set(page);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toastService.error('Tải danh sách sản phẩm thất bại.'); },
    });
  }

  goToPage(page: number): void {
    this.loadPage(page);
  }

  toggleActive(product: Product): void {
    this.togglingId.set(product.productId);
    this.adminApi.toggleProductStatus(product.productId).subscribe({
      next: (updated) => {
        this.products.update((list) =>
          list.map((p) => p.productId === updated.productId ? updated : p)
        );
        this.togglingId.set(null);
        this.toastService.success(`Đã ${updated.isActive ? 'hiện' : 'ẩn'} sản phẩm.`);
      },
      error: () => { this.togglingId.set(null); this.toastService.error('Thao tác thất bại.'); },
    });
  }
}
