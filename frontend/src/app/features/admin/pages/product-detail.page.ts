import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ToastService } from '../../../core/services/toast.service';
import { AdminApi } from '../../../core/api/admin.api';
import { ProductsApi } from '../../../core/api/products.api';
import type { Review } from '../../../core/models/review.model';
import type { ExtendedProduct } from './products-list.page';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-product-detail-page',
  standalone: true,
  imports: [RouterLink, CurrencyVndPipe, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      
      <!-- Breadcrumb & Title Header -->
      @if (product(); as p) {
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-size: 13.5px; color: #7a6555; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <a routerLink="/admin/products" style="color: #7a6555; text-decoration: none;">Quản lý sản phẩm</a>
              <span>/</span>
              <span style="color: #2b1a0f;">Chi tiết sản phẩm</span>
            </div>
            <h1 style="font-family: 'Fraunces', serif; font-size: 30px; font-weight: 800; color: #2b1a0f; margin: 0 0 4px;">
              Chi tiết: {{ p.name }}
            </h1>
            <p style="margin: 0; font-size: 14px; color: #7a6555; font-weight: 500;">
              Xem thông tin chi tiết, hình ảnh, biến thể và lịch sử cập nhật của sản phẩm
            </p>
          </div>

          <div style="display: flex; gap: 12px; align-items: center;">
            <button 
              (click)="toggleActiveLocal(p)" 
              style="background: #ffffff; color: #7a6555; border: 1.5px solid #ede8e2; font-weight: 700; padding: 10px 20px; border-radius: 99px; cursor: pointer; font-size: 14px; transition: background 0.15s;"
              onmouseover="this.style.background='#fffbf7'"
              onmouseout="this.style.background='#ffffff'"
            >
              {{ p.isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm' }}
            </button>
            <a 
              [routerLink]="['/admin/products', p.productId, 'edit']"
              style="background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 10px 24px; border-radius: 99px; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; transition: background 0.15s;"
              onmouseover="this.style.background='#e5b832'"
              onmouseout="this.style.background='#f5c842'"
            >
              Chỉnh sửa sản phẩm
            </a>
          </div>
        </div>
      }

      @if (loading()) {
        <app-loading-spinner />
      } @else if (product(); as p) {
        <!-- Main Content Layout -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
          
          <!-- LEFT SIDE: Image Gallery & Specific details -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Gallery Block -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Hình ảnh đại diện & Thư viện</h3>
              
              <!-- Large image view -->
              <div style="width: 100%; height: 380px; border-radius: 12px; overflow: hidden; border: 1.5px solid #ede8e2; margin-bottom: 16px; background: #ffffff;">
                <img 
                  [src]="selectedImage() || '/assets/images/product-placeholder.svg'" 
                  [alt]="p.name"
                  style="width: 100%; height: 100%; object-fit: cover;"
                  appImgFallback
                />
              </div>

              <!-- Thumbs list -->
              @if (getGalleryImages(p).length > 0) {
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                  @for (img of getGalleryImages(p); track img; let idx = $index) {
                    <div 
                      (click)="selectedImage.set(img)"
                      [style.border-color]="selectedImage() === img ? '#c96a2e' : '#ede8e2'"
                      style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid; background: #ffffff; transition: border-color 0.15s;"
                    >
                      <img [src]="img" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                  }
                </div>
              } @else {
                <p style="font-size: 13.5px; color: #7a6555; margin: 0; text-align: center; padding: 20px; border: 1.5px dashed #ede8e2; border-radius: 8px; background: #fffbf7;">
                  Không có thêm ảnh thư viện nào khác.
                </p>
              }
            </div>

            <!-- Tab Detail Info -->
            <div class="dashboard-card" style="padding: 24px;">
              <div style="display: flex; gap: 24px; border-bottom: 1.5px solid #ede8e2; margin-bottom: 20px;">
                <span 
                  [style.border-bottom]="activeTab() === 'info' ? '3px solid #f5c842' : '3px solid transparent'"
                  [style.font-weight]="activeTab() === 'info' ? '800' : '600'"
                  [style.color]="activeTab() === 'info' ? '#2b1a0f' : '#7a6555'"
                  style="font-size: 15px; padding-bottom: 8px; cursor: pointer;"
                  (click)="setTab('info')"
                >
                  Thông tin chi tiết
                </span>
                <span 
                  [style.border-bottom]="activeTab() === 'reviews' ? '3px solid #f5c842' : '3px solid transparent'"
                  [style.font-weight]="activeTab() === 'reviews' ? '800' : '600'"
                  [style.color]="activeTab() === 'reviews' ? '#2b1a0f' : '#7a6555'"
                  style="font-size: 15px; padding-bottom: 8px; cursor: pointer;"
                  (click)="setTab('reviews')"
                >
                  Đánh giá từ khách hàng ({{ p.reviewCount }})
                </span>
              </div>

              @if (activeTab() === 'info') {
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <div>
                    <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; letter-spacing: 0.05em;">Hương vị</h4>
                    <div style="background: #fffbf7; border: 1px solid #ede8e2; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 600;">
                      {{ p.flavor || 'Chưa thiết lập hương vị' }}
                    </div>
                  </div>

                  <div>
                    <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; letter-spacing: 0.05em;">Cấu trúc bánh</h4>
                    <div style="background: #fffbf7; border: 1px solid #ede8e2; border-radius: 8px; padding: 12px 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                      {{ p.structure || 'Chưa thiết lập cấu trúc bánh' }}
                    </div>
                  </div>

                  <div>
                    <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; letter-spacing: 0.05em;">Cách bảo quản</h4>
                    <div style="background: #fffbf7; border: 1px solid #ede8e2; border-radius: 8px; padding: 12px 16px; font-size: 14px; line-height: 1.5;">
                      {{ p.storage || 'Chưa thiết lập thông tin bảo quản' }}
                    </div>
                  </div>

                  <div>
                    <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #7a6555; text-transform: uppercase; letter-spacing: 0.05em;">Phụ kiện tặng kèm</h4>
                    <div style="background: #fffbf7; border: 1px solid #ede8e2; border-radius: 8px; padding: 12px 16px; font-size: 14px; line-height: 1.5;">
                      {{ p.giftAccessories || 'Chưa thiết lập phụ kiện tặng kèm' }}
                    </div>
                  </div>
                </div>
              } @else if (activeTab() === 'reviews') {
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  @if (loadingReviews()) {
                    <app-loading-spinner />
                  } @else {
                    @for (rev of reviews(); track rev.reviewId) {
                      <div style="background: #fffbf7; border: 1px solid #ede8e2; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #7a6555;">
                              @if (rev.user?.avatarUrl) {
                                <img [src]="rev.user.avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                              } @else {
                                {{ rev.user?.fullName?.charAt(0) || 'U' }}
                              }
                            </div>
                            <div>
                              <div style="font-weight: 700; font-size: 13.5px; color: #2b1a0f;">{{ rev.user?.fullName || 'Khách hàng ẩn danh' }}</div>
                              <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">{{ formatDate(rev.createdAt) }}</div>
                            </div>
                          </div>
                          <div style="display: flex; align-items: center; gap: 2px; color: #f5c842; font-weight: bold; font-size: 13px;">
                            ★ {{ rev.rating }}/5
                          </div>
                        </div>
                        <p style="margin: 0; font-size: 13.5px; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">
                          {{ rev.comment || 'Không có bình luận.' }}
                        </p>
                        @if (rev.imageUrl) {
                          <div style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid #ede8e2; margin-top: 4px;">
                            <img [src]="rev.imageUrl" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" (click)="selectedImage.set(rev.imageUrl)" />
                          </div>
                        }
                      </div>
                    } @empty {
                      <div style="text-align: center; padding: 32px; color: #7a6555; font-size: 13.5px; border: 1.5px dashed #ede8e2; border-radius: 12px; background: #fffbf7;">
                        Chưa có đánh giá nào cho sản phẩm này.
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </div>

          <!-- RIGHT SIDE: General parameters & Update Log -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- General Parameters Card -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Thông tin sản phẩm</h3>
              
              <div style="display: flex; flex-direction: column; gap: 14px; font-size: 14px; color: #2b1a0f;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3ece3; padding-bottom: 10px;">
                  <span style="color: #7a6555; font-weight: 600;">Danh mục</span>
                  <span style="font-weight: 700;">{{ p.category?.name ?? 'Bánh Gato' }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3ece3; padding-bottom: 10px;">
                  <span style="color: #7a6555; font-weight: 600;">Đường dẫn Slug</span>
                  <span style="font-family: monospace; background: #fffbf7; padding: 2px 6px; border-radius: 4px; font-size: 12.5px;">{{ p.slug }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3ece3; padding-bottom: 10px;">
                  <span style="color: #7a6555; font-weight: 600;">Giá bán cơ bản</span>
                  <span style="font-weight: 800; color: #c96a2e; font-size: 15px;">{{ p.basePrice | currencyVnd }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3ece3; padding-bottom: 10px;">
                  <span style="color: #7a6555; font-weight: 600;">Trạng thái hiển thị</span>
                  <span 
                    [style.background-color]="p.isActive ? '#e8fdf0' : '#fef2f2'"
                    [style.color]="p.isActive ? '#16a34a' : '#dc2626'"
                    style="font-size: 12.5px; font-weight: 700; padding: 3px 10px; border-radius: 99px;"
                  >
                    {{ p.isActive ? 'Đang bán' : 'Tạm ẩn' }}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3ece3; padding-bottom: 10px;">
                  <span style="color: #7a6555; font-weight: 600;">Giao hàng hỏa tốc (30-45')</span>
                  <span style="font-weight: 700;">{{ p.deliveryExpress !== false ? 'Có hỗ trợ' : 'Không hỗ trợ' }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3ece3; padding-bottom: 10px;">
                  <span style="color: #7a6555; font-weight: 600;">Đổi trả miễn phí 24h</span>
                  <span style="font-weight: 700;">{{ p.freeReturn24h !== false ? 'Được áp dụng' : 'Không áp dụng' }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #7a6555; font-weight: 600;">Đã bán</span>
                  <span style="font-weight: 700; color: #7a6555;">{{ p.soldCount ?? 0 }} bánh</span>
                </div>
              </div>

              <!-- Description Block -->
              <div style="margin-top: 20px; border-top: 1.5px solid #f3ece3; padding-top: 16px;">
                <h4 style="margin: 0 0 8px; color: #2b1a0f; font-size: 13.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Mô tả sản phẩm</h4>
                <p style="margin: 0; font-size: 13.5px; color: #7a6555; line-height: 1.6; white-space: pre-wrap;">
                  {{ p.description || 'Chưa thiết lập mô tả cho sản phẩm này.' }}
                </p>
              </div>
            </div>

            <!-- Variants List Box -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Biến thể kích cỡ</h3>
              
              <div style="display: flex; flex-direction: column; gap: 10px;">
                @for (v of p.variants; track v.name) {
                  <div style="display: flex; justify-content: space-between; align-items: center; background: #fffcf9; border: 1.5px solid #ede8e2; border-radius: 8px; padding: 10px 14px;">
                    <span style="font-weight: 700; color: #2b1a0f; font-size: 13.5px;">{{ v.name }}</span>
                    <div style="display: flex; gap: 16px; font-size: 13.5px;">
                      <span style="color: #c96a2e; font-weight: 800;">{{ v.price | currencyVnd }}</span>
                    </div>
                  </div>
                } @empty {
                  <p style="margin: 0; font-size: 13px; color: #7a6555; text-align: center; padding: 12px; border: 1.5px dashed #ede8e2; border-radius: 8px;">
                    Sản phẩm này chỉ bán một size mặc định.
                  </p>
                }
              </div>
            </div>

            <!-- Lịch sử cập nhật -->
            <div class="dashboard-card" style="padding: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #2b1a0f; font-family: 'Fraunces', serif; text-transform: uppercase; letter-spacing: 0.05em;">Lịch sử cập nhật</h3>
              
              <div style="display: flex; flex-direction: column; gap: 14px; position: relative; padding-left: 18px; border-left: 2px solid #ede8e2; margin-left: 6px;">
                <div style="position: relative;">
                  <span style="position: absolute; left: -24px; top: 3px; background: #f5c842; width: 10px; height: 10px; border-radius: 50%;"></span>
                  <div style="font-weight: 700; font-size: 13px; color: #2b1a0f;">Cập nhật thông tin gần nhất</div>
                  <div style="font-size: 12px; color: #7a6555; margin-top: 2px;">{{ formatDate(p.updatedAt) }}</div>
                </div>
                
                <div style="position: relative;">
                  <span style="position: absolute; left: -24px; top: 3px; background: #ede8e2; width: 10px; height: 10px; border-radius: 50%;"></span>
                  <div style="font-weight: 700; font-size: 13px; color: #7a6555;">Khởi tạo sản phẩm</div>
                  <div style="font-size: 12px; color: #7a6555; margin-top: 2px;">{{ formatDate(p.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="dashboard-hero" style="padding: 48px; text-align: center; max-width: 500px; margin: 40px auto;">
          <span style="font-size: 48px;">🍰</span>
          <h2 style="font-family: 'Fraunces', serif; color: #2b1a0f; margin: 16px 0 8px;">Không tìm thấy sản phẩm</h2>
          <p style="color: #7a6555; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
            Đường dẫn hoặc mã sản phẩm không hợp lệ, hoặc sản phẩm đã bị xóa.
          </p>
          <a routerLink="/admin/products" class="btn-primary" style="text-decoration: none;">
            Quay lại danh sách
          </a>
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApi);
  private readonly productsApi = inject(ProductsApi);

  readonly loading = signal(true);
  readonly product = signal<ExtendedProduct | null>(null);
  readonly selectedImage = signal<string>('');

  readonly activeTab = signal<'info' | 'reviews'>('info');
  readonly reviews = signal<Review[]>([]);
  readonly loadingReviews = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductLocal(id);
    } else {
      this.toastService.error('ID sản phẩm không hợp lệ.');
      this.router.navigate(['/admin/products']);
    }
  }

  loadProductLocal(id: string): void {
    this.loading.set(true);
    this.adminApi.getProduct(id).subscribe({
      next: (prod) => {
        // Cast as ExtendedProduct since admin endpoints return product properties.
        const ep = prod as ExtendedProduct;
        this.product.set(ep);
        this.selectedImage.set(ep.thumbnailUrl || '');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ProductDetail] Error loading product:', err);
        this.loading.set(false);
        this.toastService.error('Không tìm thấy sản phẩm hoặc tải sản phẩm thất bại.');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  loadReviews(productId: string): void {
    this.loadingReviews.set(true);
    this.productsApi.getProductReviews(productId, { limit: 100 }).subscribe({
      next: (res) => {
        this.reviews.set([...res.items]);
        this.loadingReviews.set(false);
      },
      error: (err) => {
        console.error('[ProductDetail] Error loading product reviews:', err);
        this.loadingReviews.set(false);
      }
    });
  }

  setTab(tab: 'info' | 'reviews'): void {
    this.activeTab.set(tab);
    if (tab === 'reviews' && this.reviews().length === 0) {
      const prod = this.product();
      if (prod) {
        this.loadReviews(prod.productId);
      }
    }
  }

  getGalleryImages(p: ExtendedProduct): string[] {
    const images: string[] = [];
    if (p.thumbnailUrl) {
      images.push(p.thumbnailUrl);
    }
    if (p.images) {
      p.images.forEach(img => {
        if (img.imageUrl && img.imageUrl !== p.thumbnailUrl) {
          images.push(img.imageUrl);
        }
      });
    }
    return images;
  }

  toggleActiveLocal(product: ExtendedProduct): void {
    this.adminApi.toggleProductStatus(product.productId).subscribe({
      next: (updated) => {
        const current = this.product();
        if (current) {
          this.product.set({ ...current, isActive: updated.isActive });
        }
        this.toastService.success(`Đã ${updated.isActive ? 'hiện' : 'ẩn'} sản phẩm "${product.name}".`);
      },
      error: (err) => {
        console.error('[ProductDetail] Error toggling product status:', err);
        this.toastService.error('Không thể cập nhật trạng thái sản phẩm.');
      }
    });
  }

  private getStoredProducts(): ExtendedProduct[] {
    const stored = localStorage.getItem('webee_admin_products');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Chưa rõ';
    const d = new Date(dateStr);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} - ${date}`;
  }
}
