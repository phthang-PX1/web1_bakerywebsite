import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MOCK_CUSTOMERS } from './customers.page';

interface MockOrder {
  code: string;
  date: string;
  product: string;
  total: number;
  points: number;
  status: 'Hoàn thành' | 'Đang làm bánh' | 'Chờ xác nhận';
}

interface MockVoucher {
  code: string;
  description: string;
  expiresAt: string;
  isValid: boolean;
}

interface CustomerDetail {
  id: string;
  fullName: string;
  initials: string;
  phone: string;
  defaultAddress: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Member';
  points: number;
  multiplier: number;
  vouchersLeft: string;
  nextTierName: string;
  pointsToNext: number;
  nextTierTotal: number;
  totalSpent: number;
  orders: MockOrder[];
  vouchers: MockVoucher[];
}

const MOCK_DETAIL: Record<string, CustomerDetail> = {
  '1': {
    id: '1', fullName: 'Nguyễn Thanh Thảo', initials: 'NT',
    phone: '0901234567',
    defaultAddress: '45 Đường Nguyễn Đình Chiểu, Phường 2, Quận 3, TP. Hồ Chí Minh',
    tier: 'Diamond', points: 328, multiplier: 2.0, vouchersLeft: '5/tháng',
    nextTierName: 'Kim Cương Max', nextTierTotal: 400, pointsToNext: 72,
    totalSpent: 3284000,
    orders: [
      { code: '#WB-1001', date: '01/05/2026', product: 'Bánh Kem Dâu Tây', total: 350000, points: 35, status: 'Hoàn thành' },
      { code: '#WB-1015', date: '12/05/2026', product: 'Set Cupcake Hoa Oải Hương', total: 480000, points: 48, status: 'Hoàn thành' },
      { code: '#WB-1032', date: '20/05/2026', product: 'Bánh Mousse Nhãn', total: 650000, points: 65, status: 'Hoàn thành' },
      { code: '#WB-1045', date: '28/05/2026', product: 'Bánh Tiramisu Chocolate', total: 500000, points: 50, status: 'Hoàn thành' },
      { code: '#WB-1058', date: '05/06/2026', product: 'Bánh Cheesecake Chanh Dây', total: 420000, points: 42, status: 'Đang làm bánh' },
    ],
    vouchers: [
      { code: 'DIAMOND20', description: 'Giảm 20% cho tất cả bánh', expiresAt: '31/07/2026', isValid: true },
      { code: 'FREESHIP', description: 'Miễn phí vận chuyển nội thành', expiresAt: '15/07/2026', isValid: true },
    ],
  },
  '2': {
    id: '2', fullName: 'Trần Minh Quân', initials: 'TM',
    phone: '0987654321',
    defaultAddress: '123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP. Hồ Chí Minh',
    tier: 'Gold', points: 185, multiplier: 1.5, vouchersLeft: '3/tháng',
    nextTierName: 'Kim Cương', nextTierTotal: 300, pointsToNext: 115,
    totalSpent: 1850000,
    orders: [
      { code: '#WB-1024', date: '15/05/2026', product: 'Bánh Gato Trái Cây Nhỏ', total: 350000, points: 35, status: 'Hoàn thành' },
      { code: '#WB-1056', date: '02/06/2026', product: 'Bánh Tiramisu Truyền Thống', total: 500000, points: 50, status: 'Hoàn thành' },
      { code: '#WB-1089', date: '10/06/2026', product: 'Bánh Mousse Đào Đặc Biệt', total: 1000000, points: 100, status: 'Hoàn thành' },
      { code: '#WB-1102', date: '14/06/2026', product: 'Bánh Kem BKp Thuần Chay', total: 250000, points: 25, status: 'Đang làm bánh' },
      { code: '#WB-1115', date: '16/06/2026', product: 'Set Cupcake Đóng Hộp (x6)', total: 120000, points: 12, status: 'Chờ xác nhận' },
    ],
    vouchers: [
      { code: 'TRUNGTHU26', description: 'Giảm 15% cho bánh Trung Thu', expiresAt: '25/09/2026', isValid: true },
    ],
  },
  '3': {
    id: '3', fullName: 'Lê Thị Mai', initials: 'LM',
    phone: '0912345678',
    defaultAddress: '56 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    tier: 'Silver', points: 148, multiplier: 1.2, vouchersLeft: '2/tháng',
    nextTierName: 'Vàng', nextTierTotal: 200, pointsToNext: 52,
    totalSpent: 1485000,
    orders: [
      { code: '#WB-0998', date: '10/04/2026', product: 'Bánh Kem Sinh Nhật Socola', total: 420000, points: 42, status: 'Hoàn thành' },
      { code: '#WB-1012', date: '25/04/2026', product: 'Bánh Macaron Hỗn Hợp', total: 320000, points: 32, status: 'Hoàn thành' },
      { code: '#WB-1040', date: '08/05/2026', product: 'Bánh Chiffon Chanh', total: 280000, points: 28, status: 'Chờ xác nhận' },
    ],
    vouchers: [
      { code: 'SILVER10', description: 'Giảm 10% cho đơn từ 300k', expiresAt: '30/08/2026', isValid: true }
    ],
  },
};

// Fallback template for unlisted customers
function buildFallback(id: string): CustomerDetail {
  return { 
    id, fullName: 'Khách hàng #' + id, initials: 'KH', phone: '---', defaultAddress: '---',
    tier: 'Member' as const, points: 0, multiplier: 1.0, vouchersLeft: '0/tháng',
    nextTierName: 'Bronze', nextTierTotal: 30, pointsToNext: 30, totalSpent: 0,
    orders: [], vouchers: [] 
  };
}

@Component({
  selector: 'app-admin-customer-detail-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">

      @if (!customer()) {
        <!-- Empty state -->
        <div style="text-align: center; padding: 80px 24px;">
          <span style="font-size: 48px; display: block; margin-bottom: 12px;">👤</span>
          <p style="font-size: 16px; color: #7a6555; margin: 0 0 16px; font-weight: 600;">Không tìm thấy khách hàng.</p>
          <a routerLink="/admin/customers" style="color: #c96a2e; font-weight: 700; text-decoration: none; font-size: 14px;">
            ← Quay lại danh sách
          </a>
        </div>
      } @else {
        <!-- Breadcrumb / Quay lại -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13.5px; font-weight: 600;">
          <a routerLink="/admin/customers" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #ede8e2; background: #ffffff; color: #2b1a0f; text-decoration: none; transition: background 0.15s;" onmouseover="this.style.background='#fffbf7'" onmouseout="this.style.background='#ffffff'">
            ←
          </a>
          <a routerLink="/admin/customers" style="color: #7a6555; text-decoration: none;" onmouseover="this.style.color='#c96a2e'" onmouseout="this.style.color='#7a6555'">Quản lý khách hàng</a>
          <span style="color: #c9b090;">/</span>
          <span style="color: #2b1a0f;">Chi tiết hồ sơ</span>
        </div>
        <div class="dashboard-card" style="padding: 48px; text-align: center; border: 1.5px dashed #ede8e2; background: #fffbf7; border-radius: 16px; margin-bottom: 20px;">
          <div style="background: #fffcf9; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #ede8e2; margin: 0 auto 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7a6555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h2 style="font-family: 'Fraunces', serif; font-size: 20px; font-weight: 800; color: #2b1a0f; margin-bottom: 8px;">
            Chi tiết hồ sơ khách hàng chưa khả dụng
          </h2>
          <p style="color: #7a6555; font-size: 14px; max-width: 440px; margin: 0 auto; font-weight: 500; line-height: 1.6; margin-bottom: 24px;">
            Dữ liệu tạm thời ẩn do Backend hiện tại chưa cung cấp các API endpoint tra cứu chi tiết thông tin khách hàng.
          </p>
          <a routerLink="/admin/customers" style="color: #c96a2e; font-weight: 700; text-decoration: none; font-size: 14.5px;">
            ← Quay lại quản lý khách hàng
          </a>
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCustomerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly customer = signal<CustomerDetail | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/customers']);
      return;
    }

    // Try reading customer status from localStorage first (for active toggle alignment)
    let customersList: typeof MOCK_CUSTOMERS = [];
    const stored = localStorage.getItem('webee_admin_customers');
    if (stored) {
      try {
        customersList = JSON.parse(stored);
      } catch (e) {
        customersList = [];
      }
    } else {
      customersList = MOCK_CUSTOMERS;
    }

    const exists = customersList.find(c => c.id === id);

    if (MOCK_DETAIL[id]) {
      const details = { ...MOCK_DETAIL[id] };
      // Align status with list localStorage
      if (exists) {
        // If locked in local storage list, we mock it or update points
        details.fullName = exists.fullName;
        details.phone = exists.phone;
        details.tier = exists.tier;
        details.points = exists.points;
        details.totalSpent = exists.totalSpent;
      }
      this.customer.set(details);
    } else if (exists) {
      const fallback = buildFallback(id);
      fallback.fullName = exists.fullName;
      fallback.initials = exists.initials;
      fallback.phone = exists.phone;
      fallback.tier = exists.tier;
      fallback.points = exists.points;
      fallback.totalSpent = exists.totalSpent;
      this.customer.set(fallback);
    } else {
      this.customer.set(null);
    }
  }

  progressPct(): number {
    const c = this.customer();
    if (!c) return 0;
    const pct = (c.points / c.nextTierTotal) * 100;
    return Math.min(Math.round(pct), 100);
  }

  getTierIcon(tier: string): string {
    const map: Record<string, string> = {
      Diamond: '💎', Gold: '🎖️', Silver: '🥈', Bronze: '🥉', Member: '#',
    };
    return map[tier] ?? '';
  }

  getTierStyles(tier: string) {
    const styles: Record<string, { background: string; color: string; border: string }> = {
      Diamond: { background: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
      Gold: { background: '#fef3c7', color: '#92400e', border: '#fde68a' },
      Silver: { background: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
      Bronze: { background: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
      Member: { background: '#f5e6d3', color: '#7a3d18', border: '#e5c9a8' }
    };
    return styles[tier] || { background: '#f5e6d3', color: '#7a3d18', border: '#e5c9a8' };
  }

  getStatusStyles(status: string) {
    const styles: Record<string, { background: string; color: string }> = {
      'Hoàn thành': { background: '#dcfce7', color: '#15803d' },
      'Đang làm bánh': { background: '#dbeafe', color: '#2563eb' },
      'Chờ xác nhận': { background: '#fef3c7', color: '#92400e' }
    };
    return styles[status] || { background: '#f3f4f6', color: '#6b7280' };
  }

  formatMoney(val: number): string {
    return val.toLocaleString('vi-VN') + 'đ';
  }
}
