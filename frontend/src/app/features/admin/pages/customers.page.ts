import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface MockCustomer {
  id: string;
  numId: number;
  fullName: string;
  initials: string;
  avatarColor: string;
  phone: string;
  joinedDate: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Member';
  points: number;
  totalSpent: number;
  isActive: boolean;
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: '1', numId: 1,
    fullName: 'Nguyễn Thanh Thảo', initials: 'NT', avatarColor: '#f5c842',
    phone: '0901234567', joinedDate: '24/05/2025',
    tier: 'Diamond', points: 328, totalSpent: 3284000, isActive: true,
  },
  {
    id: '2', numId: 2,
    fullName: 'Trần Minh Quân', initials: 'TM', avatarColor: '#f5c842',
    phone: '0987654321', joinedDate: '12/01/2026',
    tier: 'Gold', points: 185, totalSpent: 1850000, isActive: true,
  },
  {
    id: '3', numId: 3,
    fullName: 'Lê Thị Mai', initials: 'LM', avatarColor: '#d4edda',
    phone: '0912345678', joinedDate: '05/11/2025',
    tier: 'Silver', points: 148, totalSpent: 1485000, isActive: true,
  },
  {
    id: '4', numId: 4,
    fullName: 'Phạm Thanh Nam', initials: 'PN', avatarColor: '#f3f4f6',
    phone: '0356789012', joinedDate: '15/02/2026',
    tier: 'Silver', points: 68, totalSpent: 683000, isActive: false,
  },
  {
    id: '5', numId: 5,
    fullName: 'Hoàng Lan', initials: 'HL', avatarColor: '#d4edda',
    phone: '0934567890', joinedDate: '10/03/2026',
    tier: 'Silver', points: 53, totalSpent: 536000, isActive: true,
  },
  {
    id: '6', numId: 6,
    fullName: 'Vũ Duy', initials: 'VD', avatarColor: '#fff3cd',
    phone: '0976123456', joinedDate: '02/04/2026',
    tier: 'Bronze', points: 49, totalSpent: 497000, isActive: true,
  },
  {
    id: '7', numId: 7,
    fullName: 'Đặng Thu Hà', initials: 'ĐH', avatarColor: '#fff3cd',
    phone: '0988111222', joinedDate: '18/04/2026',
    tier: 'Bronze', points: 21, totalSpent: 218000, isActive: true,
  },
  {
    id: '8', numId: 8,
    fullName: 'Ngô Quốc Anh', initials: 'NA', avatarColor: '#fff3cd',
    phone: '0911222333', joinedDate: '30/04/2026',
    tier: 'Bronze', points: 19, totalSpent: 198000, isActive: true,
  },
  {
    id: '9', numId: 9,
    fullName: 'Bùi Thùy Linh', initials: 'BL', avatarColor: '#f5e6d3',
    phone: '0966333444', joinedDate: '05/05/2026',
    tier: 'Member', points: 8, totalSpent: 86000, isActive: true,
  },
  {
    id: '10', numId: 10,
    fullName: 'Đỗ Hoàng Long', initials: 'ĐL', avatarColor: '#f5e6d3',
    phone: '0922444555', joinedDate: '12/05/2026',
    tier: 'Member', points: 5, totalSpent: 50000, isActive: true,
  },
  {
    id: '11', numId: 11,
    fullName: 'Phạm Minh Trí', initials: 'MT', avatarColor: '#d4edda',
    phone: '0944123987', joinedDate: '15/05/2026',
    tier: 'Silver', points: 95, totalSpent: 950000, isActive: true,
  },
  {
    id: '12', numId: 12,
    fullName: 'Trần Thu Trang', initials: 'TT', avatarColor: '#fef3c7',
    phone: '0977456123', joinedDate: '20/05/2026',
    tier: 'Gold', points: 210, totalSpent: 2100000, isActive: true,
  },
  {
    id: '13', numId: 13,
    fullName: 'Lê Văn Đạt', initials: 'VĐ', avatarColor: '#f5e6d3',
    phone: '0988654321', joinedDate: '22/05/2026',
    tier: 'Member', points: 15, totalSpent: 150000, isActive: true,
  },
  {
    id: '14', numId: 14,
    fullName: 'Nguyễn Bích Ngọc', initials: 'BN', avatarColor: '#dbeafe',
    phone: '0933111222', joinedDate: '25/05/2026',
    tier: 'Diamond', points: 340, totalSpent: 3400000, isActive: true,
  },
  {
    id: '15', numId: 15,
    fullName: 'Vũ Hoài Nam', initials: 'HN', avatarColor: '#fff3cd',
    phone: '0911777888', joinedDate: '28/05/2026',
    tier: 'Bronze', points: 42, totalSpent: 420000, isActive: true,
  }
];

@Component({
  selector: 'app-admin-customers-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      
      <!-- Page Header -->
      <div style="margin-bottom: 24px;">
        <h1 style="font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800; color: #2b1a0f; margin: 0 0 6px;">
          Quản lý khách hàng
        </h1>
        <p style="margin: 0; font-size: 14.5px; color: #7a6555; font-weight: 500;">
          Xem và quản lý thông tin, thứ hạng, điểm tích lũy của khách hàng.
        </p>
      </div>

      <!-- Customers Table Card / Disclaimer -->
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
          Tính năng quản lý khách hàng chưa sẵn sàng
        </h2>
        <p style="color: #7a6555; font-size: 14px; max-width: 440px; margin: 0 auto; font-weight: 500; line-height: 1.6;">
          Dữ liệu tạm thời ẩn do Backend hiện tại chưa cung cấp các API endpoint phục vụ việc tra cứu và quản lý thông tin khách hàng.
        </p>
      </div>
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
export class AdminCustomersPage implements OnInit {
  private readonly router = inject(Router);

  readonly Math = Math;

  readonly customers = signal<MockCustomer[]>([]);
  readonly searchQuery = signal('');
  readonly filterTier = signal('');
  readonly filterPoints = signal('');
  readonly filterSpent = signal('');
  readonly filterStatus = signal('');

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly filteredCustomers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const tier = this.filterTier();
    const points = this.filterPoints();
    const spent = this.filterSpent();
    const status = this.filterStatus();

    return this.customers().filter(c => {
      if (q && !c.fullName.toLowerCase().includes(q) && !c.phone.includes(q)) return false;
      if (tier && c.tier !== tier) return false;
      if (points) {
        if (points === 'lt50' && c.points >= 50) return false;
        if (points === '50-150' && (c.points < 50 || c.points > 150)) return false;
        if (points === 'gt150' && c.points <= 150) return false;
      }
      if (spent) {
        const s = c.totalSpent;
        if (spent === 'lt500' && s >= 500000) return false;
        if (spent === '500-2000' && (s < 500000 || s > 2000000)) return false;
        if (spent === 'gt2000' && s <= 2000000) return false;
      }
      if (status === 'active' && !c.isActive) return false;
      if (status === 'locked' && c.isActive) return false;
      return true;
    });
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredCustomers().length / this.pageSize) || 1);
  
  readonly pagedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCustomers().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    // Read from localStorage to persist customer changes
    const stored = localStorage.getItem('webee_admin_customers');
    if (stored) {
      try {
        this.customers.set(JSON.parse(stored));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('webee_admin_customers', JSON.stringify(MOCK_CUSTOMERS));
    this.customers.set([...MOCK_CUSTOMERS]);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterTier.set('');
    this.filterPoints.set('');
    this.filterSpent.set('');
    this.filterStatus.set('');
    this.currentPage.set(1);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/admin/customers', id]);
  }

  toggleActive(c: MockCustomer): void {
    const list = this.customers().map(item =>
      item.id === c.id ? { ...item, isActive: !item.isActive } : item
    );
    this.customers.set(list);
    localStorage.setItem('webee_admin_customers', JSON.stringify(list));
  }

  getTierIcon(tier: string): string {
    const icons: Record<string, string> = {
      Diamond: '💎', Gold: '🎖️', Silver: '🥈', Bronze: '🥉', Member: '#',
    };
    return icons[tier] ?? '';
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

  formatMoney(val: number): string {
    return val.toLocaleString('vi-VN') + 'đ';
  }

  formatPhoneInactive(phone: string): string {
    if (!phone || phone === '---') return '---';
    return phone.substring(0, 4) + '***' + phone.slice(-3);
  }

  getPagesArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      arr.push(i);
    }
    return arr;
  }
}
