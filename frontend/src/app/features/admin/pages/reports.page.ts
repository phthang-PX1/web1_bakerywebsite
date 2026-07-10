import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminApi, AdminAnalyticsOverview } from '../../../core/api/admin.api';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

interface ProductRanking {
  rank: number;
  productId: string;
  name: string;
  category: string;
  soldCount: number;
  stock: number;
  revenue: number;
  imageUrl: string;
}

interface PeriodData {
  label: string;
  dateRange: string;
  stats: {
    revenue: number;
    revenueDiff: string;
    revenuePercent: string;
    orders: number;
    categoriesCount: number;
    productsCount: number;
    customIngredientsCount: number;
    customersCount: number;
    customersActive: number;
    customersStatus: string;
    marketingEmails: number;
    marketingBlogs: number;
    marketingPercent: string;
  };
  trendRevenue: number[]; // 7 points
  trendOrders: number[]; // 7 points
  mediaBlogViews: number[]; // 7 points
  mediaEmailSubs: number[]; // 7 points
  topProducts: ProductRanking[];
  
  // Dynamic fields added for the rest of the cards/charts
  donutData: { category: string; percentage: number }[];
  loyaltyData: { totalGranted: number; totalRedeemed: number; avgFrequency: number };
  tierData: { tier: string; count: number; percentage: number }[];
  voucherData: { usedPercent: number; unusedPercent: number; expiredPercent: number };
}

const REPORT_MOCK_DATA: Record<string, PeriodData> = {
  'month': {
    label: 'Tháng này',
    dateRange: '01/07/2026 - 31/07/2026',
    stats: {
      revenue: 145280000,
      revenueDiff: '1,248 đơn hàng',
      revenuePercent: '+12.5%',
      orders: 1248,
      categoriesCount: 6,
      productsCount: 124,
      customIngredientsCount: 36,
      customersCount: 856,
      customersActive: 812,
      customersStatus: 'Ổn định',
      marketingEmails: 124,
      marketingBlogs: 24,
      marketingPercent: '+8.2%'
    },
    trendRevenue: [32, 45, 62, 85, 78, 112, 145],
    trendOrders: [280, 420, 540, 790, 710, 980, 1248],
    mediaBlogViews: [120, 150, 140, 190, 220, 310, 350],
    mediaEmailSubs: [80, 95, 110, 130, 125, 140, 155],
    donutData: [
      { category: 'Bánh Gato', percentage: 40 },
      { category: 'Bánh Tiramisu', percentage: 30 },
      { category: 'Mini Cakes', percentage: 14 },
      { category: 'Bánh Entremet', percentage: 10 },
      { category: 'Bánh Mousse', percentage: 6 }
    ],
    loyaltyData: { totalGranted: 124500, totalRedeemed: 45200, avgFrequency: 2.6 },
    tierData: [
      { tier: 'Member', count: 320, percentage: 37.3 },
      { tier: 'Bronze', count: 215, percentage: 25.1 },
      { tier: 'Silver', count: 168, percentage: 19.6 },
      { tier: 'Gold', count: 110, percentage: 12.8 },
      { tier: 'Diamond', count: 43, percentage: 5.0 }
    ],
    voucherData: { usedPercent: 52, unusedPercent: 36, expiredPercent: 12 },
    topProducts: [
      { rank: 1, productId: '1', name: 'Panacotta Táo xanh', category: 'Mini Cakes', soldCount: 312, stock: 45, revenue: 5928000, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&q=80' },
      { rank: 2, productId: '5', name: 'Tiramisu Classic', category: 'Bánh Tiramisu', soldCount: 211, stock: 12, revenue: 46842000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100&q=80' },
      { rank: 3, productId: '2', name: 'Bánh kem sữa tươi', category: 'Bánh Gato', soldCount: 142, stock: 15, revenue: 17040000, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80' },
      { rank: 4, productId: '6', name: 'Bánh bắp phô mai', category: 'Bánh Gato', soldCount: 95, stock: 18, revenue: 13300000, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=100&q=80' },
      { rank: 5, productId: '3', name: 'Strawberry Dream', category: 'Bánh Mousse', soldCount: 89, stock: 10, revenue: 38181000, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&q=80' }
    ]
  },
  '7days': {
    label: '7 ngày gần nhất',
    dateRange: '02/07/2026 - 08/07/2026',
    stats: {
      revenue: 32450000,
      revenueDiff: '280 đơn hàng',
      revenuePercent: '+5.4%',
      orders: 280,
      categoriesCount: 6,
      productsCount: 124,
      customIngredientsCount: 36,
      customersCount: 856,
      customersActive: 812,
      customersStatus: 'Tăng nhẹ',
      marketingEmails: 28,
      marketingBlogs: 4,
      marketingPercent: '+3.1%'
    },
    trendRevenue: [15, 22, 18, 26, 31, 35, 32],
    trendOrders: [120, 180, 150, 210, 250, 290, 280],
    mediaBlogViews: [45, 60, 52, 70, 85, 98, 92],
    mediaEmailSubs: [12, 18, 15, 22, 28, 30, 28],
    donutData: [
      { category: 'Bánh Gato', percentage: 35 },
      { category: 'Bánh Tiramisu', percentage: 25 },
      { category: 'Mini Cakes', percentage: 20 },
      { category: 'Bánh Entremet', percentage: 12 },
      { category: 'Bánh Mousse', percentage: 8 }
    ],
    loyaltyData: { totalGranted: 28400, totalRedeemed: 8900, avgFrequency: 1.1 },
    tierData: [
      { tier: 'Member', count: 85, percentage: 30.3 },
      { tier: 'Bronze', count: 75, percentage: 26.8 },
      { tier: 'Silver', count: 55, percentage: 19.6 },
      { tier: 'Gold', count: 40, percentage: 14.3 },
      { tier: 'Diamond', count: 25, percentage: 9.0 }
    ],
    voucherData: { usedPercent: 40, unusedPercent: 50, expiredPercent: 10 },
    topProducts: [
      { rank: 1, productId: '1', name: 'Panacotta Táo xanh', category: 'Mini Cakes', soldCount: 65, stock: 45, revenue: 1235000, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&q=80' },
      { rank: 2, productId: '5', name: 'Tiramisu Classic', category: 'Bánh Tiramisu', soldCount: 42, stock: 12, revenue: 9324000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100&q=80' },
      { rank: 3, productId: '2', name: 'Bánh kem sữa tươi', category: 'Bánh Gato', soldCount: 31, stock: 15, revenue: 3720000, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80' },
      { rank: 4, productId: '6', name: 'Bánh bắp phô mai', category: 'Bánh Gato', soldCount: 22, stock: 18, revenue: 3080000, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=100&q=80' },
      { rank: 5, productId: '3', name: 'Strawberry Dream', category: 'Bánh Mousse', soldCount: 18, stock: 10, revenue: 7722000, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&q=80' }
    ]
  },
  '30days': {
    label: '30 ngày gần nhất',
    dateRange: '09/06/2026 - 08/07/2026',
    stats: {
      revenue: 138650000,
      revenueDiff: '1,190 đơn hàng',
      revenuePercent: '+11.8%',
      orders: 1190,
      categoriesCount: 6,
      productsCount: 124,
      customIngredientsCount: 36,
      customersCount: 856,
      customersActive: 812,
      customersStatus: 'Ổn định',
      marketingEmails: 115,
      marketingBlogs: 20,
      marketingPercent: '+7.8%'
    },
    trendRevenue: [40, 58, 70, 92, 88, 115, 138],
    trendOrders: [310, 480, 590, 820, 780, 1020, 1190],
    mediaBlogViews: [100, 130, 122, 175, 200, 280, 310],
    mediaEmailSubs: [72, 88, 102, 118, 110, 125, 138],
    donutData: [
      { category: 'Bánh Gato', percentage: 38 },
      { category: 'Bánh Tiramisu', percentage: 28 },
      { category: 'Mini Cakes', percentage: 16 },
      { category: 'Bánh Entremet', percentage: 11 },
      { category: 'Bánh Mousse', percentage: 7 }
    ],
    loyaltyData: { totalGranted: 118200, totalRedeemed: 41500, avgFrequency: 2.4 },
    tierData: [
      { tier: 'Member', count: 290, percentage: 33.9 },
      { tier: 'Bronze', count: 210, percentage: 24.5 },
      { tier: 'Silver', count: 160, percentage: 18.7 },
      { tier: 'Gold', count: 105, percentage: 12.3 },
      { tier: 'Diamond', count: 41, percentage: 4.8 }
    ],
    voucherData: { usedPercent: 48, unusedPercent: 40, expiredPercent: 12 },
    topProducts: [
      { rank: 1, productId: '1', name: 'Panacotta Táo xanh', category: 'Mini Cakes', soldCount: 295, stock: 45, revenue: 5605000, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&q=80' },
      { rank: 2, productId: '5', name: 'Tiramisu Classic', category: 'Bánh Tiramisu', soldCount: 198, stock: 12, revenue: 43956000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100&q=80' },
      { rank: 3, productId: '2', name: 'Bánh kem sữa tươi', category: 'Bánh Gato', soldCount: 135, stock: 15, revenue: 16200000, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80' },
      { rank: 4, productId: '6', name: 'Bánh bắp phô mai', category: 'Bánh Gato', soldCount: 90, stock: 18, revenue: 12600000, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=100&q=80' },
      { rank: 5, productId: '3', name: 'Strawberry Dream', category: 'Bánh Mousse', soldCount: 82, stock: 10, revenue: 35178000, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&q=80' }
    ]
  },
  'quarter': {
    label: 'Quý này',
    dateRange: '01/04/2026 - 30/06/2026',
    stats: {
      revenue: 425180000,
      revenueDiff: '3,658 đơn hàng',
      revenuePercent: '+15.2%',
      orders: 3658,
      categoriesCount: 6,
      productsCount: 124,
      customIngredientsCount: 36,
      customersCount: 856,
      customersActive: 812,
      customersStatus: 'Tăng trưởng',
      marketingEmails: 384,
      marketingBlogs: 72,
      marketingPercent: '+18.5%'
    },
    trendRevenue: [95, 140, 195, 260, 235, 340, 425],
    trendOrders: [810, 1220, 1680, 2410, 2180, 3050, 3658],
    mediaBlogViews: [310, 420, 390, 520, 610, 840, 920],
    mediaEmailSubs: [210, 260, 290, 350, 330, 380, 415],
    donutData: [
      { category: 'Bánh Gato', percentage: 42 },
      { category: 'Bánh Tiramisu', percentage: 32 },
      { category: 'Mini Cakes', percentage: 12 },
      { category: 'Bánh Entremet', percentage: 9 },
      { category: 'Bánh Mousse', percentage: 5 }
    ],
    loyaltyData: { totalGranted: 365000, totalRedeemed: 120400, avgFrequency: 3.2 },
    tierData: [
      { tier: 'Member', count: 450, percentage: 36.6 },
      { tier: 'Bronze', count: 320, percentage: 26.0 },
      { tier: 'Silver', count: 240, percentage: 19.5 },
      { tier: 'Gold', count: 160, percentage: 13.0 },
      { tier: 'Diamond', count: 60, percentage: 4.9 }
    ],
    voucherData: { usedPercent: 58, unusedPercent: 32, expiredPercent: 10 },
    topProducts: [
      { rank: 1, productId: '1', name: 'Panacotta Táo xanh', category: 'Mini Cakes', soldCount: 920, stock: 45, revenue: 17480000, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&q=80' },
      { rank: 2, productId: '5', name: 'Tiramisu Classic', category: 'Bánh Tiramisu', soldCount: 615, stock: 12, revenue: 136530000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100&q=80' },
      { rank: 3, productId: '2', name: 'Bánh kem sữa tươi', category: 'Bánh Gato', soldCount: 420, stock: 15, revenue: 50400000, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80' },
      { rank: 4, productId: '6', name: 'Bánh bắp phô mai', category: 'Bánh Gato', soldCount: 310, stock: 18, revenue: 43400000, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=100&q=80' },
      { rank: 5, productId: '3', name: 'Strawberry Dream', category: 'Bánh Mousse', soldCount: 260, stock: 10, revenue: 111540000, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&q=80' }
    ]
  },
  'year': {
    label: 'Năm nay',
    dateRange: '01/01/2026 - 31/12/2026',
    stats: {
      revenue: 1680540000,
      revenueDiff: '14,280 đơn hàng',
      revenuePercent: '+22.4%',
      orders: 14280,
      categoriesCount: 6,
      productsCount: 124,
      customIngredientsCount: 36,
      customersCount: 856,
      customersActive: 812,
      customersStatus: 'Tăng mạnh',
      marketingEmails: 1520,
      marketingBlogs: 280,
      marketingPercent: '+34.2%'
    },
    trendRevenue: [320, 510, 730, 990, 890, 1280, 1680],
    trendOrders: [2900, 4800, 6700, 9200, 8400, 11500, 14280],
    mediaBlogViews: [1100, 1450, 1380, 1850, 2100, 2900, 3400],
    mediaEmailSubs: [750, 920, 1010, 1250, 1180, 1360, 1520],
    donutData: [
      { category: 'Bánh Gato', percentage: 45 },
      { category: 'Bánh Tiramisu', percentage: 30 },
      { category: 'Mini Cakes', percentage: 10 },
      { category: 'Bánh Entremet', percentage: 8 },
      { category: 'Bánh Mousse', percentage: 7 }
    ],
    loyaltyData: { totalGranted: 1480000, totalRedeemed: 512000, avgFrequency: 4.8 },
    tierData: [
      { tier: 'Member', count: 856, percentage: 39.8 },
      { tier: 'Bronze', count: 520, percentage: 24.2 },
      { tier: 'Silver', count: 380, percentage: 17.7 },
      { tier: 'Gold', count: 260, percentage: 12.1 },
      { tier: 'Diamond', count: 95, percentage: 4.2 }
    ],
    voucherData: { usedPercent: 65, unusedPercent: 25, expiredPercent: 10 },
    topProducts: [
      { rank: 1, productId: '1', name: 'Panacotta Táo xanh', category: 'Mini Cakes', soldCount: 3680, stock: 45, revenue: 69920000, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&q=80' },
      { rank: 2, productId: '5', name: 'Tiramisu Classic', category: 'Bánh Tiramisu', soldCount: 2450, stock: 12, revenue: 543900000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100&q=80' },
      { rank: 3, productId: '2', name: 'Bánh kem sữa tươi', category: 'Bánh Gato', soldCount: 1680, stock: 15, revenue: 201600000, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80' },
      { rank: 4, productId: '6', name: 'Bánh bắp phô mai', category: 'Bánh Gato', soldCount: 1240, stock: 18, revenue: 173600000, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=100&q=80' },
      { rank: 5, productId: '3', name: 'Strawberry Dream', category: 'Bánh Mousse', soldCount: 1050, stock: 10, revenue: 450450000, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&q=80' }
    ]
  }
};

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CurrencyVndPipe, FormsModule, RouterLink],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      
      <!-- Top Title and Filters Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0 0 6px;">
            Báo cáo & Thống kê
          </h1>
          <p style="margin: 0; font-size: 14.5px; color: #7a6555; font-weight: 500;">
            Tổng hợp toàn diện doanh thu, hiệu suất đơn hàng, truyền thông và chỉ số khách hàng thân thiết
          </p>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; position: relative;">
          <!-- Calendar Selector using asset Icon -->
          <div style="position: relative; display: inline-flex; align-items: center;">
            <img src="assets/icons/payment-calendar.png" style="position: absolute; left: 12px; width: 16px; height: 16px; object-fit: contain; pointer-events: none;" />
            <select 
              [ngModel]="selectedPeriod()" 
              (ngModelChange)="selectedPeriod.set($event); onPeriodChange()"
              style="padding: 10px 14px 10px 36px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; cursor: pointer; outline: none; min-width: 250px;"
            >
              <option value="month">Tháng này ({{ getPeriodLabel('month') }})</option>
              <option value="7days">7 ngày gần nhất</option>
              <option value="30days">30 ngày gần nhất</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>

          <!-- Export Dropdown -->
          <div style="position: relative;">
            <button 
              (click)="toggleExportDropdown()"
              style="background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 11px 20px; border-radius: 10px; cursor: pointer; font-size: 13.5px; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
              onmouseover="this.style.background='#e5b832'"
              onmouseout="this.style.background='#f5c842'"
            >
              <!-- Clean SVG download icon matching sidebar design -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Xuất dữ liệu <span style="font-size: 10px; transform: scale(0.85);">▼</span>
            </button>

            <!-- Dropdown Options -->
            @if (showExportOptions()) {
              <div 
                style="position: absolute; right: 0; top: 46px; background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 10px; box-shadow: 0 4px 12px rgba(43,26,15,0.08); z-index: 100; min-width: 200px; overflow: hidden;"
              >
                <div 
                  (click)="triggerExport('xlsx')"
                  style="padding: 11px 16px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; cursor: pointer; border-bottom: 1px solid #f3ece3; transition: background 0.12s;"
                  onmouseover="this.style.background='#fffbf7'"
                  onmouseout="this.style.background='transparent'"
                >
                  Định dạng: Excel (.xlsx)
                </div>
                <div 
                  (click)="triggerExport('csv')"
                  style="padding: 11px 16px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; cursor: pointer; transition: background 0.12s;"
                  onmouseover="this.style.background='#fffbf7'"
                  onmouseout="this.style.background='transparent'"
                >
                  CSV File
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Part 1: Four Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
        
        <!-- Doanh số hệ thống -->
        <div class="dashboard-card" style="padding: 20px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="background: #fff8f0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #f6eaba;">
              <img src="assets/icons/order-thanhtoan.png" style="width: 18px; height: 18px; object-fit: contain;" />
            </div>
            <span 
              style="font-size: 11.5px; font-weight: 800; color: #16a34a; background: #e8fdf0; padding: 2px 8px; border-radius: 99px; border: 1px solid #bbf7d0;"
            >
              {{ currentData().stats.revenuePercent }}
            </span>
          </div>

          <span style="font-size: 12px; text-transform: uppercase; color: #7a6555; font-weight: 700; display: block; margin-bottom: 4px; letter-spacing: 0.05em;">Doanh số hệ thống</span>
          <strong style="font-size: 26px; color: #2b1a0f; font-weight: 800; font-family: 'Fraunces', serif;">
            {{ currentData().stats.revenue | currencyVnd }}
          </strong>
          <span style="font-size: 12.5px; color: #7a6555; font-weight: 500; display: block; margin-top: 4px;">
            Tổng: {{ currentData().stats.orders }} đơn hàng
          </span>
        </div>

        <!-- Danh mục sản phẩm -->
        <div class="dashboard-card" style="padding: 20px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="background: #fffbf7; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #ede8e2;">
              <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 19px; height: 20px;">
                <path d="M3.5 9L9 0L14.5 9H3.5V9M14.5 20C13.25 20 12.1875 19.5625 11.3125 18.6875C10.4375 17.8125 10 16.75 10 15.5C10 14.25 10.4375 13.1875 11.3125 12.3125C12.1875 11.4375 13.25 11 14.5 11C15.75 11 16.8125 11.4375 17.6875 12.3125C18.5625 13.1875 19 14.25 19 15.5C19 16.75 18.5625 17.8125 17.6875 18.6875C16.8125 19.5625 15.75 20 14.5 20V20M0 19.5V11.5H8V19.5H0V19.5M14.5 18C15.2 18 15.7917 17.7583 16.275 17.275C16.7583 16.7917 17 16.2 17 15.5C17 14.8 16.7583 14.2083 16.275 13.725C15.7917 13.2417 15.2 13 14.5 13C13.8 13 13.2083 13.2417 12.725 13.725C12.2417 14.2083 12 14.8 12 15.5C12 16.2 12.2417 16.7917 12.725 17.275C13.2083 17.7583 13.8 18 14.5 18V18M2 17.5H6V13.5H2V17.5V17.5M7.05 7H10.95L9 3.85L7.05 7V7M9 7V7V7V7V7M6 13.5V13.5V13.5V13.5V13.5V13.5M14.5 15.5V15.5V15.5V15.5V15.5V15.5V15.5V15.5V15.5V15.5" fill="#c96a2e"/>
              </svg>
            </div>
            <span 
              style="font-size: 11.5px; font-weight: 800; color: #16a34a; background: #e8fdf0; padding: 2px 8px; border-radius: 99px; border: 1px solid #bbf7d0;"
            >
              +4
            </span>
          </div>

          <span style="font-size: 12px; text-transform: uppercase; color: #7a6555; font-weight: 700; display: block; margin-bottom: 4px; letter-spacing: 0.05em;">Danh mục sản phẩm</span>
          <strong style="font-size: 26px; color: #2b1a0f; font-weight: 800; font-family: 'Fraunces', serif;">
            {{ currentData().stats.categoriesCount }} Danh mục
          </strong>
          <span style="font-size: 12.5px; color: #7a6555; font-weight: 500; display: block; margin-top: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            Tổng số {{ currentData().stats.productsCount }} sản phẩm đang bán
          </span>
        </div>

        <!-- Tổng lượng khách hàng -->
        <div class="dashboard-card" style="padding: 20px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="background: #fffbf7; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #ede8e2;">
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 22px; height: 11px;">
                <path d="M0 12V10.425C0 9.70833 0.366667 9.125 1.1 8.675C1.83333 8.225 2.8 8 4 8C4.21667 8 4.425 8.00417 4.625 8.0125C4.825 8.02083 5.01667 8.04167 5.2 8.075C4.96667 8.425 4.79167 8.79167 4.675 9.175C4.55833 9.55833 4.5 9.95833 4.5 10.375V12H0ZM6 12V10.375C6 9.84167 6.14583 9.35417 6.4375 8.9125C6.72917 8.47083 7.14167 8.08333 7.675 7.75C8.20833 7.41667 8.84583 7.16667 9.5875 7C10.3292 6.83333 11.1333 6.75 12 6.75C12.8833 6.75 13.6958 6.83333 14.4375 7C15.1792 7.16667 15.8167 7.41667 16.35 7.75C16.8833 8.08333 17.2917 8.47083 17.575 8.9125C17.8583 9.35417 18 9.84167 18 10.375V12H6ZM19.5 12V10.375C19.5 9.94167 19.4458 9.53333 19.3375 9.15C19.2292 8.76667 19.0667 8.40833 18.85 8.075C19.0333 8.04167 19.2208 8.02083 19.4125 8.0125C19.6042 8.00417 19.8 8 20 8C21.2 8 22.1667 8.22083 22.9 8.6625C23.6333 9.10417 24 9.69167 24 10.425V12H19.5ZM8.125 10H15.9C15.7333 9.66667 15.2708 9.375 14.5125 9.125C13.7542 8.875 12.9167 8.75 12 8.75C11.0833 8.75 10.2458 8.875 9.4875 9.125C8.72917 9.375 8.275 9.66667 8.125 10ZM4 7C3.45 7 2.97917 6.80417 2.5875 6.4125C2.19583 6.02083 2 5.55 2 5C2 4.43333 2.19583 3.95833 2.5875 3.575C2.97917 3.19167 3.45 3 4 3C4.56667 3 5.04167 3.19167 5.425 3.575C5.80833 3.95833 6 4.43333 6 5C6 5.55 5.80833 6.02083 5.425 6.4125C5.04167 6.80417 4.56667 7 4 7ZM20 7C19.45 7 18.9792 6.80417 18.5875 6.4125C18.1958 6.02083 18 5.55 18 5C18 4.43333 18.1958 3.95833 18.5875 3.575C18.9792 3.19167 19.45 3 20 3C20.5667 3 21.0417 3.19167 21.425 3.575C21.8083 3.95833 22 4.43333 22 5C22 5.55 21.8083 6.02083 21.425 6.4125C21.0417 6.80417 20.5667 7 20 7ZM12 6C11.1667 6 10.4583 5.70833 9.875 5.125C9.29167 4.54167 9 3.83333 9 3C9 2.15 9.29167 1.4375 9.875 0.8625C10.4583 0.2875 11.1667 0 12 0C12.85 0 13.5625 0.2875 14.1375 0.8625C14.7125 1.4375 15 2.15 15 3C15 3.83333 14.7125 4.54167 14.1375 5.125C13.5625 5.70833 12.85 6 12 6ZM12 4C12.2833 4 12.5208 3.90417 12.7125 3.7125C12.9042 3.52083 13 3.28333 13 3C13 2.71667 12.9042 2.47917 12.7125 2.2875C12.5208 2.09583 12.2833 2 12 2C11.7167 2 11.4792 2.09583 11.2875 2.2875C11.0958 2.47917 11 2.71667 11 3C11 3.28333 11.0958 3.52083 11.2875 3.7125C11.4792 3.90417 11.7167 4 12 4Z" fill="#c96a2e"/>
              </svg>
            </div>
            <span 
              style="font-size: 11.5px; font-weight: 800; color: #c2410c; background: #fff7ed; padding: 2px 8px; border-radius: 99px; border: 1px solid #fed7aa;"
            >
              {{ currentData().stats.customersStatus }}
            </span>
          </div>

          <span style="font-size: 12px; text-transform: uppercase; color: #7a6555; font-weight: 700; display: block; margin-bottom: 4px; letter-spacing: 0.05em;">Tổng lượng khách hàng</span>
          <strong style="font-size: 26px; color: #2b1a0f; font-weight: 800; font-family: 'Fraunces', serif;">
            {{ currentData().stats.customersCount }} thành viên
          </strong>
          <span style="font-size: 12.5px; color: #7a6555; font-weight: 500; display: block; margin-top: 4px;">
            Đang hoạt động trên hệ thống
          </span>
        </div>

        <!-- Chỉ số Marketing -->
        <div class="dashboard-card" style="padding: 20px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="background: #fffbf7; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #ede8e2;">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 18px; height: 14px;">
                <path d="M16 9V7H20V9H16V9M17.2 16L14 13.6L15.2 12L18.4 14.4L17.2 16V16M15.2 4L14 2.4L17.2 0L18.4 1.6L15.2 4V4M3 15V11H2C1.45 11 0.979167 10.8042 0.5875 10.4125C0.195833 10.0208 0 9.55 0 9V7C0 6.45 0.195833 5.97917 0.5875 5.5875C0.979167 5.19583 1.45 5 2 5H6L11 2V14L6 11H5V15H3V15M9 10.45V5.55L6.55 7H2V7V7V9V9V9H6.55L9 10.45V10.45M12 11.35V4.65C12.45 5.05 12.8125 5.5375 13.0875 6.1125C13.3625 6.6875 13.5 7.31667 13.5 8C13.5 8.68333 13.3625 9.3125 13.0875 9.8875C12.8125 10.4625 12.45 10.95 12 11.35V11.35M5.5 8V8V8V8V8V8V8V8V8V8V8V8" fill="#c96a2e"/>
              </svg>
            </div>
            <span 
              style="font-size: 11.5px; font-weight: 800; color: #16a34a; background: #e8fdf0; padding: 2px 8px; border-radius: 99px; border: 1px solid #bbf7d0;"
            >
              {{ currentData().stats.marketingPercent }}
            </span>
          </div>

          <span style="font-size: 12px; text-transform: uppercase; color: #7a6555; font-weight: 700; display: block; margin-bottom: 4px; letter-spacing: 0.05em;">Chỉ số Marketing</span>
          <strong style="font-size: 26px; color: #2b1a0f; font-weight: 800; font-family: 'Fraunces', serif;">
            {{ currentData().stats.marketingEmails }} email nhận
          </strong>
          <span style="font-size: 12.5px; color: #7a6555; font-weight: 500; display: block; margin-top: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            {{ currentData().stats.marketingBlogs }} bài viết blog đã phát hành
          </span>
        </div>

      </div>

      <!-- Part 2: Charts Row 1 (Xu hướng & Tỷ trọng) -->
      <div style="display: grid; grid-template-columns: 1.7fr 1fr; gap: 24px; margin-bottom: 24px; align-items: start; flex-wrap: wrap;">
        
        <!-- Line Chart: Xu hướng Doanh thu & Đơn hàng -->
        <div class="dashboard-card" style="padding: 24px; position: relative;">
          <!-- Overlay disclaimer -->
          <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
            <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Biểu đồ xu hướng chưa khả dụng</span>
            <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Số liệu tạm ẩn do Backend chưa hỗ trợ cung cấp API dữ liệu chuỗi thời gian (time-series).</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">
              Xu hướng Doanh thu & Đơn hàng
            </h3>
            
            <div style="display: flex; gap: 14px; font-size: 12.5px; font-weight: 700;">
              <span style="display: flex; align-items: center; gap: 6px; color: #c96a2e;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #f5c842; display: inline-block;"></span> Doanh thu
              </span>
              <span style="display: flex; align-items: center; gap: 6px; color: #2563eb;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span> Đơn hàng
              </span>
            </div>
          </div>

          <!-- SVG Chart Area -->
          <div style="position: relative; height: 200px; width: 100%;">
            <svg style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <!-- Area Fill Gradients -->
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f5c842" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#f5c842" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Grid Horizontal Lines -->
              <line x1="0" y1="30" x2="100%" y2="30" stroke="#f3ece3" stroke-width="1" />
              <line x1="0" y1="80" x2="100%" y2="80" stroke="#f3ece3" stroke-width="1" />
              <line x1="0" y1="130" x2="100%" y2="130" stroke="#f3ece3" stroke-width="1" />
              <line x1="0" y1="170" x2="100%" y2="170" stroke="#ede8e2" stroke-width="1.5" />

              <!-- Render Revenue Area & Lines -->
              <path [attr.d]="revenuePath().fill" fill="url(#revGrad)" />
              <path [attr.d]="revenuePath().line" fill="none" stroke="#f5c842" stroke-width="3.5" stroke-linecap="round" />

              <!-- Render Orders Area & Lines -->
              <path [attr.d]="ordersPath().fill" fill="url(#ordGrad)" />
              <path [attr.d]="ordersPath().line" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />

              <!-- Dots and hover points -->
              @for (pt of points().revenue; track $index) {
                <circle 
                  [attr.cx]="pt.x" 
                  [attr.cy]="pt.y" 
                  r="5" 
                  fill="#ffffff" 
                  stroke="#f5c842" 
                  stroke-width="2.5" 
                  style="cursor: pointer; transition: r 0.15s;"
                  (mouseenter)="hoveredRevIndex.set($index)"
                  (mouseleave)="hoveredRevIndex.set(-1)"
                />
                
                <!-- Rev Tooltip -->
                @if (hoveredRevIndex() === $index) {
                  <rect 
                    [attr.x]="pt.x - 45" 
                    [attr.y]="pt.y - 36" 
                    width="90" 
                    height="24" 
                    rx="6" 
                    fill="#2b1a0f" 
                  />
                  <text 
                    [attr.x]="pt.x" 
                    [attr.y]="pt.y - 20" 
                    fill="#ffffff" 
                    font-size="11" 
                    font-weight="700" 
                    text-anchor="middle"
                  >
                    {{ pt.val }}tr VNĐ
                  </text>
                }
              }

              @for (pt of points().orders; track $index) {
                <circle 
                  [attr.cx]="pt.x" 
                  [attr.cy]="pt.y" 
                  r="4" 
                  fill="#ffffff" 
                  stroke="#3b82f6" 
                  stroke-width="2" 
                  style="cursor: pointer;"
                  (mouseenter)="hoveredOrdIndex.set($index)"
                  (mouseleave)="hoveredOrdIndex.set(-1)"
                />

                <!-- Ord Tooltip -->
                @if (hoveredOrdIndex() === $index) {
                  <rect 
                    [attr.x]="pt.x - 35" 
                    [attr.y]="pt.y - 36" 
                    width="70" 
                    height="24" 
                    rx="6" 
                    fill="#2b1a0f" 
                  />
                  <text 
                    [attr.x]="pt.x" 
                    [attr.y]="pt.y - 20" 
                    fill="#ffffff" 
                    font-size="11" 
                    font-weight="700" 
                    text-anchor="middle"
                  >
                    {{ pt.val }} ĐH
                  </text>
                }
              }
            </svg>
          </div>

          <!-- X axis labels -->
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #7a6555; font-weight: 700; padding: 0 10px;">
            <span>T1</span>
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
          </div>

        </div>

        <!-- Donut Chart: Tỷ trọng doanh thu danh mục -->
        <div class="dashboard-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; position: relative;">
          <!-- Overlay disclaimer -->
          <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
            <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Phân bổ danh mục chưa khả dụng</span>
            <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Dữ liệu tỷ trọng danh mục doanh thu tạm ẩn do Backend chưa hỗ trợ thống kê phân bổ.</span>
          </div>
          <h3 style="margin: 0 0 18px; font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">
            Tỷ trọng doanh thu danh mục
          </h3>

          <!-- Donut Circle Visual -->
          <div style="position: relative; width: 150px; height: 150px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg width="100%" height="100%" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
              <!-- Total Categories Ring -->
              <circle cx="80" cy="80" r="60" fill="none" stroke="#f3ece3" stroke-width="18" />

              <!-- Render rings based on computed donutRings -->
              @for (ring of donutRings(); track ring.category) {
                <circle cx="80" cy="80" r="60" fill="none" [attr.stroke]="ring.color" stroke-width="18" 
                  [attr.stroke-dasharray]="ring.dashArray" 
                  [attr.stroke-dashoffset]="ring.dashOffset"
                  style="cursor: pointer; transition: stroke-width 0.15s;"
                  (click)="highlightCategory(ring.category + ' (' + ring.percentage + '%)')"
                />
              }
            </svg>
            <div style="position: absolute; text-align: center; pointer-events: none;">
              <strong style="font-size: 20px; font-weight: 800; color: #2b1a0f;">5</strong>
              <div style="font-size: 11px; color: #7a6555; font-weight: 600; text-transform: uppercase;">Danh mục</div>
            </div>
          </div>

          <!-- Highlight label -->
          @if (activeCategoryText()) {
            <p style="text-align: center; font-size: 13.5px; font-weight: 800; color: #c96a2e; margin: 0 0 10px;">
              {{ activeCategoryText() }}
            </p>
          }

          <!-- Legend details list (dynamic) -->
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 600;">
            @for (ring of donutRings(); track ring.category) {
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span [style.background]="ring.color" style="width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
                  {{ ring.category }}
                </span>
                <strong>{{ ring.percentage }}%</strong>
              </div>
            }
          </div>

        </div>
      </div>

      <!-- Part 3: Charts Row 2 (Tích điểm & Hạng thành viên) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
        
        <!-- Chỉ số Tích điểm thành viên -->
        <div class="dashboard-card" style="padding: 24px; position: relative;">
          <!-- Overlay disclaimer -->
          <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
            <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Chỉ số tích điểm chưa khả dụng</span>
            <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Dữ liệu tích điểm thành viên tạm ẩn do Backend chưa cung cấp API thống kê điểm thưởng.</span>
          </div>
          <h3 style="margin: 0 0 20px; font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">
            Chỉ số Tích điểm thành viên
          </h3>

          <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 700; margin-bottom: 6px;">
                <span style="color: #7a6555;">Tổng điểm hệ thống đã cấp</span>
                <span style="color: #2b1a0f; font-weight: 800;">{{ loyaltyStats().totalGranted.toLocaleString('vi-VN') }}</span>
              </div>
              <div style="height: 10px; background: #f3ece3; border-radius: 99px; overflow: hidden; width: 100%;">
                <div style="height: 100%; background: #5c381d; border-radius: 99px; width: 100%;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 700; margin-bottom: 6px;">
                <span style="color: #7a6555;">Điểm đã quy đổi thành voucher</span>
                <span style="color: #2b1a0f; font-weight: 800;">{{ loyaltyStats().totalRedeemed.toLocaleString('vi-VN') }}</span>
              </div>
              <div style="height: 10px; background: #f3ece3; border-radius: 99px; overflow: hidden; width: 100%;">
                <div style="height: 100%; background: #f5c842; border-radius: 99px;" [style.width]="loyaltyStats().ratioPercent"></div>
              </div>
            </div>
          </div>

          <div style="background: #fffcf9; border: 1.5px solid #ede8e2; border-radius: 10px; padding: 12px 16px; font-size: 13.5px; font-weight: 600; color: #7a6555; display: flex; align-items: center;">
            <img src="assets/icons/account-tichdiem.png" style="width: 18px; height: 18px; object-fit: contain; margin-right: 6px;" />
            Tần suất tích điểm trung bình: &nbsp;<strong style="color: #2b1a0f;">{{ loyaltyStats().avgFrequency }} điểm/khách</strong>
          </div>
        </div>

        <!-- Cơ cấu Hạng Thành viên Thân thiết (Cột) -->
        <div class="dashboard-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; position: relative;">
          <!-- Overlay disclaimer -->
          <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
            <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Cơ cấu hạng thành viên chưa khả dụng</span>
            <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Số liệu phân bổ hạng thành viên tạm ẩn do Backend chưa cung cấp API phân hạng khách hàng.</span>
          </div>
          <h3 style="margin: 0 0 16px; font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">
            Cơ cấu Hạng Thành viên Thân thiết
          </h3>

          <!-- Bar Columns Container -->
          <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 140px; border-bottom: 2px solid #ede8e2; padding-bottom: 4px; margin-bottom: 12px;">
            @for (bar of tierBars(); track bar.tier) {
              <div 
                (click)="highlightTier(bar.tier + ': ' + bar.count + ' thành viên (' + bar.percentage + '%)')"
                [style.height]="bar.heightPercent"
                [style.background]="bar.color"
                [style.border]="'1.5px solid ' + bar.border"
                style="width: 40px; border-radius: 6px 6px 0 0; cursor: pointer; transition: opacity 0.15s;"
                onmouseover="this.style.opacity='0.85'"
                onmouseout="this.style.opacity='1'"
              ></div>
            }
          </div>

          <!-- Bottom Label details -->
          <div style="display: flex; justify-content: space-around; font-size: 11.5px; font-weight: 700; color: #7a6555; text-align: center;">
            @for (bar of tierBars(); track bar.tier) {
              <span style="width: 40px;">{{ bar.tier }}</span>
            }
          </div>

          @if (activeTierText()) {
            <p style="text-align: center; font-size: 12.5px; font-weight: 800; color: #c96a2e; margin: 10px 0 0;">
              {{ activeTierText() }}
            </p>
          }

        </div>
      </div>

      <!-- Part 4: Charts Row 3 (Sử dụng Voucher & Kênh truyền thông) -->
      <div style="display: grid; grid-template-columns: 1fr 1.7fr; gap: 24px; margin-bottom: 24px; align-items: start; flex-wrap: wrap;">
        
        <!-- Tỷ lệ sử dụng Voucher -->
        <div class="dashboard-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; position: relative;">
          <!-- Overlay disclaimer -->
          <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
            <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Tỷ lệ dùng Voucher chưa khả dụng</span>
            <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Dữ liệu tỷ lệ sử dụng voucher tạm ẩn do Backend chưa cung cấp API thống kê voucher.</span>
          </div>
          <h3 style="margin: 0 0 16px; font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">
            Tỷ lệ sử dụng Voucher
          </h3>

          <!-- Round Pie Representation -->
          <div style="position: relative; width: 140px; height: 140px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg width="100%" height="100%" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
              <!-- Grey Base (Hết hạn) -->
              <circle cx="80" cy="80" r="50" fill="none" stroke="#e5e7eb" stroke-width="32" />
              
              <!-- Yellow Lite (Chưa sử dụng) -->
              <circle cx="80" cy="80" r="50" fill="none" stroke="#fff1c5" stroke-width="32" 
                [attr.stroke-dasharray]="voucherRings().unusedDash" 
                [attr.stroke-dashoffset]="voucherRings().unusedOffset"
              />

              <!-- Yellow Active (Đã sử dụng) -->
              <circle cx="80" cy="80" r="50" fill="none" stroke="#f5c842" stroke-width="32" 
                [attr.stroke-dasharray]="voucherRings().usedDash" 
                stroke-dashoffset="0"
              />
            </svg>
          </div>

          <!-- Labels and descriptions -->
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 600;">
            <div style="display: flex; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f5c842; display: inline-block;"></span> Đã sử dụng</span>
              <strong>{{ voucherRings().usedPercent }}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #fff1c5; display: inline-block;"></span> Chưa sử dụng</span>
              <strong>{{ voucherRings().unusedPercent }}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #e5e7eb; display: inline-block;"></span> Hết hạn</span>
              <strong>{{ voucherRings().expiredPercent }}%</strong>
            </div>
          </div>
        </div>

        <!-- Hiệu suất Kênh truyền thông (Line Chart) -->
        <div class="dashboard-card" style="padding: 24px; position: relative;">
          <!-- Overlay disclaimer -->
          <div style="position: absolute; inset: 0; background: rgba(253, 251, 245, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 10; border-radius: 16px;">
            <span style="font-weight: 700; color: #7a6555; font-size: 14px; margin-bottom: 4px;">Biểu đồ kênh truyền thông chưa khả dụng</span>
            <span style="font-size: 12px; color: #a18c7e; max-width: 320px;">Biểu đồ hiệu suất tiếp thị tạm ẩn do Backend chưa cung cấp API thống kê kênh marketing.</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">
              Hiệu suất Kênh truyền thông
            </h3>
            
            <div style="display: flex; gap: 14px; font-size: 12.5px; font-weight: 700;">
              <span style="display: flex; align-items: center; gap: 6px; color: #2563eb;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span> Lượt xem bài viết Blog
              </span>
              <span style="display: flex; align-items: center; gap: 6px; color: #d97706;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #f5c842; display: inline-block;"></span> Đăng ký Email bản tin
              </span>
            </div>
          </div>

          <!-- SVG Chart Area -->
          <div style="position: relative; height: 170px; width: 100%;">
            <svg style="width: 100%; height: 100%; overflow: visible;">
              <!-- Grid Horizontal Lines -->
              <line x1="0" y1="20" x2="100%" y2="20" stroke="#f3ece3" stroke-width="1" />
              <line x1="0" y1="70" x2="100%" y2="70" stroke="#f3ece3" stroke-width="1" />
              <line x1="0" y1="120" x2="100%" y2="120" stroke="#f3ece3" stroke-width="1" />
              <line x1="0" y1="150" x2="100%" y2="150" stroke="#ede8e2" stroke-width="1.5" />

              <!-- Render Media lines -->
              <path [attr.d]="mediaPath().blogLine" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
              <path [attr.d]="mediaPath().emailLine" fill="none" stroke="#f5c842" stroke-width="2.5" stroke-dasharray="5,5" stroke-linecap="round" />

              <!-- Dots -->
              @for (pt of mediaPoints().blogs; track $index) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#3b82f6" />
              }
              @for (pt of mediaPoints().emails; track $index) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#f5c842" />
              }
            </svg>
          </div>

          <!-- X axis days labels -->
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #7a6555; font-weight: 700; padding: 0 10px;">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>
        </div>

      </div>

      <!-- Part 5: Top 5 Bán Chạy Nhất (Table) -->
      <div class="dashboard-card" style="padding: 24px;">
        <h3 style="margin: 0 0 18px; font-family: 'Fraunces', serif; font-size: 18px; font-weight: 800; color: #2b1a0f;">
          Top 5 Sản phẩm bán chạy nhất
        </h3>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14.5px;">
            <thead>
              <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; width: 60px; text-align: center;">STT</th>
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; width: 80px;">Hình ảnh</th>
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em;">Tên sản phẩm</th>
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; width: 160px;">Danh mục</th>
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; text-align: center; width: 110px;">Đã bán</th>
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; text-align: center; width: 110px;">Tồn kho</th>
                <th style="padding: 12px 14px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; text-align: right; width: 150px;">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of currentData().topProducts; track prod.productId) {
                <tr 
                  style="border-bottom: 1px solid #f3ece3; transition: background 0.15s;"
                  onmouseover="this.style.background='#fffcf9'"
                  onmouseout="this.style.background='transparent'"
                >
                  <!-- STT -->
                  <td style="padding: 14px; vertical-align: middle; text-align: center; color: #7a6555; font-weight: 700;">
                    0{{ prod.rank }}
                  </td>

                  <!-- Hình ảnh -->
                  <td style="padding: 10px 14px; vertical-align: middle;">
                    <div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; border: 1.5px solid #ede8e2; background: #ffffff;">
                      <img [src]="prod.imageUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                  </td>

                  <!-- Tên sản phẩm -->
                  <td style="padding: 14px; vertical-align: middle;">
                    <a 
                      [routerLink]="['/admin/products', prod.productId]" 
                      style="font-weight: 800; color: #2b1a0f; text-decoration: none;"
                      onmouseover="this.style.color='#c96a2e'; this.style.textDecoration='underline';"
                      onmouseout="this.style.color='#2b1a0f'; this.style.textDecoration='none';"
                    >
                      {{ prod.name }}
                    </a>
                  </td>

                  <!-- Danh mục -->
                  <td style="padding: 14px; vertical-align: middle; color: #7a6555; font-weight: 600;">
                    {{ prod.category }}
                  </td>

                  <!-- Đã bán -->
                  <td style="padding: 14px; vertical-align: middle; text-align: center; font-weight: 700; color: #2b1a0f;">
                    {{ prod.soldCount }}
                  </td>

                  <!-- Tồn kho -->
                  <td style="padding: 14px; vertical-align: middle; text-align: center; font-weight: 600;" [style.color]="prod.stock > 15 ? '#16a34a' : '#dc2626'">
                    {{ prod.stock }}
                  </td>

                  <!-- Doanh thu -->
                  <td style="padding: 14px; vertical-align: middle; text-align: right; font-weight: 800; color: #c96a2e;">
                    {{ prod.revenue | currencyVnd }}
                  </td>

                </tr>
              } @empty {
                <tr>
                  <td colspan="7" style="text-align: center; padding: 36px; color: #7a6555; font-weight: 600;">
                    Không tìm thấy sản phẩm nào bán chạy.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminReportsPage implements OnInit {
  private readonly adminApi = inject(AdminApi);

  readonly selectedPeriod = signal('month');
  showExportOptions = signal(false);
  isLoadingApi = signal(false);

  /** Real data from GET /admin/analytics/overview — null while loading */
  apiOverview = signal<AdminAnalyticsOverview | null>(null);

  // Highlighting states
  activeCategoryText = signal('Bấm vào một lát trong biểu đồ để xem chi tiết tỷ trọng');
  activeTierText = signal('Bấm vào cột hạng thành viên để xem cơ cấu cụ thể');

  // Hover states for line charts
  hoveredRevIndex = signal<number>(-1);
  hoveredOrdIndex = signal<number>(-1);

  currentData = computed<PeriodData>(() => {
    const period = this.selectedPeriod();
    const api = this.apiOverview();
    const base = REPORT_MOCK_DATA[period] || REPORT_MOCK_DATA['month'];

    // If real API data is available, override the relevant stats
    if (api) {
      return {
        ...base,
        stats: {
          ...base.stats,
          revenue: api.revenue,
          orders: api.totalOrders,
          customersCount: api.newCustomers,
        },
        topProducts: api.topProducts.map((p, i) => ({
          rank: i + 1,
          productId: p.productId,
          name: p.productName,
          category: p.category || '--',
          soldCount: p.quantitySold,
          stock: 0,        // BACKEND_GAP: không có stock
          revenue: p.revenue,
          imageUrl: p.imageUrl || '/assets/images/product-placeholder.svg'
        }))
      };
    }
    return {
      ...base,
      topProducts: []
    };
  });

  // Calculate coordinates for Revenue & Orders Line Chart SVG
  points = computed(() => {
    const data = this.currentData();
    const width = 600; // Reference width in template
    const height = 170; // Reference height

    // Find max value to auto-scale
    const maxRev = Math.max(...data.trendRevenue, 100);
    const maxOrd = Math.max(...data.trendOrders, 1000);

    const revenuePoints = data.trendRevenue.map((val, idx) => {
      const x = idx * (width / 6);
      const y = height - (val / maxRev) * (height - 30);
      return { x, y, val };
    });

    const ordersPoints = data.trendOrders.map((val, idx) => {
      const x = idx * (width / 6);
      const y = height - (val / maxOrd) * (height - 35);
      return { x, y, val };
    });

    return { revenue: revenuePoints, orders: ordersPoints };
  });

  revenuePath = computed(() => {
    const pts = this.points().revenue;
    if (pts.length === 0) return { line: '', fill: '' };

    const linePath = 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
    const fillPath = linePath + ` L ${pts[pts.length - 1].x},200 L ${pts[0].x},200 Z`;

    return { line: linePath, fill: fillPath };
  });

  ordersPath = computed(() => {
    const pts = this.points().orders;
    if (pts.length === 0) return { line: '', fill: '' };

    const linePath = 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
    const fillPath = linePath + ` L ${pts[pts.length - 1].x},200 L ${pts[0].x},200 Z`;

    return { line: linePath, fill: fillPath };
  });

  // Calculate coordinates for Media channel efficiency chart
  mediaPoints = computed(() => {
    const data = this.currentData();
    const width = 600;
    const height = 150;

    const maxBlogs = Math.max(...data.mediaBlogViews, 200);
    const maxEmails = Math.max(...data.mediaEmailSubs, 100);

    const blogsPts = data.mediaBlogViews.map((val, idx) => {
      const x = idx * (width / 6);
      const y = height - (val / maxBlogs) * (height - 20);
      return { x, y };
    });

    const emailsPts = data.mediaEmailSubs.map((val, idx) => {
      const x = idx * (width / 6);
      const y = height - (val / maxEmails) * (height - 20);
      return { x, y };
    });

    return { blogs: blogsPts, emails: emailsPts };
  });

  mediaPath = computed(() => {
    const bPts = this.mediaPoints().blogs;
    const ePts = this.mediaPoints().emails;

    return {
      blogLine: 'M ' + bPts.map(p => `${p.x},${p.y}`).join(' L '),
      emailLine: 'M ' + ePts.map(p => `${p.x},${p.y}`).join(' L ')
    };
  });

  // Dynamic Rings computed for Donut Chart (Categories Share)
  donutRings = computed(() => {
    const data = this.currentData().donutData;
    const circ = 2 * Math.PI * 60; // 376.99
    let currentSum = 0;
    const colors = ['#d97706', '#f5c842', '#fff1c5', '#5c381d', '#2b1a0f'];
    
    return data.map((item, idx) => {
      const dashArray = `${(item.percentage / 100) * circ} ${circ}`;
      const dashOffset = -((currentSum / 100) * circ);
      currentSum += item.percentage;
      return {
        ...item,
        color: colors[idx],
        dashArray,
        dashOffset
      };
    });
  });

  // Dynamic progress stats computed for loyalty points section
  loyaltyStats = computed(() => {
    const data = this.currentData().loyaltyData;
    const ratio = (data.totalRedeemed / data.totalGranted) * 100;
    return {
      ...data,
      ratioPercent: ratio + '%'
    };
  });

  // Dynamic vertical bars computed for loyalty tiers chart
  tierBars = computed(() => {
    const data = this.currentData().tierData;
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const colors = ['#f5e6d3', '#fff7ed', '#f3f4f6', '#fef3c7', '#dbeafe'];
    const borders = ['#e5c9a8', '#fed7aa', '#e5e7eb', '#fde68a', '#bfdbfe'];
    
    return data.map((item, idx) => {
      const height = (item.count / maxCount) * 80; // max height is 80px/80%
      return {
        ...item,
        heightPercent: height + '%',
        color: colors[idx],
        border: borders[idx]
      };
    });
  });

  // Dynamic rings computed for Voucher usage pie chart
  voucherRings = computed(() => {
    const data = this.currentData().voucherData;
    const circ = 2 * Math.PI * 50; // 314.15
    
    const usedDash = `${(data.usedPercent / 100) * circ} ${circ}`;
    const unusedDash = `${(data.unusedPercent / 100) * circ} ${circ}`;
    const expiredDash = `${(data.expiredPercent / 100) * circ} ${circ}`;
    
    const unusedOffset = -((data.usedPercent / 100) * circ);
    const expiredOffset = -(((data.usedPercent + data.unusedPercent) / 100) * circ);
    
    return {
      ...data,
      usedDash,
      unusedDash,
      expiredDash,
      unusedOffset,
      expiredOffset
    };
  });

  ngOnInit(): void {
    this.loadApiData();
  }

  private getDateRange(): { dateFrom: string; dateTo: string } {
    const now = new Date();
    const dateTo = now.toISOString();
    let dateFrom: Date;
    const period = this.selectedPeriod();
    if (period === '7days') {
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30days') {
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'quarter') {
      const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
      dateFrom = new Date(now.getFullYear(), qStartMonth, 1, 0, 0, 0);
    } else if (period === 'year') {
      dateFrom = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    } else { // default 'month'
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }
    return { dateFrom: dateFrom.toISOString(), dateTo };
  }

  private loadApiData(): void {
    this.isLoadingApi.set(true);
    const { dateFrom, dateTo } = this.getDateRange();
    this.adminApi.getOverview(dateFrom, dateTo).subscribe({
      next: (data) => {
        this.apiOverview.set(data);
        this.isLoadingApi.set(false);
      },
      error: (err) => {
        console.error('[Reports] Failed to load analytics overview', err);
        this.isLoadingApi.set(false);
        // Keep showing mock data on error
      }
    });
  }

  getPeriodLabel(periodKey: string): string {
    return REPORT_MOCK_DATA[periodKey]?.dateRange || '';
  }

  onPeriodChange(): void {
    this.activeCategoryText.set('Bấm vào một lát trong biểu đồ để xem chi tiết tỷ trọng');
    this.activeTierText.set('Bấm vào cột hạng thành viên để xem cơ cấu cụ thể');
    this.apiOverview.set(null);  // Clear to show updated data
    this.loadApiData();
  }

  toggleExportDropdown(): void {
    this.showExportOptions.update(v => !v);
  }

  triggerExport(format: 'xlsx' | 'csv'): void {
    this.showExportOptions.set(false);
    
    if (format === 'xlsx') {
      alert(`Đã chuẩn bị file Excel báo cáo cho giai đoạn: ${this.currentData().label} (${this.currentData().dateRange}). File: bao-cao-doanh-thu.xlsx`);
    } else {
      // Simulate real download of CSV
      const csvContent = "data:text/csv;charset=utf-8,STT,Ten San Pham,Danh Muc,Da Ban,Doanh Thu\n"
        + this.currentData().topProducts.map(p => `${p.rank},${p.name},${p.category},${p.soldCount},${p.revenue}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `webee_report_${this.selectedPeriod()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Đã chuẩn bị và tải xuống file CSV báo cáo cho giai đoạn: ${this.currentData().label}`);
    }
  }

  highlightCategory(infoText: string): void {
    this.activeCategoryText.set(`Danh mục đang xem: ${infoText}`);
  }

  highlightTier(infoText: string): void {
    this.activeTierText.set(`Thông tin chi tiết: ${infoText}`);
  }
}
