import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';


interface MockVoucher {
  id: string; 
  code: string; 
  campaignName: string; 
  campaignIconType: string; // 'bronze' | 'silver' | 'gold' | 'new' | 'valentine' | 'women' | 'midautumn' | 'birthday' | 'diamond'
  targetAudience: string; 
  minOrderValue: number; 
  discountType: 'percent' | 'fixed'; 
  discountValue: number;
  maxDiscountAmount: number | null;
  usageLimit?: number | null;
  applyCategory: string;
  validityFrequency: string; 
  isActive: boolean; 
  status: 'active' | 'expired'; 
  description?: string; 
  refreshFrequency?: string; 
  startDate?: string;
  endDate?: string;
}

type FilterTab = 'all' | 'active' | 'expired';

const DEFAULT_VOUCHERS: MockVoucher[] = [
  {
    id: '1',
    code: 'VIPBRONZE',
    campaignName: 'Đặc quyền hạng Đồng',
    campaignIconType: 'bronze',
    targetAudience: 'Chỉ hạng Bronze',
    minOrderValue: 200000,
    discountType: 'percent',
    discountValue: 5,
    maxDiscountAmount: 20000,
    applyCategory: 'Bánh Gato',
    validityFrequency: '1 lần / Tháng \n Vô thời hạn',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Tháng',
    description: 'Chương trình đặc quyền dành riêng cho khách hàng thân thiết đạt hạng Đồng (Bronze). Tự động cấp mới số lượng theo hạn mức 1 voucher/tháng.'
  },
  {
    id: '2',
    code: 'VIPSILVER',
    campaignName: 'Đặc quyền hạng Bạc',
    campaignIconType: 'silver',
    targetAudience: 'Chỉ hạng Silver',
    minOrderValue: 300000,
    discountType: 'percent',
    discountValue: 8,
    maxDiscountAmount: 35000,
    applyCategory: 'Bánh Tiramisu',
    validityFrequency: '1 lần / Tháng \n Vô thời hạn',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Tháng',
    description: 'Chương trình đặc quyền dành riêng cho khách hàng thân thiết đạt hạng Bạc (Silver). Tự động cấp mới số lượng theo hạn mức 2 voucher/tháng.'
  },
  {
    id: '3',
    code: 'VIPGOLD',
    campaignName: 'Đặc quyền hạng Vàng',
    campaignIconType: 'gold',
    targetAudience: 'Chỉ hạng Gold',
    minOrderValue: 0,
    discountType: 'fixed',
    discountValue: 0, 
    maxDiscountAmount: null,
    applyCategory: 'Bánh Mousse',
    validityFrequency: '1 lần / Tháng \n Vô thời hạn',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Tháng',
    description: 'Đặc quyền miễn phí vận chuyển nội thành cho khách hàng thân thiết đạt hạng Vàng (Gold). Tự động cấp mới số lượng theo hạn mức 3 voucher/tháng.'
  },
  {
    id: '4',
    code: 'WEBEENEW',
    campaignName: 'Khách hàng mới',
    campaignIconType: 'new',
    targetAudience: 'Tất cả khách',
    minOrderValue: 0,
    discountType: 'percent',
    discountValue: 10,
    maxDiscountAmount: null,
    applyCategory: 'Tất cả sản phẩm',
    validityFrequency: '1 lần / Đời tài khoản \n Vô thời hạn',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Đời tài khoản',
    description: 'Voucher chào mừng thành viên mới đăng ký tài khoản thành công tại WebBee. Áp dụng cho đơn hàng đầu tiên của bạn.'
  },
  {
    id: '5',
    code: 'VALENTINE26',
    campaignName: 'Lễ Tình Nhân',
    campaignIconType: 'valentine',
    targetAudience: 'Tất cả khách',
    minOrderValue: 150000,
    discountType: 'percent',
    discountValue: 10,
    maxDiscountAmount: 30000,
    applyCategory: 'Bánh Gato Trái Cây \n Bánh Tiramisu Truyền Thống',
    validityFrequency: '1 lần / Năm \n 10/02 - 14/02/2026',
    isActive: true,
    status: 'expired',
    refreshFrequency: '1 lần / Năm',
    description: 'Chiến dịch ngọt ngào nhân ngày Lễ Tình Nhân Valentine 14/02. Áp dụng khi mua các dòng bánh gato tình yêu đặc biệt tại WebBee.'
  },
  {
    id: '6',
    code: 'SWEET83',
    campaignName: 'Quốc tế Phụ nữ',
    campaignIconType: 'women',
    targetAudience: 'Tất cả khách',
    minOrderValue: 150000,
    discountType: 'percent',
    discountValue: 15,
    maxDiscountAmount: 40000,
    applyCategory: 'Bánh Mousse Nhãn \n Bánh Entremet',
    validityFrequency: '1 lần / Năm \n 01/03 - 08/03/2026',
    isActive: true,
    status: 'expired',
    refreshFrequency: '1 lần / Năm',
    description: 'Chào mừng ngày Quốc tế Phụ nữ 8/3. Thay lời chúc ngọt ngào nhất gửi đến một nửa thế giới, WeBee giảm giá cho các dòng mousse trái cây và Entremet.'
  },
  {
    id: '7',
    code: 'TRUNGTHU26',
    campaignName: 'Tết Trung Thu',
    campaignIconType: 'midautumn',
    targetAudience: 'Từ hạng Silver trở lên',
    minOrderValue: 200000,
    discountType: 'fixed',
    discountValue: 30000,
    maxDiscountAmount: null,
    applyCategory: 'Bánh Nướng Thập Cẩm \n Bánh Nướng Đậu Xanh',
    validityFrequency: '1 lần / Năm \n 15/09 - 25/09/2026',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Năm',
    description: 'Quà tặng tết đoàn viên ấm áp. Voucher giảm trực tiếp 30.000đ khi đặt mua hộp bánh Trung Thu truyền thống WeBee.'
  },
  {
    id: '8',
    code: 'HPBDVIP',
    campaignName: 'Sinh nhật thành viên',
    campaignIconType: 'birthday',
    targetAudience: 'Tất cả khách',
    minOrderValue: 0,
    discountType: 'percent',
    discountValue: 15,
    maxDiscountAmount: 50000,
    applyCategory: 'Bánh Gato',
    validityFrequency: '1 lần / Năm \n Vô thời hạn',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Năm',
    description: 'Món quà sinh nhật ngọt ngào WeBee gửi tặng riêng bạn. Áp dụng đặt ổ bánh sinh nhật bất kỳ trong tháng sinh nhật của khách hàng.'
  },
  {
    id: '9',
    code: 'VIPKIMCUONG',
    campaignName: 'Đặc quyền Tri ân',
    campaignIconType: 'diamond',
    targetAudience: 'Chỉ hạng Kim Cương (Diamond)',
    minOrderValue: 0,
    discountType: 'percent',
    discountValue: 12,
    maxDiscountAmount: 100000,
    applyCategory: 'Tất cả sản phẩm',
    validityFrequency: '1 lần / Tháng \n Vô thời hạn',
    isActive: true,
    status: 'active',
    refreshFrequency: '1 lần / Tháng',
    description: 'Chương trình đặc quyền tri ân dành riêng cho khách hàng thân thiết đạt hạng Kim Cương (Diamond). Tự động cấp mới số lượng theo hạn mức 4 voucher/tháng.'
  }
];

@Component({
  selector: 'app-admin-coupons-list-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="vouchers-page" style="padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; background: #fdfbf5; min-height: 100vh; color: #2b1a0f; position: relative;">

      <!-- Page Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0;">
          Quản lý chiến dịch Voucher
        </h1>
        <button 
          class="btn-primary" 
          (click)="openCreatePanel()"
          style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: #f5c842; color: #2b1a0f; font-weight: 800; font-size: 14.5px; border: none; border-radius: 12px; cursor: pointer; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
          onmouseover="this.style.background='#e6b83a'"
          onmouseout="this.style.background='#f5c842'"
        >
          <span style="font-size: 16px; font-weight: 900;">+</span> Tạo voucher mới
        </button>
      </div>

      <!-- Filters & Tabs Controls -->
      <div class="filter-controls" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
        <!-- Left: Search Box -->
        <div class="search-box" style="display: flex; align-items: center; gap: 8px; background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 12px; padding: 9px 14px; min-width: 320px; height: 38px; box-sizing: border-box;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a6555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Tìm kiếm mã hoặc tên chiến dịch..." 
            style="border: none; outline: none; background: transparent; font-size: 13.5px; color: #2b1a0f; flex: 1; font-family: 'Be Vietnam Pro', sans-serif;"
          />
        </div>

        <!-- Center/Right: Tabs & Reset -->
        <div style="display: flex; gap: 10px; align-items: center;">
          <!-- Tabs -->
          <div class="filter-tabs" style="display: flex; background: #f3ece3; border-radius: 10px; padding: 3px; gap: 2px;">
            <button 
              (click)="activeTab.set('all')"
              [style.background]="activeTab() === 'all' ? '#f5c842' : 'transparent'"
              [style.color]="activeTab() === 'all' ? '#2b1a0f' : '#7a6555'"
              style="padding: 6px 14px; border: none; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
            >
              Tất cả ({{ allCount() }})
            </button>
            <button 
              (click)="activeTab.set('active')"
              [style.background]="activeTab() === 'active' ? '#f5c842' : 'transparent'"
              [style.color]="activeTab() === 'active' ? '#2b1a0f' : '#7a6555'"
              style="padding: 6px 14px; border: none; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
            >
              Còn hiệu lực ({{ activeCount() }})
            </button>
            <button 
              (click)="activeTab.set('expired')"
              [style.background]="activeTab() === 'expired' ? '#f5c842' : 'transparent'"
              [style.color]="activeTab() === 'expired' ? '#2b1a0f' : '#7a6555'"
              style="padding: 6px 14px; border: none; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
            >
              Đã hết hạn ({{ expiredCount() }})
            </button>
          </div>

          <!-- Reset Filter Button -->
          <button 
            (click)="resetFilters()"
            style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #ffffff; border: 1.5px solid #7a6555; border-radius: 10px; font-size: 13px; font-weight: 700; color: #7a6555; cursor: pointer; height: 38px; box-sizing: border-box; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
            onmouseover="this.style.background='#fffcf9'; this.style.borderColor='#c96a2e'; this.style.color='#c96a2e';"
            onmouseout="this.style.background='#ffffff'; this.style.borderColor='#7a6555'; this.style.color='#7a6555';"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-card" style="background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(43,26,15,0.015); margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
          <thead>
            <tr style="background: #fffbf7; border-bottom: 1.5px solid #ede8e2;">
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Mã Voucher</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Chiến Dịch / Dịp Lễ</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Đơn Tối Thiểu</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Mức Giảm Giá</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Hiệu lực & tần suất</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Trạng Thái</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555;">Kích hoạt</th>
              <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; width: 60px;">Sửa</th>
            </tr>
          </thead>
          <tbody>
            @for (voucher of filteredVouchers(); track voucher.id) {
              <tr 
                style="border-bottom: 1px solid #f3ece3; transition: background 0.15s; cursor: pointer;"
                [style.opacity]="voucher.isActive ? 1 : 0.6"
                onmouseover="this.style.background='#fffbf7'"
                onmouseout="this.style.background='transparent'"
                (click)="openEditPanel(voucher)"
              >
                <!-- Mã Voucher -->
                <td style="padding: 16px 14px; font-weight: 700; color: #7c2d12;">
                  <code style="font-family: 'Be Vietnam Pro', sans-serif; background: #fdf2e9; padding: 4px 8px; border-radius: 6px; font-size: 13px;">
                    {{ voucher.code }}
                  </code>
                </td>

                <!-- Chiến dịch (Canh trái + Render SVG icon cao cấp) -->
                <td style="padding: 16px 14px; font-weight: 700; color: #2b1a0f;">
                  <span style="display: inline-flex; align-items: center; margin-right: 6px; vertical-align: middle; width: 16px; height: 16px;">
                    @switch (voucher.campaignIconType) {
                      @case ('bronze') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="8" r="6"></circle>
                          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                        </svg>
                      }
                      @case ('silver') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="8" r="6"></circle>
                          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                        </svg>
                      }
                      @case ('gold') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="8" r="6"></circle>
                          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                        </svg>
                      }
                      @case ('new') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <path d="M9 17V7h2l3 6V7h2v10h-2l-3-6v6H9z"></path>
                        </svg>
                      }
                      @case ('valentine') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#db2777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                      }
                      @case ('women') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"></path>
                          <path d="M12 10v12"></path>
                          <path d="M8 15a4 4 0 0 0 8 0"></path>
                        </svg>
                      }
                      @case ('midautumn') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          <path d="M2 12h20"></path>
                        </svg>
                      }
                      @case ('birthday') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-8H4v8Z"></path>
                          <path d="M12 13V9"></path>
                          <path d="M8 13V9"></path>
                          <path d="M16 13V9"></path>
                          <circle cx="12" cy="4" r="1"></circle>
                          <circle cx="8" cy="4" r="1"></circle>
                          <circle cx="16" cy="4" r="1"></circle>
                        </svg>
                      }
                      @case ('diamond') {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 3h12l4 6-10 12L2 9Z"></path>
                          <path d="M11 3 8 9l4 12 4-12-3-6"></path>
                          <path d="M2 9h20"></path>
                        </svg>
                      }
                      @default {
                        🎁
                      }
                    }
                  </span>
                  {{ voucher.campaignName }}
                </td>

                <!-- Đơn tối thiểu -->
                <td style="padding: 16px 14px; font-weight: 600; color: #2b1a0f;">
                  {{ voucher.minOrderValue === 0 ? 'Từ 0 đ' : 'Từ ' + (voucher.minOrderValue.toLocaleString('vi-VN') + ' đ') }}
                </td>

                <!-- Mức giảm giá -->
                <td style="padding: 16px 14px; font-weight: 800; color: #16a34a;">
                  @if (voucher.discountType === 'percent') {
                    Giảm {{ voucher.discountValue }}%
                    @if (voucher.maxDiscountAmount) {
                      <div style="font-size: 11.5px; font-weight: 600; color: #7a6555; margin-top: 2px;">
                        Tối đa {{ voucher.maxDiscountAmount.toLocaleString('vi-VN') }}đ
                      </div>
                    }
                  } @else {
                    @if (voucher.discountValue === 0) {
                      Freeship
                    } @else {
                      Giảm {{ voucher.discountValue.toLocaleString('vi-VN') }} đ
                    }
                  }
                </td>

                <!-- Hiệu lực & tần suất -->
                <td style="padding: 16px 14px; color: #7a6555; font-weight: 600; white-space: pre-line; line-height: 1.4;">
                  {{ voucher.validityFrequency }}
                </td>

                <!-- Trạng thái -->
                <td style="padding: 16px 14px; vertical-align: middle;">
                  <span 
                    style="display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 700; white-space: nowrap;"
                    [style.background]="voucher.status === 'active' ? '#fef3c7' : '#f3f4f6'"
                    [style.color]="voucher.status === 'active' ? '#d97706' : '#6b7280'"
                  >
                    {{ voucher.status === 'active' ? 'Còn hiệu lực' : 'Đã hết hạn' }}
                  </span>
                </td>

                <!-- Kích hoạt -->
                <td style="padding: 16px 14px; vertical-align: middle;" (click)="$event.stopPropagation()">
                  <button
                    class="toggle-switch"
                    [class.toggle-switch--on]="voucher.isActive"
                    (click)="toggleVoucherActive(voucher)"
                    type="button"
                  >
                    <span class="toggle-switch__knob"></span>
                  </button>
                </td>

                <!-- Sửa -->
                <td style="padding: 16px 14px; vertical-align: middle;">
                  <button 
                    style="background: none; border: none; cursor: pointer; color: #7a6555; padding: 8px; border-radius: 8px; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center;"
                    onmouseover="this.style.background='#f3ece3'; this.style.color='#c96a2e'"
                    onmouseout="this.style.background='none'; this.style.color='#7a6555'"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" style="text-align: center; padding: 48px; color: #7a6555; font-weight: 600;">
                  Không tìm thấy voucher phù hợp.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div style="background: #fffbeb; border: 1.5px solid #feebc8; border-radius: 12px; padding: 14px 18px; display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #c05621; font-weight: 600; line-height: 1.5; box-sizing: border-box;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2.5px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>
          Lưu ý: Khách hàng chỉ có thể áp dụng 1 mã giảm giá trên 1 đơn hàng (trừ mã Freeship có thể cộng dồn tùy cài đặt). Các mã đặc quyền cho hạng thành viên được tự động áp dụng khi khách hàng đạt đủ điều kiện.
        </span>
      </div>

      <!-- ================= SIDE DRAWER PANEL ================= -->
      @if (isPanelOpen()) {
        <!-- Dark Overlay -->
        <div 
          (click)="closePanel()"
          style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; backdrop-filter: blur(1.5px); transition: all 0.25s;"
        ></div>

        <!-- Side panel container -->
        <div 
          class="side-panel"
          style="position: fixed; top: 0; right: 0; bottom: 0; width: 440px; background: #ffffff; z-index: 1000; box-shadow: -4px 0 24px rgba(43,26,15,0.12); display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden; animation: slideIn 0.2s ease-out;"
        >
          <!-- Panel Header -->
          <div style="padding: 20px 24px; border-bottom: 1.5px solid #ede8e2; display: flex; align-items: center; justify-content: space-between; background: #fffbf7;">
            <div>
              <span style="font-size: 13px; font-weight: 700; color: #7a6555; display: block; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                {{ panelMode() === 'create' ? 'Tạo mới' : 'Chi tiết Voucher' }}
              </span>
              <h2 style="font-family: 'Fraunces', serif; font-size: 20px; font-weight: 800; color: #2b1a0f; margin: 0; display: inline-flex; align-items: center; gap: 8px;">
                @if (panelMode() === 'edit') {
                  Chi tiết Voucher: <span style="color: #7c2d12;">{{ formData.code }}</span>
                } @else {
                  Tạo Voucher mới
                }
              </h2>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              @if (panelMode() === 'edit') {
                <span 
                  style="display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 700;"
                  [style.background]="formData.status === 'active' ? '#fef3c7' : '#f3f4f6'"
                  [style.color]="formData.status === 'active' ? '#d97706' : '#6b7280'"
                >
                  {{ formData.status === 'active' ? 'Còn hiệu lực' : 'Đã hết hạn' }}
                </span>
              }
              <!-- Close cross button (SVG icon) -->
              <button 
                (click)="closePanel()"
                style="background: none; border: none; cursor: pointer; font-size: 18px; color: #7a6555; font-weight: 700; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; display: inline-flex; align-items: center; justify-content: center;"
                onmouseover="this.style.background='#f3ece3'"
                onmouseout="this.style.background='none'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Panel Scrollable Form Fields -->
          <div style="flex: 1; overflow-y: auto; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 24px;">
            <!-- THÔNG TIN CƠ BẢN -->
            <div>
              <h3 style="font-size: 12px; font-weight: 800; color: #7a6555; border-bottom: 1.5px solid #f3ece3; padding-bottom: 6px; margin: 0 0 16px; letter-spacing: 0.05em; text-transform: uppercase;">
                THÔNG TIN CƠ BẢN
              </h3>
              
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <!-- Mã Voucher -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Mã Voucher *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.code"
                    (ngModelChange)="codeError.set(false)"
                    [disabled]="panelMode() === 'edit'"
                    placeholder="VD: VIPKIMCUONG"
                    style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; text-transform: uppercase; font-family: 'Be Vietnam Pro', sans-serif;"
                    [style.borderColor]="codeError() ? '#dc2626' : '#ede8e2'"
                    [style.background]="panelMode() === 'edit' ? '#fffbf7' : '#ffffff'"
                  />
                  @if (codeError()) {
                    <span style="display: block; font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 4px;">
                      ⚠️ Mã voucher là bắt buộc, không chứa dấu cách!
                    </span>
                  }
                </div>

                <!-- Tên chiến dịch -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Tên chiến dịch *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.campaignName"
                    (ngModelChange)="campaignNameError.set(false)"
                    placeholder="VD: Đặc quyền Tri ân"
                    style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                    [style.borderColor]="campaignNameError() ? '#dc2626' : '#ede8e2'"
                  />
                  @if (campaignNameError()) {
                    <span style="display: block; font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 4px;">
                      ⚠️ Tên chiến dịch / dịp lễ là bắt buộc!
                    </span>
                  }
                </div>

                <!-- Mô tả -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Mô tả</label>
                  <textarea 
                    [(ngModel)]="formData.description"
                    rows="3"
                    placeholder="Nhập mô tả chiến dịch áp dụng voucher..."
                    style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13px; font-weight: 500; color: #2b1a0f; background: #ffffff; outline: none; resize: vertical; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif; line-height: 1.5;"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- MỨC GIẢM GIÁ -->
            <div>
              <h3 style="font-size: 12px; font-weight: 800; color: #7a6555; border-bottom: 1.5px solid #f3ece3; padding-bottom: 6px; margin: 0 0 16px; letter-spacing: 0.05em; text-transform: uppercase;">
                MỨC GIẢM GIÁ
              </h3>

              <!-- Radio Options -->
              <div style="display: flex; gap: 20px; margin-bottom: 16px;">
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; cursor: pointer;">
                  <input 
                    type="radio" 
                    name="discountType" 
                    value="fixed" 
                    [(ngModel)]="formData.discountType"
                    (change)="onDiscountTypeChange()"
                    style="accent-color: #c96a2e; width: 16px; height: 16px;" 
                  />
                  Số tiền cố định (đ)
                </label>
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; cursor: pointer;">
                  <input 
                    type="radio" 
                    name="discountType" 
                    value="percent" 
                    [(ngModel)]="formData.discountType"
                    (change)="onDiscountTypeChange()"
                    style="accent-color: #c96a2e; width: 16px; height: 16px;" 
                  />
                  Phần trăm (%)
                </label>
              </div>

              <!-- Input columns -->
              <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <!-- Mức giảm -->
                <div style="flex: 1; min-width: 140px;">
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Mức giảm *</label>
                  <div style="position: relative; display: flex; align-items: center;">
                    <input 
                      type="number" 
                      [(ngModel)]="formData.discountValue"
                      (ngModelChange)="discountValueError.set(false)"
                      placeholder="0"
                      style="width: 100%; padding: 10px 32px 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                      [style.borderColor]="discountValueError() ? '#dc2626' : '#ede8e2'"
                    />
                    <span style="position: absolute; right: 12px; font-weight: 700; color: #7a6555; font-size: 13px;">
                      {{ formData.discountType === 'percent' ? '%' : 'đ' }}
                    </span>
                  </div>
                  @if (discountValueError()) {
                    <span style="display: block; font-size: 11.5px; color: #dc2626; font-weight: 700; margin-top: 4px;">
                      {{ formData.discountType === 'percent' ? 'Yêu cầu từ 1% đến 100%!' : 'Yêu cầu mức giảm lớn hơn 0!' }}
                    </span>
                  }
                </div>

                <!-- Đơn tối thiểu -->
                <div style="flex: 1; min-width: 140px;">
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Đơn tối thiểu</label>
                  <div style="position: relative; display: flex; align-items: center;">
                    <input 
                      type="number" 
                      [(ngModel)]="formData.minOrderValue"
                      (ngModelChange)="minOrderValueError.set(false)"
                      placeholder="0"
                      style="width: 100%; padding: 10px 32px 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                      [style.borderColor]="minOrderValueError() ? '#dc2626' : '#ede8e2'"
                    />
                    <span style="position: absolute; right: 12px; font-weight: 700; color: #7a6555; font-size: 13px;">đ</span>
                  </div>
                  @if (minOrderValueError()) {
                    <span style="display: block; font-size: 11.5px; color: #dc2626; font-weight: 700; margin-top: 4px;">
                      ⚠️ Đơn tối thiểu phải lớn hơn hoặc bằng 0!
                    </span>
                  }
                </div>
              </div>

              <!-- Giảm tối đa -->
              @if (formData.discountType === 'percent') {
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Giảm tối đa</label>
                  <div style="position: relative; display: flex; align-items: center;">
                    <input 
                      type="number" 
                      [(ngModel)]="formData.maxDiscountAmount"
                      placeholder="Không giới hạn"
                      style="width: 100%; padding: 10px 32px 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                    />
                    <span style="position: absolute; right: 12px; font-weight: 700; color: #7a6555; font-size: 13px;">đ</span>
                  </div>
                </div>
              }

              <!-- Giới hạn lượt dùng -->
              <div>
                <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="formData.usageLimit"
                  placeholder="Không giới hạn"
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                />
                <span style="display: block; font-size: 11.5px; color: #7a6555; font-weight: 600; margin-top: 4px;">Để trống = dùng không giới hạn.</span>
              </div>
            </div>

            <!-- ĐIỀU KIỆN ÁP DỤNG -->
            <div>
              <h3 style="font-size: 12px; font-weight: 800; color: #7a6555; border-bottom: 1.5px solid #f3ece3; padding-bottom: 6px; margin: 0 0 16px; letter-spacing: 0.05em; text-transform: uppercase;">
                ĐIỀU KIỆN ÁP DỤNG
              </h3>

              <div style="display: flex; flex-direction: column; gap: 16px;">
                 <!-- Row: Ngày bắt đầu + Ngày kết thúc -->
                 <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                   <!-- Ngày bắt đầu -->
                   <div style="flex: 1; min-width: 140px;">
                     <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Ngày bắt đầu *</label>
                     <input 
                       type="date" 
                       [(ngModel)]="formData.startDate"
                       style="width: 100%; padding: 10px 12px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                     />
                   </div>

                   <!-- Ngày kết thúc -->
                   <div style="flex: 1; min-width: 140px;">
                     <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">Ngày kết thúc *</label>
                     <input 
                       type="date" 
                       [(ngModel)]="formData.endDate"
                       style="width: 100%; padding: 10px 12px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif;"
                     />
                   </div>
                 </div>

                <!-- Đối tượng — CHƯA áp dụng phía hệ thống (backend chưa hỗ trợ giới hạn theo hạng) -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">
                    Đối tượng
                    <span style="font-weight: 600; color: #b08a4a; font-size: 11.5px;">(sắp có — chưa áp dụng)</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="formData.targetAudience"
                    disabled
                    placeholder="Áp dụng cho tất cả khách"
                    style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #9c8a78; background: #f7f3ee; outline: none; box-sizing: border-box; cursor: not-allowed; font-family: 'Be Vietnam Pro', sans-serif;"
                  />
                </div>

                <!-- Sản phẩm áp dụng — CHƯA áp dụng phía hệ thống -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 800; color: #2b1a0f; margin-bottom: 6px;">
                    Sản phẩm áp dụng
                    <span style="font-weight: 600; color: #b08a4a; font-size: 11.5px;">(sắp có — chưa áp dụng)</span>
                  </label>
                  <div style="position: relative; display: flex; align-items: center; flex-wrap: wrap;">
                    <input
                      type="text"
                      [(ngModel)]="formData.applyCategory"
                      disabled
                      placeholder="Áp dụng cho tất cả sản phẩm"
                      style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13px; font-weight: 700; color: #9c8a78; background: #f7f3ee; outline: none; box-sizing: border-box; cursor: not-allowed; font-family: 'Be Vietnam Pro', sans-serif;"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel Footer Action Buttons -->
          <div style="padding: 20px 24px; border-top: 1.5px solid #ede8e2; background: #fffbf7; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; gap: 12px;">
            <div>
              @if (panelMode() === 'edit') {
                <button 
                  type="button"
                  (click)="pauseCampaign()"
                  style="background: none; border: none; cursor: pointer; color: #dc2626; font-size: 14.5px; font-weight: 800; font-family: 'Be Vietnam Pro', sans-serif; display: inline-flex; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 8px; transition: background 0.15s;"
                  onmouseover="this.style.background='#fee2e2'"
                  onmouseout="this.style.background='none'"
                >
                  Tạm dừng chiến dịch
                </button>
              }
            </div>

            <div style="display: flex; gap: 10px;">
              <button 
                type="button"
                (click)="closePanel()"
                style="padding: 10px 20px; background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 10px; font-size: 13.5px; font-weight: 700; color: #7a6555; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
                onmouseover="this.style.background='#fffcf9'; this.style.borderColor='#c96a2e';"
                onmouseout="this.style.background='#ffffff'; this.style.borderColor='#ede8e2';"
              >
                Hủy
              </button>
              <button 
                type="button"
                (click)="submitVoucher()"
                style="padding: 10px 22px; background: #f5c842; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 800; color: #2b1a0f; cursor: pointer; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
                onmouseover="this.style.background='#e5b832'"
                onmouseout="this.style.background='#f5c842'"
              >
                {{ panelMode() === 'create' ? 'Tạo voucher' : 'Lưu thay đổi' }}
              </button>
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    /* ==========================================
       VOUCHERS MODULE CSS STYLE SHEET
       ========================================== */
    .vouchers-page { font-family: "Be Vietnam Pro", sans-serif; }

    /* Custom Toggle Switch Styles */
    .toggle-switch {
      width: 42px; height: 22px; border-radius: 99px;
      background: #e5e7eb; border: none; cursor: pointer;
      position: relative; transition: background 0.2s;
      display: inline-flex; align-items: center; padding: 2px;
      flex-shrink: 0; box-sizing: border-box;
    }
    .toggle-switch--on { background-color: #f5c842 !important; }
    .toggle-switch__knob {
      width: 18px; height: 18px; border-radius: 50%;
      background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.18);
      transition: transform 0.2s; position: absolute; left: 2px;
      transform: none;
    }
    .toggle-switch--on .toggle-switch__knob { transform: translateX(20px) !important; }

    /* Table styles */
    .table-card {
      background: #ffffff; border: 1.5px solid #ede8e2;
      border-radius: 16px; overflow: hidden;
    }
    .table-card th {
      background: #fffbf7; padding: 13px 16px;
      font-size: 13px; font-weight: 700; color: #7a6555;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1.5px solid #ede8e2;
    }
    .table-card td {
      padding: 16px 14px; border-bottom: 1px solid #f3ece3;
      vertical-align: middle; color: #2b1a0f;
    }

    /* Side Panel Animation Keyframes */
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .side-panel {
      animation: slideIn 0.2s ease-out forwards;
    }
  `],
  styleUrl: './admin.page.scss',
})
export class AdminCouponsListPage implements OnInit {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  // Vouchers state list
  readonly vouchers = signal<MockVoucher[]>([]);
  readonly searchQuery = signal('');
  readonly activeTab = signal<FilterTab>('all');

  // Side drawer panel state
  readonly isPanelOpen = signal(false);
  readonly panelMode = signal<'create' | 'edit'>('create');
  readonly selectedVoucher = signal<MockVoucher | null>(null);

  // Form Fields State
  formData = {
    id: '',
    code: '',
    campaignName: '',
    campaignIconType: 'new',
    targetAudience: 'Tất cả khách',
    minOrderValue: 0,
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 0,
    maxDiscountAmount: null as number | null,
    usageLimit: null as number | null,
    applyCategory: 'Tất cả sản phẩm',
    validityFrequency: '1 lần / Tháng \n Vô thời hạn',
    isActive: true,
    status: 'active' as 'active' | 'expired',
    refreshFrequency: '1 lần / Tháng',
    description: '',
    startDate: '',
    endDate: ''
  };

  // Form Valids
  readonly codeError = signal(false);
  readonly campaignNameError = signal(false);
  readonly discountValueError = signal(false);
  readonly minOrderValueError = signal(false);

  // Tab dynamic counts
  readonly allCount = computed(() => this.vouchers().length);
  readonly activeCount = computed(() => this.vouchers().filter(v => v.status === 'active').length);
  readonly expiredCount = computed(() => this.vouchers().filter(v => v.status === 'expired').length);

  // Computed filtered list
  readonly filteredVouchers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const tab = this.activeTab();

    return this.vouchers().filter(v => {
      // 1. Tab filter
      if (tab === 'active' && v.status !== 'active') return false;
      if (tab === 'expired' && v.status !== 'expired') return false;

      // 2. Search query filter
      if (query) {
        const matchesCode = v.code.toLowerCase().includes(query);
        const matchesCampaign = v.campaignName.toLowerCase().includes(query);
        if (!matchesCode && !matchesCampaign) return false;
      }

      return true;
    });
  });

  // Listen to escape key globally to close drawer
  @HostListener('window:keydown.escape')
  handleEscapePress(): void {
    if (this.isPanelOpen()) {
      this.closePanel();
    }
  }

  ngOnInit(): void {
    this.loadVouchers();

    // Check query or parameter path on start to open specific panel
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const found = this.vouchers().find(v => v.id === id || v.code === id);
        if (found) {
          this.openEditPanel(found);
        }
      }
    });
  }

  loadVouchers(): void {
    this.adminApi.getCoupons().subscribe({
      next: (list) => {
        // Map backend Coupon to MockVoucher (which acts as ExtendedCoupon)
        const mapped: MockVoucher[] = list.map(c => {
          // Infer icon type
          let iconType = 'new';
          if (c.code.includes('BRONZE')) iconType = 'bronze';
          else if (c.code.includes('SILVER')) iconType = 'silver';
          else if (c.code.includes('GOLD')) iconType = 'gold';
          else if (c.code.includes('DIAMOND')) iconType = 'diamond';
          
          // Determine status based on expiration
          const isExpired = c.endDate ? new Date(c.endDate) < new Date() : false;
          
          return {
            id: c.couponId,
            code: c.code,
            campaignName: c.code.includes('VIP') ? 'Đặc quyền thành viên' : 'Khuyến mãi đặc biệt',
            campaignIconType: iconType,
            targetAudience: c.code.includes('VIP') ? 'Khách hàng thân thiết' : 'Tất cả khách hàng',
            minOrderValue: Number(c.minOrderValue),
            discountType: c.discountType,
            discountValue: Number(c.discountValue),
            maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
            usageLimit: c.usageLimit ?? null,
            applyCategory: 'Tất cả sản phẩm',
            validityFrequency: c.endDate ? `Đến ngày ${new Date(c.endDate).toLocaleDateString('vi-VN')}` : 'Vô thời hạn',
            isActive: c.isActive,
            status: isExpired ? 'expired' : 'active',
            description: `Mã giảm giá ${c.code} áp dụng cho đơn hàng tối thiểu ${Number(c.minOrderValue).toLocaleString('vi-VN')}đ.`,
            refreshFrequency: '',
            startDate: c.startDate ? c.startDate.split('T')[0] : '',
            endDate: c.endDate ? c.endDate.split('T')[0] : ''
          } as MockVoucher;
        });
        this.vouchers.set(mapped);
      },
      error: (err) => {
        console.error('[Coupons] Error loading coupons:', err);
        if (err?.status !== 401) {
          this.toastService.error('Không tải được danh sách voucher.');
        }
      }
    });
  }

  toggleVoucherActive(voucher: MockVoucher): void {
    this.adminApi.toggleCouponStatus(voucher.id).subscribe({
      next: (updated) => {
        this.toastService.success(`Đã cập nhật trạng thái hoạt động của coupon ${updated.code}`);
        this.loadVouchers();
      },
      error: (err) => {
        console.error('[Coupons] Error toggling status:', err);
        this.toastService.error('Không thể cập nhật trạng thái coupon.');
      }
    });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activeTab.set('all');
  }

  onDiscountTypeChange(): void {
    if (this.formData.discountType === 'percent') {
      if (this.formData.discountValue > 100) this.formData.discountValue = 10;
    }
    this.discountValueError.set(false);
  }

  openCreatePanel(): void {
    // Reset Form for create
    this.formData = {
      id: '',
      code: '',
      campaignName: '',
      campaignIconType: 'new',
      targetAudience: 'Tất cả khách',
      minOrderValue: 0,
      discountType: 'percent',
      discountValue: 10,
      maxDiscountAmount: null,
      usageLimit: null,
      applyCategory: 'Tất cả sản phẩm',
      validityFrequency: '1 lần / Tháng \n Vô thời hạn',
      isActive: true,
      status: 'active',
      refreshFrequency: '1 lần / Tháng',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    };

    // Reset validations
    this.codeError.set(false);
    this.campaignNameError.set(false);
    this.discountValueError.set(false);
    this.minOrderValueError.set(false);

    this.panelMode.set('create');
    this.selectedVoucher.set(null);
    this.isPanelOpen.set(true);

    // Update URL gracefully
    this.location.go('/admin/vouchers/new');
  }

  openEditPanel(voucher: MockVoucher): void {
    this.formData = {
      id: voucher.id,
      code: voucher.code,
      campaignName: voucher.campaignName,
      campaignIconType: voucher.campaignIconType || 'new',
      targetAudience: voucher.targetAudience,
      minOrderValue: voucher.minOrderValue,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscountAmount: voucher.maxDiscountAmount,
      usageLimit: voucher.usageLimit ?? null,
      applyCategory: voucher.applyCategory,
      validityFrequency: voucher.validityFrequency,
      isActive: voucher.isActive,
      status: voucher.status,
      refreshFrequency: voucher.refreshFrequency || '1 lần / Tháng',
      description: voucher.description || '',
      startDate: voucher.startDate || '',
      endDate: voucher.endDate || ''
    };

    this.codeError.set(false);
    this.campaignNameError.set(false);
    this.discountValueError.set(false);
    this.minOrderValueError.set(false);

    this.panelMode.set('edit');
    this.selectedVoucher.set(voucher);
    this.isPanelOpen.set(true);

    this.location.go(`/admin/vouchers/${voucher.id}`);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.selectedVoucher.set(null);
    this.location.go('/admin/vouchers');
  }

  pauseCampaign(): void {
    if (this.panelMode() === 'edit') {
      this.adminApi.updateCoupon(this.formData.id, { isActive: false }).subscribe({
        next: () => {
          this.toastService.success('Đã tạm dừng chiến dịch voucher!');
          this.loadVouchers();
          this.closePanel();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Không thể tạm dừng chiến dịch.');
        }
      });
    }
  }

  submitVoucher(): void {
    let hasError = false;

    // 1. Validate Code
    const cleanCode = this.formData.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      this.codeError.set(true);
      hasError = true;
    }

    // 2. Validate Campaign Name
    if (!this.formData.campaignName.trim()) {
      this.campaignNameError.set(true);
      hasError = true;
    }

    // 3. Validate Discount Value
    const val = this.formData.discountValue;
    if (this.formData.discountType === 'percent') {
      if (val < 1 || val > 100) {
        this.discountValueError.set(true);
        hasError = true;
      }
    } else {
      if (val <= 0 && val !== 0) { 
        this.discountValueError.set(true);
        hasError = true;
      }
    }

    // 4. Validate Min Order Value
    if (this.formData.minOrderValue < 0) {
      this.minOrderValueError.set(true);
      hasError = true;
    }

    if (hasError) return;

    // Fallback default dates if empty
    const now = new Date();
    const startDateStr = this.formData.startDate ? new Date(this.formData.startDate).toISOString() : now.toISOString();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const endDateStr = this.formData.endDate ? new Date(this.formData.endDate).toISOString() : oneYearLater.toISOString();

    const payload = {
      code: cleanCode,
      discountType: this.formData.discountType,
      discountValue: this.formData.discountValue,
      minOrderValue: this.formData.minOrderValue,
      maxDiscountAmount: this.formData.maxDiscountAmount || undefined,
      // Gửi usageLimit lên backend (trước đây bị bỏ sót → coupon luôn vô hạn lượt).
      usageLimit: this.formData.usageLimit && this.formData.usageLimit > 0
        ? this.formData.usageLimit
        : undefined,
      startDate: startDateStr,
      endDate: endDateStr,
      isActive: this.formData.isActive
    };

    if (this.panelMode() === 'create') {
      this.adminApi.createCoupon(payload).subscribe({
        next: () => {
          this.toastService.success('Đã tạo coupon mới thành công!');
          this.loadVouchers();
          this.closePanel();
        },
        error: (err) => {
          console.error('[Coupons] Error creating coupon:', err);
          this.toastService.error('Mã giảm giá đã tồn tại hoặc dữ liệu không hợp lệ.');
        }
      });
    } else {
      // Edit
      this.adminApi.updateCoupon(this.formData.id, payload).subscribe({
        next: () => {
          this.toastService.success('Đã lưu thay đổi coupon thành công!');
          this.loadVouchers();
          this.closePanel();
        },
        error: (err) => {
          console.error('[Coupons] Error updating coupon:', err);
          this.toastService.error('Không thể cập nhật coupon.');
        }
      });
    }
  }
}
