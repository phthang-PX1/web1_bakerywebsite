import { Component, signal, HostListener, computed, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApi, AdminAnalyticsOverview } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Order, OrderStatus } from '../../../core/models/order.model';

interface KitchenTask {
  id: string | number;
  title: string;
  desc: string;
  checked: boolean;
  orderId?: string;
}

interface RankingProduct {
  productId?: string;
  name: string;
  value: number;
  percentage: number;
}

interface SearchResultItem {
  id: string;
  type: 'order' | 'product' | 'customer';
  title: string;
  desc: string;
  routeUrl: string;
}

// SEARCH_ITEMS mock removed - utilizing dynamic backend search

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <!-- Search Bar (Dashboard only) -->
      <div class="dashboard-search-bar" style="position: relative; z-index: 100;" (click)="$event.stopPropagation()">
        <div class="dashboard-search-bar__inner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 11.5L15 15M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="onSearchInput()"
            (keydown.escape)="closeDropdown()"
            placeholder="Tìm nhanh đơn hàng, sản phẩm, khách hàng..." 
            class="dashboard-search-input" 
          />
        </div>

        @if (showDropdown() && searchQuery.trim()) {
          <div class="dashboard-search-dropdown">
            @if (searchResults().orders.length === 0 && searchResults().products.length === 0) {
              <div class="search-empty-state">
                Không tìm thấy kết quả phù hợp (đơn hàng hoặc sản phẩm)
              </div>
            } @else {
              <!-- Đơn hàng -->
              @if (searchResults().orders.length > 0) {
                <div class="search-group">
                  <div class="search-group-title">Đơn hàng</div>
                  @for (item of searchResults().orders; track item.id) {
                    <div class="search-result-item" (click)="navigate(item.routeUrl)">
                      <span class="search-result-badge badge-order">Đơn hàng</span>
                      <div class="search-result-text">
                        <div class="search-result-title">{{ item.title }}</div>
                        <div class="search-result-desc">{{ item.desc }}</div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Sản phẩm -->
              @if (searchResults().products.length > 0) {
                <div class="search-group">
                  <div class="search-group-title">Sản phẩm</div>
                  @for (item of searchResults().products; track item.id) {
                    <div class="search-result-item" (click)="navigate(item.routeUrl)">
                      <span class="search-result-badge badge-product">Sản phẩm</span>
                      <div class="search-result-text">
                        <div class="search-result-title">{{ item.title }}</div>
                        <div class="search-result-desc">{{ item.desc }}</div>
                      </div>
                    </div>
                  }
                </div>
              }
            }
          </div>
        }
      </div>

      <div class="admin-page">
        <!-- Header -->
        <header class="dashboard-new-header">
          <div>
            <h1 class="dashboard-new-title">Tổng quan</h1>
            <p class="dashboard-new-subtitle">{{ getRealtimeDateText() }}</p>
          </div>
          <div>
            <select class="select-filter-time" [ngModel]="selectedPeriod()" (ngModelChange)="onPeriodChange($event)">
              <option value="quarter">Quý này</option>
              <option value="month">Tháng này</option>
              <option value="week">Tuần này</option>
              <option value="today">Hôm nay</option>
            </select>
          </div>
        </header>

        <!-- 3 Stats Cards -->
        <section class="stats-grid-new">
          <!-- Card 1: Tổng đơn hàng -->
          <article class="stat-card-new">
            <span class="stat-card-new__label">Tổng đơn hàng</span>
            <div class="stat-card-new__value-row">
              <strong class="stat-card-new__value">{{ currentStats().totalOrders }}</strong>
              <span class="stat-card-new__delta">{{ currentStats().ordersDelta }}</span>
            </div>
          </article>

          <!-- Card 2: Doanh thu -->
          <article class="stat-card-new">
            <span class="stat-card-new__label">Doanh thu</span>
            <div class="stat-card-new__value-row">
              <strong class="stat-card-new__value">{{ currentStats().revenue }}</strong>
              <span class="stat-card-new__delta">{{ currentStats().revenueDelta }}</span>
            </div>
          </article>

          <!-- Card 3: Tỷ lệ hủy đơn -->
          <article class="stat-card-new">
            <div class="stat-card-new__info-icon" title="Thông tin tỷ lệ hủy">i</div>
            <span class="stat-card-new__label">Tỷ lệ hủy đơn</span>
            <div class="stat-card-new__value-row">
              <strong class="stat-card-new__value stat-card-new__value--danger">{{ currentStats().cancelRate }}</strong>
            </div>
            <span class="stat-card-new__note">(Số đơn hủy / Tổng số đơn hàng) x 100%</span>
          </article>
        </section>

        <!-- Middle row (Revenue Trend & Kitchen Tasks) -->
        <section class="dashboard-grid-new">
          <!-- Xu hướng doanh thu -->
          <article class="dashboard-card-new">
            <div class="dashboard-card-new__header">
              <h2 class="dashboard-card-new__title">Xu hướng doanh thu</h2>
              <span class="dashboard-card-new__more">...</span>
            </div>
            
            <div class="line-chart-wrapper" style="position: relative;">
              <!-- Overlay disclaimer for lack of backend API support -->
              <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10;">
                <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Biểu đồ xu hướng chưa khả dụng</span>
                <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Số liệu tạm ẩn do Backend chưa hỗ trợ cung cấp API dữ liệu chuỗi thời gian (time-series).</span>
              </div>
              <!-- SVG Line Chart -->
              <svg class="line-chart-svg" viewBox="0 0 500 180" width="100%" height="180">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.8" />
                    <stop offset="100%" stop-color="#fef3c7" stop-opacity="0" />
                  </linearGradient>
                </defs>
                
                <!-- Lưới ngang Y và nhãn -->
                <g stroke="#f3f4f6" stroke-width="1">
                  <line x1="60" y1="10" x2="470" y2="10" stroke-dasharray="4" />
                  <line x1="60" y1="50" x2="470" y2="50" stroke-dasharray="4" />
                  <line x1="60" y1="90" x2="470" y2="90" stroke-dasharray="4" />
                  <line x1="60" y1="130" x2="470" y2="130" stroke-dasharray="4" />
                  <line x1="60" y1="170" x2="470" y2="170" />
                </g>
                
                <!-- Nhãn Y -->
                <g fill="#9ca3af" font-size="10" font-weight="600" text-anchor="end">
                  <text x="50" y="14">{{ currentStats().yLabel1 }}</text>
                  <text x="50" y="54">{{ currentStats().yLabel2 }}</text>
                  <text x="50" y="94">{{ currentStats().yLabel3 }}</text>
                  <text x="50" y="134">{{ currentStats().yLabel4 }}</text>
                  <text x="50" y="174">0 VNĐ</text>
                </g>
                
                <!-- Vùng fill dưới biểu đồ -->
                <path [attr.d]="currentStats().fillD" fill="url(#chart-grad)" />
                
                <!-- Đường vẽ Line chart -->
                <path [attr.d]="currentStats().lineD" 
                      fill="none" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      
                <!-- Các chấm tròn dữ liệu ở các điểm nút quan trọng -->
                @for (pt of currentStats().points; track $index) {
                  <circle [attr.cx]="pt.cx" [attr.cy]="pt.cy" r="4" fill="#7c2d12" />
                }
                
                <!-- Trục X nhãn -->
                <g fill="#9ca3af" font-size="10" font-weight="600" text-anchor="middle">
                  <text x="70" y="192">T2</text>
                  <text x="133" y="192">T3</text>
                  <text x="196" y="192">T4</text>
                  <text x="259" y="192">T5</text>
                  <text x="322" y="192">T6</text>
                  <text x="385" y="192">T7</text>
                  <text x="448" y="192">CN</text>
                </g>
              </svg>
            </div>
          </article>

          <!-- Nhiệm vụ nhà bếp -->
          <article class="kitchen-tasks-card">
            <h2 class="kitchen-tasks-title">{{ tasksTitle() }}</h2>
            <div class="kitchen-tasks-list">
              @for (task of currentTasks(); track task.id) {
                <div 
                  class="task-item-new" 
                  [class.task-item-new--completed]="task.checked"
                >
                  <div 
                    class="task-item-new__checkbox" 
                    [class.task-item-new__checkbox--checked]="task.checked"
                    (click)="toggleTask(task); $event.stopPropagation()"
                    style="cursor: pointer;"
                  >
                    @if (task.checked) { ✓ }
                  </div>
                  <div 
                    class="task-item-new__content"
                    [routerLink]="['/admin/orders', task.orderId]"
                    style="cursor: pointer;"
                  >
                    <h3 class="task-item-new__title">{{ task.title }}</h3>
                    <p class="task-item-new__desc">{{ task.desc }}</p>
                  </div>
                </div>
              } @empty {
                <div style="text-align: center; padding: 24px; color: #7a6555; font-size: 13.5px; font-weight: 600;">
                  Không có đơn hàng/nhiệm vụ nào cần làm bếp trong khoảng thời gian này.
                </div>
              }
            </div>
          </article>
        </section>

        <!-- Bottom row (Top Products & Operation Status) -->
        <section class="dashboard-grid-new">
          <!-- Top 5 sản phẩm bán chạy -->
          <article class="dashboard-card-new">
            <div class="dashboard-card-new__header">
              <h2 class="dashboard-card-new__title">Top 5 sản phẩm bán chạy</h2>
            </div>
            
            <div class="ranking-list">
              @for (item of currentStats().ranking; track item.name) {
                <div 
                  class="ranking-item" 
                  [routerLink]="item.productId ? ['/admin/products', item.productId] : null"
                  [style.cursor]="item.productId ? 'pointer' : 'default'"
                  style="transition: background 0.15s; padding: 4px 8px; margin: 0 -8px; border-radius: 6px;"
                  onmouseover="this.style.background='#fffbf7'"
                  onmouseout="this.style.background='none'"
                >
                  <div class="ranking-item__header">
                    <span class="ranking-item__name" [style.color]="item.productId ? '#c96a2e' : '#2b1a0f'">{{ item.name }}</span>
                    <span class="ranking-item__value">{{ item.value }}</span>
                  </div>
                  <div class="ranking-item__bar-container">
                    <div class="ranking-item__bar-fill" [style.width.%]="item.percentage"></div>
                  </div>
                </div>
              } @empty {
                <div style="text-align: center; padding: 24px; color: #7a6555; font-size: 13.5px; font-weight: 600;">
                  Backend hiện chưa cung cấp dữ liệu Top sản phẩm bán chạy.
                </div>
              }
            </div>
          </article>

          <!-- Trạng thái vận hành -->
          <article class="dashboard-card-new" style="position: relative;">
            <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
              <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Dữ liệu vận hành chưa khả dụng</span>
              <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Số liệu vận hành (giao hàng/nhận tại cửa hàng) tạm ẩn do Backend chưa hỗ trợ thống kê phân bổ.</span>
            </div>
            <div class="dashboard-card-new__header">
              <h2 class="dashboard-card-new__title">Trạng thái vận hành</h2>
            </div>
            
            <div class="operation-grid">
              <!-- Cột Giao hàng -->
              <div class="op-column">
                <h3 class="op-column__title">Giao hàng</h3>
                <div class="op-doughnut-wrapper">
                  <div class="doughnut-chart delivery-chart">
                    <div class="doughnut-center">{{ currentStats().deliveryCount }}</div>
                  </div>
                </div>
                <div class="op-legend">
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #c96a2e;"></span>
                      Hoàn thành
                    </span>
                    <span class="op-legend-percent">{{ currentStats().deliveryLegend.complete }}</span>
                  </div>
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #fcd34d;"></span>
                      Đang giao
                    </span>
                    <span class="op-legend-percent">{{ currentStats().deliveryLegend.shipping }}</span>
                  </div>
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #ffb07c;"></span>
                      Đang làm bánh
                    </span>
                    <span class="op-legend-percent">{{ currentStats().deliveryLegend.baking }}</span>
                  </div>
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #ffedd5;"></span>
                      Chờ xác nhận
                    </span>
                    <span class="op-legend-percent">{{ currentStats().deliveryLegend.pending }}</span>
                  </div>
                </div>
              </div>

              <!-- Cột Nhận tại cửa hàng -->
              <div class="op-column">
                <h3 class="op-column__title">Nhận tại cửa hàng</h3>
                <div class="op-doughnut-wrapper">
                  <div class="doughnut-chart pickup-chart">
                    <div class="doughnut-center">{{ currentStats().pickupCount }}</div>
                  </div>
                </div>
                <div class="op-legend">
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #c96a2e;"></span>
                      Hoàn thành
                    </span>
                    <span class="op-legend-percent">{{ currentStats().pickupLegend.complete }}</span>
                  </div>
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #fcd34d;"></span>
                      Chờ khách lấy
                    </span>
                    <span class="op-legend-percent">{{ currentStats().pickupLegend.waiting }}</span>
                  </div>
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #ffb07c;"></span>
                      Đang làm bánh
                    </span>
                    <span class="op-legend-percent">{{ currentStats().pickupLegend.baking }}</span>
                  </div>
                  <div class="op-legend-item">
                    <span class="op-legend-color-label">
                      <span class="op-legend-dot" style="background-color: #ffedd5;"></span>
                      Chờ xác nhận
                    </span>
                    <span class="op-legend-percent">{{ currentStats().pickupLegend.pending }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div><!-- /admin-page -->
    </div><!-- /dashboard-wrapper -->
  `,
  styleUrl: './admin.page.scss',
  styles: [`
    .dashboard-search-dropdown {
      position: absolute;
      top: 100%;
      left: 32px;
      right: 32px;
      background: #ffffff;
      border: 1.5px solid #ede8e2;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(43, 26, 15, 0.08);
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
      margin-top: 8px;
    }
    .search-empty-state {
      padding: 20px;
      text-align: center;
      color: #7a6555;
      font-size: 14px;
    }
    .search-group {
      padding: 8px 0;
      border-bottom: 1.5px solid #ede8e2;
    }
    .search-group:last-child {
      border-bottom: none;
    }
    .search-group-title {
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #7a6555;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #fffbf7;
    }
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .search-result-item:hover {
      background: #fffbf0;
    }
    .search-result-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .badge-order {
      background: #ffe4e6;
      color: #be123c;
    }
    .badge-product {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-customer {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .search-result-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .search-result-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #2b1a0f;
    }
    .search-result-desc {
      font-size: 12px;
      color: #7a6555;
    }
  `]
})
export class DashboardPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);
  searchQuery = '';
  showDropdown = signal(false);
  selectedPeriod = signal('month');
  readonly realOrders = signal<readonly Order[]>([]);

  /** Real data from GET /admin/analytics/overview — null while loading */
  apiOverview = signal<AdminAnalyticsOverview | null>(null);
  isLoadingOverview = signal(false);

  readonly tasksByPeriod: Record<string, KitchenTask[]> = {
    today: [
      { id: 1, title: 'Bánh Kem Dâu Tây', desc: 'SL: 12 • Kèm lời chúc sinh nhật', checked: false },
      { id: 2, title: 'Bánh Tiramisu Chocolate', desc: 'SL: 45 • Mẻ đầu tiên lúc 8h sáng', checked: false },
      { id: 3, title: 'Bánh Kem Bắp', desc: 'SL: 100 • Giao sỉ', checked: false },
      { id: 4, title: 'Bánh Mousse Nhãn', desc: 'Đã hoàn thành lúc 6:30', checked: true }
    ],
    week: [
      { id: 5, title: 'Chuẩn bị đế bánh tart trứng', desc: 'Mục tiêu: 250 cái • Hạn chót: Thứ Năm', checked: false },
      { id: 6, title: 'Đặt dâu tây tươi Đà Lạt', desc: 'Số lượng: 50kg • Đối tác liên kết', checked: true },
      { id: 7, title: 'Bảo trì hệ thống tủ đông khu B', desc: 'Kỹ thuật viên hẹn lúc 14h Thứ Sáu', checked: false },
      { id: 8, title: 'Kiểm kê nguyên liệu làm bánh', desc: 'Báo cáo hao hụt định kỳ hàng tuần', checked: false }
    ],
    month: [
      { id: 9, title: 'Tổng vệ sinh nhà xưởng định kỳ', desc: 'Toàn bộ nhân sự tham gia • Chủ Nhật cuối tháng', checked: false },
      { id: 10, title: 'Thử nghiệm bánh Mousse Sầu Riêng', desc: 'Bếp trưởng duyệt công thức mới', checked: true },
      { id: 11, title: 'Đào tạo nhân sự bếp mới', desc: 'Nội dung: Quy trình làm bánh Entremet', checked: false },
      { id: 12, title: 'Cập nhật menu bánh mùa hè', desc: 'Lên ý tưởng thiết kế hộp quà tặng mới', checked: false }
    ],
    quarter: [
      { id: 13, title: 'Báo cáo tổng kết sản xuất quý', desc: 'Lập báo cáo tài chính sản xuất bếp gửi quản lý', checked: false },
      { id: 14, title: 'Bảo dưỡng định kỳ lò nướng công nghiệp', desc: 'Bảo trì hệ thống gia nhiệt khu A và B', checked: true },
      { id: 15, title: 'Đào tạo an toàn thực phẩm bếp bánh', desc: 'Cấp chứng chỉ định kỳ cho toàn bộ nhân sự', checked: false }
    ]
  };

  currentTasks = signal<KitchenTask[]>([]);

  tasksTitle = computed(() => {
    const period = this.selectedPeriod();
    if (period === 'today') return 'Nhiệm vụ nhà bếp hôm nay';
    if (period === 'week') return 'Nhiệm vụ nhà bếp tuần này';
    if (period === 'quarter') return 'Nhiệm vụ nhà bếp quý này';
    return 'Nhiệm vụ nhà bếp tháng này';
  });

  currentStats = computed(() => {
    const period = this.selectedPeriod();
    const api = this.apiOverview();
    const loading = this.isLoadingOverview();

    // ── Helper: format revenue from backend number (VNĐ) to readable string ──
    const fmtRevenue = (v: number): string => {
      if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '') + 'M';
      if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
      return String(v);
    };

    // ── Build ranking from API topProducts ──
    const buildRanking = (products: AdminAnalyticsOverview['topProducts']) => {
      if (!products?.length) return [];
      const max = products[0].quantitySold || 1;
      return products.map(p => ({
        productId: p.productId,
        name: p.productName,
        value: p.quantitySold,
        percentage: Math.round((p.quantitySold / max) * 100)
      }));
    };

    // ── Static chart paths (biểu đồ SVG — backend không trả time-series) ──
    const chartByPeriod: Record<string, {
      yLabel1: string; yLabel2: string; yLabel3: string; yLabel4: string;
      points: { cx: number; cy: number }[];
      lineD: string; fillD: string;
    }> = {
      today: {
        yLabel1: '2M VNĐ', yLabel2: '1.5M VNĐ', yLabel3: '1M VNĐ', yLabel4: '0.5M VNĐ',
        points: [{ cx: 70, cy: 170 }, { cx: 133, cy: 165 }, { cx: 196, cy: 160 }, { cx: 259, cy: 150 }, { cx: 322, cy: 140 }, { cx: 385, cy: 120 }, { cx: 448, cy: 100 }],
        lineD: 'M 70 170 L 133 165 L 196 160 L 259 150 L 322 140 L 385 120 L 448 100',
        fillD: 'M 70 170 H 133 L 196 160 L 259 150 L 322 140 L 385 120 L 448 100 L 448 170 Z'
      },
      week: {
        yLabel1: '10M VNĐ', yLabel2: '7.5M VNĐ', yLabel3: '5M VNĐ', yLabel4: '2.5M VNĐ',
        points: [{ cx: 70, cy: 170 }, { cx: 133, cy: 150 }, { cx: 196, cy: 120 }, { cx: 259, cy: 110 }, { cx: 322, cy: 90 }, { cx: 385, cy: 70 }, { cx: 448, cy: 50 }],
        lineD: 'M 70 170 L 133 150 L 196 120 L 259 110 L 322 90 L 385 70 L 448 50',
        fillD: 'M 70 170 H 133 L 196 120 L 259 110 L 322 90 L 385 70 L 448 50 L 448 170 Z'
      },
      month: {
        yLabel1: '10M VNĐ', yLabel2: '7.5M VNĐ', yLabel3: '5M VNĐ', yLabel4: '2.5M VNĐ',
        points: [{ cx: 322, cy: 170 }, { cx: 385, cy: 125 }, { cx: 448, cy: 50 }],
        lineD: 'M 70 170 L 133 170 L 196 170 L 259 170 L 322 170 L 385 125 L 448 50',
        fillD: 'M 70 170 H 322 L 385 125 L 448 50 L 448 170 Z'
      },
      quarter: {
        yLabel1: '50M VNĐ', yLabel2: '35M VNĐ', yLabel3: '20M VNĐ', yLabel4: '10M VNĐ',
        points: [{ cx: 70, cy: 170 }, { cx: 196, cy: 155 }, { cx: 322, cy: 115 }, { cx: 448, cy: 50 }],
        lineD: 'M 70 170 L 196 155 L 322 115 L 448 50',
        fillD: 'M 70 170 H 196 L 322 115 L 448 50 L 448 170 Z'
      }
    };
    const chart = chartByPeriod[period] ?? chartByPeriod['month'];

    // ── If API data available, use real values ──
    if (api) {
      const ranking = buildRanking(api.topProducts);
      return {
        totalOrders: api.totalOrders.toLocaleString('vi-VN'),
        ordersDelta: '',
        revenue: fmtRevenue(api.revenue),
        revenueDelta: '',
        cancelRate: '--',
        newCustomers: api.newCustomers,
        ...chart,
        ranking,
        deliveryCount: 0,
        deliveryLegend: { complete: '—', shipping: '—', baking: '—', pending: '—' },
        pickupCount: 0,
        pickupLegend: { complete: '—', waiting: '—', baking: '—', pending: '—' }
      };
    }

    // ── Fallback: empty data while loading or no api ──
    return {
      totalOrders: loading ? '...' : '0',
      ordersDelta: '',
      revenue: loading ? '...' : '0đ',
      revenueDelta: '',
      cancelRate: '—',
      newCustomers: 0,
      ...chart,
      ranking: [],
      deliveryCount: 0,
      deliveryLegend: { complete: '—', shipping: '—', baking: '—', pending: '—' },
      pickupCount: 0,
      pickupLegend: { complete: '—', waiting: '—', baking: '—', pending: '—' }
    };
  });

  searchResults = signal<{
    orders: SearchResultItem[];
    products: SearchResultItem[];
  }>({ orders: [], products: [] });

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadOrders();
    this.loadOverview();
  }

  loadOrders() {
    this.adminApi.getOrders({ limit: 100 }).subscribe({
      next: (res) => {
        this.realOrders.set(res.items);
        this.updateTasksForPeriod();
      },
      error: (err) => {
        console.error('Error loading orders for dashboard:', err);
        this.updateTasksForPeriod();
      }
    });
  }

  private filterOrdersByPeriod(orders: readonly Order[], period: string): Order[] {
    const now = new Date();
    return orders.filter(o => {
      if (o.orderStatus === 'cancelled' || o.orderStatus === 'delivered') return false;

      const orderDate = new Date(o.createdAt);
      if (period === 'today') {
        return orderDate.getFullYear() === now.getFullYear() &&
               orderDate.getMonth() === now.getMonth() &&
               orderDate.getDate() === now.getDate();
      } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        return orderDate >= startOfWeek && orderDate < endOfWeek;
      } else { // month
        return orderDate.getFullYear() === now.getFullYear() &&
               orderDate.getMonth() === now.getMonth();
      }
    });
  }

  /** Tính date range theo period hiện tại để truyền vào analytics API */
  private getDateRange(): { dateFrom: string; dateTo: string } {
    const now = new Date();
    const dateTo = now.toISOString();
    let dateFrom: Date;
    const period = this.selectedPeriod();
    if (period === 'today') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'week') {
      const dayOfWeek = now.getDay(); // 0 = Sun
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon, 0, 0, 0);
    } else {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }
    return { dateFrom: dateFrom.toISOString(), dateTo };
  }

  private loadOverview(): void {
    this.isLoadingOverview.set(true);
    const { dateFrom, dateTo } = this.getDateRange();
    this.adminApi.getOverview(dateFrom, dateTo).subscribe({
      next: (data) => {
        this.apiOverview.set(data);
        this.isLoadingOverview.set(false);
      },
      error: (err) => {
        console.error('[Dashboard] Failed to load analytics overview', err);
        this.isLoadingOverview.set(false);
      }
    });
  }

  getRealtimeDateText(): string {
    const period = this.selectedPeriod();
    const now = new Date();
    
    if (period === 'today') {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const dateStr = now.toLocaleDateString('vi-VN', options);
      return 'Hôm nay: ' + dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
    
    if (period === 'week') {
      const dayOfWeek = now.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      return `Tuần này: ${fmt(startOfWeek)} - ${fmt(endOfWeek)}`;
    }
    
    // month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return `Tháng này: ${fmt(startOfMonth)} - ${fmt(endOfMonth)}`;
  }

  onPeriodChange(newPeriod: string) {
    this.selectedPeriod.set(newPeriod);
    this.apiOverview.set(null);  // Clear previous data to show loading state
    this.loadOrders();
    this.loadOverview();
  }

  updateTasksForPeriod() {
    const period = this.selectedPeriod();
    const orders = this.realOrders();
    const filtered = this.filterOrdersByPeriod(orders, period);
    
    if (filtered.length > 0) {
      const tasks: KitchenTask[] = filtered.map((o) => ({
        id: o.orderId,
        title: `Đơn hàng #${o.orderId.substring(0, 8).toUpperCase()} - ${o.recipientName}`,
        desc: `${o.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')} • ${o.fulfillmentType === 'delivery' ? 'Giao hàng' : 'Nhận tại CH'}: ${o.deliveryTimeSlot}`,
        checked: o.orderStatus === 'ready' || o.orderStatus === 'delivered',
        orderId: o.orderId
      }));
      this.currentTasks.set(tasks);
    } else {
      this.currentTasks.set([]);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.showDropdown.set(false);
  }

  onSearchInput(): void {
    this.showDropdown.set(true);
    const q = this.searchQuery.trim();
    if (q.length < 2) {
      this.searchResults.set({ orders: [], products: [] });
      return;
    }

    // Search real products
    this.adminApi.getProducts({ search: q, limit: 5 }).subscribe({
      next: (res) => {
        const mappedProducts = res.items.map(p => ({
          id: p.productId,
          type: 'product' as const,
          title: p.name,
          desc: `Giá: ${p.basePrice.toLocaleString('vi-VN')}đ`,
          routeUrl: `/admin/products/${p.productId}`
        }));
        this.searchResults.update(prev => ({ ...prev, products: mappedProducts }));
      },
      error: (err) => {
        console.error('[Dashboard] Search products error:', err);
      }
    });

    // Search real orders
    this.adminApi.getOrders({ search: q, limit: 5 }).subscribe({
      next: (res) => {
        const mappedOrders = res.items.map(o => ({
          id: o.orderId,
          type: 'order' as const,
          title: `#WB-${o.orderId.slice(0, 8).toUpperCase()}`,
          desc: `Khách: ${o.recipientName} • Tổng: ${o.totalAmount.toLocaleString('vi-VN')}đ`,
          routeUrl: `/admin/orders/${o.orderId}`
        }));
        this.searchResults.update(prev => ({ ...prev, orders: mappedOrders }));
      },
      error: (err) => {
        console.error('[Dashboard] Search orders error:', err);
      }
    });
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  navigate(url: string) {
    this.showDropdown.set(false);
    this.searchQuery = '';
    this.router.navigateByUrl(url);
  }

  toggleTask(task: KitchenTask): void {
    if (task.orderId) {
      const newStatus: OrderStatus = task.checked ? 'processing' : 'ready';
      this.adminApi.updateOrderStatus(task.orderId, newStatus).subscribe({
        next: () => {
          this.toastService.success(`Đã cập nhật trạng thái đơn hàng sang ${newStatus === 'ready' ? 'Sẵn sàng' : 'Đang xử lý'}.`);
          this.loadOrders();
        },
        error: (err) => {
          console.error('Error updating order status:', err);
          this.toastService.error('Không thể cập nhật trạng thái đơn hàng.');
        }
      });
    } else {
      const id = task.id;
      this.currentTasks.update((list) =>
        list.map((t) => {
          if (t.id === id) {
            const newChecked = !t.checked;
            let newDesc = t.desc;
            if (newChecked) {
              newDesc = 'Đã hoàn thành lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } else {
              const defaultItem = [...this.tasksByPeriod['today'], ...this.tasksByPeriod['week'], ...this.tasksByPeriod['month']].find(x => x.id === id);
              newDesc = defaultItem ? defaultItem.desc : t.desc;
            }
            return { ...t, checked: newChecked, desc: newDesc };
          }
          return t;
        })
      );
      localStorage.setItem('webee_dashboard_tasks_' + this.selectedPeriod(), JSON.stringify(this.currentTasks()));
    }
  }
}
